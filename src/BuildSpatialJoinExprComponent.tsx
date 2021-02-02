import { DataSource, ExprUtils, LiteralType, localizeString, Schema, OldSpatialJoinExpr } from "mwater-expressions";
import React, { useState } from "react";
import ActionCancelModalComponent from 'react-library/lib/ActionCancelModalComponent'
import { FormGroup, NumberInput } from "react-library/lib/bootstrap"
import { TableSelectComponent } from "./TableSelectComponent";
import ExprComponent from './ExprComponent'
import FilterExprComponent from './FilterExprComponent'

/** Expression builder for a spatial join. Uses a popup for editing */
export const BuildSpatialJoinExprComponent = (props: {
  schema: Schema
  dataSource: DataSource
  value: OldSpatialJoinExpr
  types?: LiteralType[]
  onChange: (value: OldSpatialJoinExpr) => void
}) => {
  const value = props.value
  const fromTable = props.value.table ? props.schema.getTable(props.value.table) : null
  const toTable = props.value.toTable ? props.schema.getTable(props.value.toTable) : null
  const exprUtils = new ExprUtils(props.schema)

  const [editingValue, setEditingValue] = useState<OldSpatialJoinExpr>()

  function handleEdit() {
    setEditingValue(props.value)
  }

  function handleSave() {
    if (!editingValue!.toTable) {
      alert("To Data Source required")
      return
    }
    if (!editingValue!.fromGeometryExpr) {
      alert("From Location required")
      return
    }
    if (!editingValue!.toGeometryExpr) {
      alert("To Location required")
      return
    }
    if (!editingValue!.valueExpr) {
      alert("Calculated value required")
      return
    }
    if (!editingValue!.radiusExpr) {
      alert("Distance value required")
      return
    }
    props.onChange(editingValue!)
    setEditingValue(undefined) 
  }

  const configured = value.radiusExpr != null && value.toTable != null && value.toGeometryExpr != null && value.valueExpr != null && value.fromGeometryExpr != null

  return <div>
    { editingValue ? 
      <ActionCancelModalComponent
        onAction={handleSave}
        onCancel={() => {
          setEditingValue(undefined) 
        }}
      >
        <SpatialJoinPopupContents
          schema={props.schema}
          dataSource={props.dataSource}
          value={editingValue}
          onChange={setEditingValue}
          types={props.types}
        />
      </ActionCancelModalComponent>
    : null }
    <div>
      <b>Spatial join</b>&nbsp;
      <a onClick={handleEdit} style={{ cursor: "pointer" }}>
        { configured ? 
          <span><i className="fa fa-pencil"/> Edit</span>
        : <span><i className="fa fa-pencil"/> Configure</span> }
      </a>
    </div>
    { configured ? 
      <div style={{ marginLeft: 5 }}>
        <div><span className="text-muted">Distance:</span> {exprUtils.summarizeExpr(value.radiusExpr) } meters</div>
        <div style={{ paddingTop: 10 }}><b>From Table</b></div>
        <div><span className="text-muted">Data Source: </span>{ fromTable ? ExprUtils.localizeString(fromTable.name) : "Not defined" }</div>
        <div><span className="text-muted">Location: </span>{ exprUtils.summarizeExpr(value.fromGeometryExpr) }</div>
        <div style={{ paddingTop: 10 }}><b>To Table</b></div>
        <div><span className="text-muted">Data Source: </span>{ toTable ? ExprUtils.localizeString(toTable.name) : "Not defined" }</div>
        <div><span className="text-muted">Location: </span>{ exprUtils.summarizeExpr(value.toGeometryExpr) }</div>
        <div><span className="text-muted">Value:</span> { exprUtils.summarizeExpr(value.valueExpr) }</div>
        <div><span className="text-muted">Filters:</span> { exprUtils.summarizeExpr(value.filterExpr) }</div>
      </div>
     : null }
  </div>
}

/** Contents of popup to edit spatial join */
const SpatialJoinPopupContents = (props: {
  schema: Schema
  dataSource: DataSource
  value: OldSpatialJoinExpr
  types?: LiteralType[]
  onChange: (value: OldSpatialJoinExpr) => void
}) => {
  const value = props.value
  const exprUtils = new ExprUtils(props.schema)

  const fromTable = props.value.table ? props.schema.getTable(props.value.table) : null

  return <div>
    <h4>Spatial Join</h4>
    <div className="text-muted">Join data from one table to another including only those rows that are within a certain distance</div>

    <div className="panel panel-default">
      <div className="panel-heading">From Table - <span className="text-muted">Table from which join is made</span></div>
      <div className="panel-body">
        <FormGroup label="Data Source" hint="Data source to start join from">
          { fromTable ? localizeString(fromTable.name) : null}
        </FormGroup>

        { value.table ?
          <FormGroup label="Location" hint="GPS coordinates of from table">
            <ExprComponent
              table={value.table}
              schema={props.schema}
              dataSource={props.dataSource}
              value={value.fromGeometryExpr}
              types={["geometry"]}
              onChange={v => props.onChange({ ...value, fromGeometryExpr: v })}
            />        
          </FormGroup> 
        : null}
      </div>
    </div>

    {/* <FormGroup label="To Table" hint="Table to which join is made"> */}
    <div className="panel panel-default">
    <div className="panel-heading">To Table - <span className="text-muted">Table to which join is made</span></div>
      <div className="panel-body">
        <FormGroup label="Data Source" hint="Data source to join to based on distance">
          <TableSelectComponent
            schema={props.schema}
            value={value.toTable}
            onChange={v => props.onChange({ ...value, toTable: v })}
          />        
        </FormGroup>

        { value.toTable ?
          <FormGroup label="Location" hint="GPS coordinates of to table">
            <ExprComponent
              table={value.toTable}
              schema={props.schema}
              dataSource={props.dataSource}
              value={value.toGeometryExpr}
              types={["geometry"]}
              onChange={v => props.onChange({ ...value, toGeometryExpr: v })}
            />        
          </FormGroup> 
        : null}

        { value.toTable ?
          <FormGroup label="Calculated Value" help="Value in the To table that will be aggregated">
            <ExprComponent
              table={value.toTable}
              schema={props.schema}
              dataSource={props.dataSource}
              value={value.valueExpr}
              aggrStatuses={["aggregate"]}
              onChange={v => props.onChange({ ...value, valueExpr: v })}
            />        
          </FormGroup> 
        : null}

        { value.toTable ?
          <FormGroup label="Optional Filters" hint="Limits which rows are included in To table">
            <FilterExprComponent
              table={value.toTable}
              schema={props.schema}
              dataSource={props.dataSource}
              value={value.filterExpr}
              onChange={v => props.onChange({ ...value, filterExpr: v })}
            />        
          </FormGroup> 
        : null}
      </div>
    </div>

    <FormGroup label="Within a distance of... (meters)">
      <ExprComponent
        table={value.table}
        schema={props.schema}
        dataSource={props.dataSource}
        value={value.radiusExpr}
        types={["number"]}
        preferLiteral={true}
        onChange={v => props.onChange({ ...value, radiusExpr: v })}
      />        
    </FormGroup> 
  </div>
}