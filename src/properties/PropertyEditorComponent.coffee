PropTypes = require('prop-types')
React = require 'react'
R = React.createElement
_ = require 'lodash'

ui = require 'react-library/lib/bootstrap'

LocalizedStringEditorComp = require '../LocalizedStringEditorComp'
ExprComponent = require '../ExprComponent'
ExprUtils = require('mwater-expressions').ExprUtils
IdFieldComponent = require './IdFieldComponent'

# Edit a single property
module.exports = class PropertyEditorComponent extends React.Component
  @propTypes:
    property: PropTypes.object.isRequired # The property being edited
    onChange: PropTypes.func.isRequired # Function called when anything is changed in the editor
    features: PropTypes.array # Features to be enabled apart from the default features
    schema: PropTypes.object   # schema of all data
    dataSource: PropTypes.object   # data source
    table: PropTypes.string    # Table that properties are of. Not required if table feature is on
    tableIds: PropTypes.arrayOf(PropTypes.string.isRequired)   # Ids of tables to include when using table feature
    createRoleEditElem: PropTypes.func
    forbiddenPropertyIds: PropTypes.arrayOf(PropTypes.string.isRequired) # Ids of properties that are not allowed as would be duplicates
    
  @defaultProps:
    features: []
    
  render: ->
    R 'div', null,
      if _.includes(@props.features, "table")
        R ui.FormGroup, label: "Table",
          R ui.Select,
            nullLabel: "Select..."
            value: @props.property.table
            onChange: (table) => @props.onChange(_.extend({}, @props.property, table: table))
            options: _.map(@props.tableIds, (tableId) =>
              table = @props.schema.getTable(tableId)
              return { value: table.id, label: ExprUtils.localizeString(table.name) }
            )

      if _.includes(@props.features, "idField")
        [
          R IdFieldComponent, 
            value: @props.property.id
            onChange: (value) => @props.onChange(_.extend({}, @props.property, id: value))
          if @props.forbiddenPropertyIds and @props.property.id in @props.forbiddenPropertyIds
            R 'div', className: "alert alert-danger",
              "Duplicate IDs not allowed"
        ]

      if _.includes(@props.features, "code")
        R ui.FormGroup, label: "Code",
          R 'input', type: "text", className: "form-control", value: @props.property.code, onChange: (ev) => @props.onChange(_.extend({}, @props.property, code: ev.target.value))
      R ui.FormGroup, label: "Name",
        R LocalizedStringEditorComp, value: @props.property.name, onChange: (value) => @props.onChange(_.extend({}, @props.property, name: value))
      R ui.FormGroup, label: "Description",
        R LocalizedStringEditorComp, value: @props.property.desc, onChange: (value) => @props.onChange(_.extend({}, @props.property, desc: value))
      R ui.FormGroup, label: "Type",
        R 'select', className: "form-control", value: @props.property.type, onChange: ((ev) => @props.onChange(_.extend({}, @props.property, type: ev.target.value))),
          R 'option', key: "", value: "", ""
          R 'option', key: "text", value: "text", "Text"
          R 'option', key: "number", value: "number", "Number"
          R 'option', key: "boolean", value: "boolean", "Boolean"
          R 'option', key: "geometry", value: "geometry", "Geometry"
          R 'option', key: "enum", value: "enum", "Enum"
          R 'option', key: "enum", value: "measurement", "Measurement"
          R 'option', key: "enumset", value: "enumset", "Enum Set"
          R 'option', key: "date", value: "date", "Date"
          R 'option', key: "datetime", value: "datetime", "Datetime"
          R 'option', key: "text[]", value: "text[]", "Text Array"
          R 'option', key: "image", value: "image", "Image"
          R 'option', key: "imagelist", value: "imagelist", "Imagelist"
          R 'option', key: "json", value: "json", "JSON"
          if _.includes(@props.features, "idType") and @props.schema
            R 'option', key: "id", value: "id", "Reference"
          if _.includes(@props.features, "idType") and @props.schema
            R 'option', key: "id[]", value: "id[]", "Reference List"
          if _.includes(@props.features, "joinType")
            R 'option', key: "join", value: "join", "Join"
      if @props.property.type in ["enum", "enumset"]
        R ui.FormGroup, label: "Values",
          R EnumValuesEditorComponent, value: @props.property.enumValues, onChange: ((value) => @props.onChange(_.extend({}, @props.property, enumValues: value)))
      
      if @props.property.type == "measurement"
        R ui.FormGroup, label: "Units",
          R EnumValuesEditorComponent, value: @props.property.units, actionLabel: "Add unit", onChange: ((value) => @props.onChange(_.extend({}, @props.property, enumValues: value)))

      if @props.property.type != "measurement"
        if _.includes(@props.features, "expr") and @props.property.type and (@props.property.table or @props.table)
          R ui.FormGroup, label: "Expression", hint: (if not @props.property.table then "Leave blank unless this property is an expression"), 
            R ExprComponent, 
              schema: @props.schema
              dataSource: @props.dataSource
              table: @props.property.table or @props.table
              value: @props.property.expr
              types: [@props.property.type]
              enumValues: @props.property.enumValues
              idTable: @props.property.idTable
              aggrStatuses: ["individual", "aggregate", "literal"]
              onChange: (expr) => @props.onChange(_.extend({}, @props.property, expr: expr))

      if _.includes(@props.features, "conditionExpr") and (@props.property.table or @props.table)
        R ui.FormGroup, label: "Condition", hint: "Set this if field should be conditionally displayed", 
          R ExprComponent, 
            schema: @props.schema
            dataSource: @props.dataSource
            table: @props.property.table or @props.table
            value: @props.property.conditionExpr
            types: ["boolean"]
            onChange: (conditionExpr) => @props.onChange(_.extend({}, @props.property, conditionExpr: conditionExpr))

      if @props.property.type == "join"
        R ui.FormGroup, label: "Join",
          R JoinEditorComponent, value: @props.property.join, onChange: ((join) => @props.onChange(_.extend({}, @props.property, join: join)))
      
      if @props.property.type in ["id", "id[]"]
        R ui.FormGroup, label: "ID Table",
          R TableSelectComponent, value: @props.property.idTable, schema: @props.schema, onChange: ((table) => @props.onChange(_.extend({}, @props.property, idTable: table))),
      
      R ui.Checkbox,
        value: @props.property.deprecated
        onChange: ((deprecated) => @props.onChange(_.extend({}, @props.property, deprecated: deprecated))),
          "Deprecated"
      
      if _.includes(@props.features, "uniqueCode") and @props.property.type == "text"
        R ui.FormGroup, label: "Unique Code?",
          R 'input', type: 'checkbox', checked: @props.property.uniqueCode, onChange: ((ev) => @props.onChange(_.extend({}, @props.property, uniqueCode: ev.target.checked)))
      
      if _.includes(@props.features, "sql")
        R ui.FormGroup, label: "SQL",
          R 'input', type: 'text', className: "form-control", value: @props.property.sql, onChange: ((ev) => @props.onChange(_.extend({}, @props.property, sql: ev.target.value)))
      
      if @props.createRoleEditElem
        R ui.FormGroup, label: "Roles",
          @props.createRoleEditElem(@props.property.roles or [], (roles) => @props.onChange(_.extend({}, @props.property, roles: roles)) )


