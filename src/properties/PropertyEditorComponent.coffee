PropTypes = require('prop-types')
React = require 'react'
R = React.createElement
_ = require 'lodash'

ui = require 'react-library/lib/bootstrap'

LocalizedStringEditorComp = require '../LocalizedStringEditorComp'
ExprComponent = require '../ExprComponent'
ExprUtils = require('mwater-expressions').ExprUtils
IdFieldComponent = require './IdFieldComponent'
JoinEditorComponent = require('./JoinEditorComponent').JoinEditorComponent

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
    variables: PropTypes.array # Variables that may be used in expressions 
    
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
          if _.includes(@props.features, "dataurlType")
            R 'option', key: "dataurl", value: "dataurl", "Data URL (inline file storage)"
      if @props.property.type in ["enum", "enumset"]
        R ui.FormGroup, label: "Values",
          R EnumValuesEditorComponent, value: @props.property.enumValues, onChange: ((value) => @props.onChange(_.extend({}, @props.property, enumValues: value)))
      
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
            variables: @props.variables
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
            variables: @props.variables
            onChange: (conditionExpr) => @props.onChange(_.extend({}, @props.property, conditionExpr: conditionExpr))

      if @props.property.type == "join"
        R ui.FormGroup, label: "Join",
          R JoinEditorComponent, 
            join: @props.property.join, 
            onChange: ((join) => @props.onChange(_.extend({}, @props.property, join: join)))
            schema: @props.schema
            fromTableId: @props.property.table or @props.table
      
      if @props.property.type in ["id", "id[]"]
        R ui.FormGroup, label: "ID Table",
          R TableSelectComponent, value: @props.property.idTable, schema: @props.schema, onChange: ((table) => @props.onChange(_.extend({}, @props.property, idTable: table))),
      
      if _.includes(@props.features, "required")
        R ui.Checkbox, value: @props.property.required, onChange: ((value) => @props.onChange(_.extend({}, @props.property, required: value))),
          "Required"

      R ui.Checkbox,
        value: @props.property.deprecated
        onChange: ((deprecated) => @props.onChange(_.extend({}, @props.property, deprecated: deprecated))),
          "Deprecated"

      if _.includes(@props.features, "uniqueCode") and @props.property.type == "text"
        R ui.Checkbox, value: @props.property.uniqueCode, onChange: ((value) => @props.onChange(_.extend({}, @props.property, uniqueCode: value))),
          "Unique Code"

      if _.includes(@props.features, "unique") and @props.property.type in ["text", "id"]
        R ui.Checkbox, value: @props.property.unique, onChange: ((value) => @props.onChange(_.extend({}, @props.property, unique: value))),
          "Unique Value"

      if _.includes(@props.features, "indexed") and @props.property.type in ["text", "id", "number", "enum"]
        R ui.Checkbox, value: @props.property.indexed, onChange: ((value) => @props.onChange(_.extend({}, @props.property, indexed: value))),
          "Indexed (improves query speed, but slows updates)"

      if _.includes(@props.features, "onDelete") and @props.property.type in ["id"]
        R ui.FormGroup, label: "On Delete",
          R ui.Select, 
            value: @props.property.onDelete or null,
            nullLabel: "No Action"
            onChange: ((value) => @props.onChange(_.extend({}, @props.property, onDelete: value or undefined)))
            options: [
              { label: "Cascade", value: "cascade" }
              { label: "Set Null", value: "set_null" }
            ]

      if _.includes(@props.features, "sql")
        R ui.FormGroup, label: "SQL", hint: "Use {alias} for the table alias",
          R 'input', type: 'text', className: "form-control", value: @props.property.sql, onChange: ((ev) => @props.onChange(_.extend({}, @props.property, sql: ev.target.value)))

      if _.includes(@props.features, "reverseSql")
        R ui.FormGroup, label: "Reverse SQL", hint: "Use {value} for the value to convert",
          R 'input', type: 'text', className: "form-control", value: @props.property.reverseSql, onChange: ((ev) => @props.onChange(_.extend({}, @props.property, reverseSql: ev.target.value)))

      if @props.createRoleEditElem
        R ui.FormGroup, label: "Roles",
          @props.createRoleEditElem(@props.property.roles or [], (roles) => @props.onChange(_.extend({}, @props.property, roles: roles)) )

# Reusable table select Component
class TableSelectComponent extends React.Component
  @propTypes: 
    value: PropTypes.string  # The selected table
    schema: PropTypes.object.isRequired # schema of all data
    onChange: PropTypes.func.isRequired  # Called with new value
  
  render: ->
    options = _.sortBy(_.map(@props.schema.tables, (table) => { value: table.id, label: table.name[table.name._base or "en"] + " - " + table.id }), "value")
    return R ui.Select, 
      value: @props.value
      onChange: @props.onChange
      nullLabel: "Select table"
      options: options

# Edits a list of enum values
class EnumValuesEditorComponent extends React.Component
  @propTypes: 
    value: PropTypes.array  # Array of enum values to edit
    onChange: PropTypes.func.isRequired  # Called with new value

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

  handleMoveUp: (i) =>
    value = (@props.value or []).slice()
    temp = value[i - 1]
    value[i - 1] = value[i]
    value[i] = temp
    @props.onChange(value)    

  handleMoveDown: (i) =>
    value = (@props.value or []).slice()
    temp = value[i + 1]
    value[i + 1] = value[i]
    value[i] = temp
    @props.onChange(value)    

  render: ->
    items = @props.value or []
    R 'div', null,
      _.map items, (value, i) =>
        R EnumValueEditorComponent, 
          key: i, 
          value: value, 
          onChange: @handleChange.bind(null, i), 
          onRemove: @handleRemove.bind(null, i),
          onMoveUp: (if i > 0 then @handleMoveUp.bind(null, i)),
          onMoveDown: (if i < items.length - 1 then @handleMoveDown.bind(null, i)),

      R 'button', type: "button", className: "btn btn-link", onClick: @handleAdd,
        "+ Add Value"    

# Edits an enum value (id, name)
class EnumValueEditorComponent extends React.Component
  @propTypes: 
    value: PropTypes.object 
    onChange: PropTypes.func.isRequired  # Called with new value
    onRemove: PropTypes.func
    onMoveUp: PropTypes.func
    onMoveDown: PropTypes.func

  render: ->
    R 'div', className: "panel panel-default",
      R 'div', className: "panel-body",
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
        R 'div', className: "row", style: { float: "right" },
          if @props.onMoveUp
            R 'button', className: "btn btn-link btn-xs", onClick: @props.onMoveUp, 
              "Move Up"
          if @props.onMoveDown
            R 'button', className: "btn btn-link btn-xs", onClick: @props.onMoveDown, 
              "Move Down"
          if @props.onRemove
            R 'button', className: "btn btn-link btn-xs", onClick: @props.onRemove, 
              "Remove"


    
