import _ from 'lodash'
import { Join, Schema, ExprUtils } from "mwater-expressions"
import { useState } from "react"
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

  // Determine if standard join (all fields exactly as 1-n to an existing id)
  const inverse = join && (join.type == "1-n") && join.toTable && join.inverse ? schema.getColumn(join.toTable, join.inverse) : null
  const fromTable = schema.getTable(fromTableId)
  const isStandard = join && inverse && fromTable && inverse.type == "id" && !inverse.jsonql && inverse.idTable == fromTableId
    && join.toColumn == inverse.id && join.fromColumn == fromTable.primaryKey && !join.jsonql

  /** Manual toggle to advanced mode */
  const [forceAdvanced, setForceAdvanced] = useState(false)

  const handleReset = () => {
    setForceAdvanced(false)
    onChange(undefined)
  }

  // Advanced mode if forced, or exists and is non-standard, or no from table
  if (forceAdvanced || !fromTable || (join && !isStandard)) {
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
      <FormGroup key="fromColumn" label="From Column">
        <TextInput
          value={partialJoin.fromColumn as string || ""}
          onChange={fromColumn => onChange(_.extend({}, partialJoin, { fromColumn: fromColumn }))}
        />
      </FormGroup>
      <FormGroup key="toColumn" label="To Column">
        <TextInput
          value={partialJoin.toColumn as string || ""}
          onChange={toColumn => onChange(_.extend({}, partialJoin, { toColumn: toColumn }))}
        />
      </FormGroup>
      <FormGroup key="inverse" label="Inverse. Column (schema, not physical) in 'To Table' that is the reverse of this join. Optional">
        <TextInput
          value={partialJoin.inverse || ""}
          onChange={inverse => onChange(_.extend({}, partialJoin, { inverse: inverse }))}
          emptyNull={true}
        />
      </FormGroup>
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
