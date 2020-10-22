import _ from 'lodash'
import { Join, Schema, ExprUtils } from "mwater-expressions"
import { ChangeEvent, useState } from "react"
import React from "react"
import { FormGroup, Toggle, TextInput, Select } from 'react-library/lib/bootstrap'

/** Edits a join, preferring a simple inverse select dropdown, but allowing advanced mode */
export const JoinEditorComponent = (props: {
  join?: Join
  onChange: (join?: Partial<Join>) => void
  schema: Schema

  /** Table that join is from */
  fromTableId: string
}) => {
  const { join, onChange, schema, fromTableId } = props

  // Always present
  const partialJoin: Partial<Join> = join || {}

  // Determine if standard 1-n join (all fields exactly as 1-n to an existing id)
  const inverse = join && (join.type == "1-n") && join.toTable && join.inverse ? schema.getColumn(join.toTable, join.inverse) : null
  const fromTable = schema.getTable(fromTableId)
  const isStandard1toN = join && inverse && fromTable && inverse.type == "id" && !inverse.jsonql && inverse.idTable == fromTableId
    && join.toColumn == inverse.id && join.fromColumn == fromTable.primaryKey && !join.jsonql

  /** Manual toggle to advanced mode */
  const [forceAdvanced, setForceAdvanced] = useState(false)

  /** Manual toggle for JsonQL mode (very advanced joins) */
  const [forceJsonQLMode, setForceJsonQLMode] = useState(false)

  const handleReset = () => {
    setForceAdvanced(false)
    onChange(undefined)
  }

  // Determine if in JsonQL mode
  const jsonQLMode = forceJsonQLMode || (join && join.jsonql)

  // Advanced mode if forced, or exists and is non-standard, or no from table
  if (forceAdvanced || !fromTable || (join && !isStandard1toN)) {
    return <div>
      <button type="button" className="btn btn-xs btn-link" style={{ float: "right" }} onClick={handleReset}>Reset</button>
      <FormGroup key="type" label="Type">
        <Toggle
          value={partialJoin.type}
          options={[
            { value: "1-n", label: "One to many" },
            { value: "n-1", label: "Many to one" },
            { value: "n-n", label: "Many to many" },
            { value: "1-1", label: "one to one" }
          ]}
          onChange={type => onChange(_.extend({}, partialJoin, { type: type }))}
        />
      </FormGroup>
      <FormGroup key="toTable" label="To Table">
        <TextInput
          value={partialJoin.toTable || ""}
          onChange={toTable => onChange(_.extend({}, partialJoin, { toTable: toTable }))}
        />
      </FormGroup>
      { jsonQLMode ?
        <div>
          <button type="button" className="btn btn-xs btn-link" style={{ float: "right" }} onClick={() => {
            setForceJsonQLMode(false)
            onChange(_.omit(partialJoin, "jsonql"))
          }}>Normal Mode</button>
          <JsonQLEditor
            jsonql={partialJoin.jsonql}
            onChange={jsonql => { onChange(_.extend({}, partialJoin, { jsonql: jsonql }))}}
          />
        </div>
      :
        <div>
          <button type="button" className="btn btn-xs btn-link" style={{ float: "right" }} onClick={() => setForceJsonQLMode(true)}>JsonQL Mode</button>
          <FormGroup key="fromColumn" label="From Column" hint="JsonQL-level column, not schema column">
            <TextInput
              value={partialJoin.fromColumn as string || ""}
              onChange={fromColumn => onChange(_.extend({}, partialJoin, { fromColumn: fromColumn }))}
            />
          </FormGroup>
          <FormGroup key="toColumn" label="To Column" hint="JsonQL-level column, not schema column">
            <TextInput
              value={partialJoin.toColumn as string || ""}
              onChange={toColumn => onChange(_.extend({}, partialJoin, { toColumn: toColumn }))}
            />
          </FormGroup>
        </div>
      }
      { join && join.type == "1-n" ?
      <FormGroup key="inverse" label="Inverse. Column (schema, not physical) in 'To Table' that is the reverse of this join. Optional">
        <TextInput
          value={partialJoin.inverse || ""}
          onChange={inverse => onChange(_.extend({}, partialJoin, { inverse: inverse }))}
          emptyNull={true}
        />
      </FormGroup>
      : null }
    </div>
  }

  // --- Simple mode
  // Create list of inverses
  const inverseOptions: InverseOption[] = []
  for (const table of _.sortBy(schema.getTables(), t => ExprUtils.localizeString(t.name))) {
    for (const column of schema.getColumns(table.id)) {
      // If is simple id with idTable of this table
      if (column.type == "id" && column.idTable == fromTableId && !column.jsonql) {
        inverseOptions.push({ 
          value: { table: table.id, column: column.id }, 
          label: `Inverse of ${ExprUtils.localizeString(table.name)}: ${ExprUtils.localizeString(column.name)}` })
      }
    }
  }

  const handleSelectInverse = (value: { table: string, column: string }) => {
    props.onChange({
      type: "1-n",
      toTable: value.table,
      fromColumn: fromTable.primaryKey,
      toColumn: value.column,
      inverse: value.column
    })
  }

  return <div>
    <button type="button" className="btn btn-xs btn-link" style={{ float: "right" }} onClick={() => setForceAdvanced(true)}>Advanced</button>
    <Select
      options={inverseOptions}
      value={join ? { table: join.toTable, column: join.toColumn } : null}
      nullLabel="Select inverse"
      onChange={handleSelectInverse}
    />
  </div>
}

interface InverseOption {
  value: { table: string, column: string }
  label: string
}

function JsonQLEditor(props: {
  jsonql: any
  onChange: (jsonql: any) => void
}) {
  const [text, setText] = useState(() => {
    return props.jsonql ? JSON.stringify(props.jsonql, null, 2) : ""
  })

  function isValid(t: string) {
    if (!t) {
      return true
    }
    try {
      JSON.parse(t)
      return true
    } catch (err) {
      return false
    }
  }

  function handleChange(ev: ChangeEvent<HTMLTextAreaElement>) {
    const t = ev.target.value
    setText(t)

    // Attempt to parse
    if (isValid(t)) {
      props.onChange(t ? JSON.parse(t) : undefined)
    }
  }

  return <FormGroup label="JsonQL expression for join. Use {to} and {from} as table aliases">
    <textarea 
      rows={10} 
      className="form-control" 
      value={text} 
      onChange={handleChange} 
      style={ isValid(text) ? {} : { backgroundColor: "#FFEEEE" }}/>
  </FormGroup>
  
}