# Edits join
class JoinEditorComponent extends React.Component
  @propTypes: 
    value: PropTypes.object  # The join object
    onChange: PropTypes.func.isRequired  # Called with new value
  
  render: ->
    R 'div', null,
      R 'div', className: "row",
        R 'div', className: "col-md-12",
          R ui.FormGroup, label: "Type",
            R 'select', className: "form-control", value: @props.value?.type, onChange: ((ev) => @props.onChange(_.extend({}, @props.value, type: ev.target.value))),
              R 'option', key: "", value: "", ""
              R 'option', key: "1-n", value: "1-n", "One to many"
              R 'option', key: "n-1", value: "n-1", "Many to one"
              R 'option', key: "n-n", value: "n-n", "Many to many"
              R 'option', key: "1-1", value: "1-1", "one to one"
        R 'div', className: "col-md-12",
          R ui.FormGroup, label: "To Table",
            R 'input', type: 'text', className: "form-control", value: @props.value?.toTable, onChange: ((ev) => @props.onChange(_.extend({}, @props.value, toTable: ev.target.value)))
        R 'div', className: "col-md-12",
          R ui.FormGroup, label: "From Column",
            R 'input', type: 'text', className: "form-control", value: @props.value?.fromColumn, onChange: ((ev) => @props.onChange(_.extend({}, @props.value, fromColumn: ev.target.value)))
        R 'div', className: "col-md-12",
          R ui.FormGroup, label: "To Column",
            R 'input', type: 'text', className: "form-control", value: @props.value?.toColumn, onChange: ((ev) => @props.onChange(_.extend({}, @props.value, toColumn: ev.target.value)))

