import { DataSource, ExprUtils, LiteralType, Schema, SpatialJoinExpr } from "mwater-expressions";
import React, { useState } from "react";
import ModalPopupComponent from 'react-library/lib/ModalPopupComponent'
import { FormGroup, NumberInput } from "react-library/lib/bootstrap"
import { TableSelectComponent } from "./TableSelectComponent";
import ExprComponent from './ExprComponent'
import FilterExprComponent from './FilterExprComponent'

/** Expression builder for a spatial join. Uses a popup for editing */
export const BuildSpatialJoinExprComponent = (props: {
  schema: Schema
  dataSource: DataSource
  value: SpatialJoinExpr
  types?: LiteralType[]
  onChange: (value: SpatialJoinExpr) => void
}) => {
  const value = props.value
  const toTable = props.value.toTable ? props.schema.getTable(props.value.toTable) : null
  const exprUtils = new ExprUtils(props.schema)

  const [editing, setEditing] = useState(false)

  function handleEdit() {
    setEditing(true)
  }

  return <div>
    { editing ? 
      <ModalPopupComponent
        onClose={() => setEditing(false) }
        showCloseX={true}
      >
        <SpatialJoinPopupContents
          schema={props.schema}
          dataSource={props.dataSource}
          value={props.value}
          onChange={props.onChange}
          types={props.types}
        />
      </ModalPopupComponent>
    : null }
    <div><span className="text-muted">Spation join to:</span> {toTable ? ExprUtils.localizeString(toTable.name) : "Not defined"}
    &nbsp;<a onClick={handleEdit} style={{ cursor: "pointer" }}><i className="fa fa-pencil"/> Edit</a></div>
    <div>
      <span className="text-muted">On: </span>
      { exprUtils.summarizeExpr(value.fromGeometryExpr) }
      <span className="text-muted"> : </span>
      { exprUtils.summarizeExpr(value.toGeometryExpr) }
    </div>
    <div><span className="text-muted">Radius:</span> {value.radius || ""} meters</div>
    <div><span className="text-muted">Value:</span> { exprUtils.summarizeExpr(value.valueExpr) }</div>
    <div><span className="text-muted">Filters:</span> { exprUtils.summarizeExpr(value.filterExpr) }</div>
  </div>
}

/** Contents of popup to edit spatial join */
const SpatialJoinPopupContents = (props: {
  schema: Schema
  dataSource: DataSource
  value: SpatialJoinExpr
  types?: LiteralType[]
  onChange: (value: SpatialJoinExpr) => void
}) => {
  const value = props.value
  const exprUtils = new ExprUtils(props.schema)

  return <div>
    <FormGroup label="Join to table">
      <TableSelectComponent
        schema={props.schema}
        value={value.toTable}
        onChange={v => props.onChange({ ...value, toTable: v })}
      />        
    </FormGroup>

    { value.toTable ?
      <FormGroup label="From Location">
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

    { value.toTable ?
      <FormGroup label="To Location">
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
      <FormGroup label="Maximum distance (meters)">
        <NumberInput
          value={value.radius}
          decimal={true}
          onChange={v => props.onChange({ ...value, radius: v })}
        />        
      </FormGroup> 
    : null}

    { value.toTable ?
      <FormGroup label="Calculated Value" help="Popup may close when setting this value. Re-open to complete">
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
      <FormGroup label="Optional Filters">
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
}