# Reusable table select Component
class TableSelectComponent extends React.Component
  @propTypes: 
    value: PropTypes.string  # The selected table
    schema: PropTypes.object.isRequired # schema of all data
    onChange: PropTypes.func.isRequired  # Called with new value
  
  render: ->
    R 'select', className: "form-control", value: @props.value, onChange: ((ev) => @props.onChange(ev.target.value)),
      _.map @props.schema.tables, (table) =>
        R 'option', key: table.id, value: table.id, table.name[table.name._base or "en"]

# Edits a list of enum values
class EnumValuesEditorComponent extends React.Component
  @propTypes: 
    value: PropTypes.array  # Array of enum values to edit
    onChange: PropTypes.func.isRequired  # Called with new value
    actionLabel: PropTypes.string

  handleChange: (i, item) =>
    value = (@props.value or []).slice()
    value[i] = item
    @props.onChange(value)

  handleAdd: =>
    value = (@props.value or []).slice()
    value.push({ id: "", name: {} })
    @props.onChange(value)

  handleRemove: (i) =>
    value = (@props.value or []).slice()
    value.splice(i, 1)
    @props.onChange(value)    

  render: ->
    R 'div', null,
      _.map @props.value or [], (value, i) =>
        R EnumValueEditorComponent, key: i, value: value, onChange: @handleChange.bind(null, i), onRemove: @handleRemove.bind(null, i)
      R 'button', type: "button", className: "btn btn-link", onClick: @handleAdd,
        "+ #{@props.actionLabel or "Add Value"}"

# Edits an enum value (id, name)
class EnumValueEditorComponent extends React.Component
  @propTypes: 
    value: PropTypes.object 
    onChange: PropTypes.func.isRequired  # Called with new value
    onRemove: PropTypes.func

  render: ->
    R 'div', null,
      R 'div', className: "row",
        R 'div', className: "col-md-6",
          R IdFieldComponent, 
            value: @props.value.id
            onChange: (value) => @props.onChange(_.extend({}, @props.value, id: value))

        R 'div', className: "col-md-6",
          R ui.FormGroup, label: "Code",
            R 'input', 
              type: "text"
              className: "form-control"
              placeholder: "Code"
              style: { width: "10em" }
              value: @props.value.code
              onChange: (ev) => @props.onChange(_.extend({}, @props.value, code: ev.target.value))
      R 'div', className: "row",
        R 'div', className: "col-md-12",
          R ui.FormGroup, label: "Name",
            R LocalizedStringEditorComp, value: @props.value.name, onChange: (value) => @props.onChange(_.extend({}, @props.value, name: value))
      R 'div', className: "row",
        R 'div', className: "col-md-12",
          R ui.FormGroup, label: "Description",
            R LocalizedStringEditorComp, value: @props.value.desc, onChange: (value) => @props.onChange(_.extend({}, @props.value, desc: value))
      if @props.onRemove
        R 'div', key: "remove",
          R 'button', className: "btn btn-link btn-xs", onClick: @props.onRemove, 
            "Remove"


    
