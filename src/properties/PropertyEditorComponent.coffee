PropTypes = require('prop-types')
React = require 'react'
R = React.createElement
H = React.DOM
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
    H.div null,
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
            H.div className: "alert alert-danger",
              "Duplicate IDs not allowed"
        ]

      if _.includes(@props.features, "code")
        R ui.FormGroup, label: "Code",
          H.input type: "text", className: "form-control", value: @props.property.code, onChange: (ev) => @props.onChange(_.extend({}, @props.property, code: ev.target.value))
      R ui.FormGroup, label: "Name",
        R LocalizedStringEditorComp, value: @props.property.name, onChange: (value) => @props.onChange(_.extend({}, @props.property, name: value))
      R ui.FormGroup, label: "Description",
        R LocalizedStringEditorComp, value: @props.property.desc, onChange: (value) => @props.onChange(_.extend({}, @props.property, desc: value))
      R ui.FormGroup, label: "Type",
        H.select className: "form-control", value: @props.property.type, onChange: ((ev) => @props.onChange(_.extend({}, @props.property, type: ev.target.value))),
          H.option key: "", value: "", ""
          H.option key: "text", value: "text", "Text"
          H.option key: "number", value: "number", "Number"
          H.option key: "boolean", value: "boolean", "Boolean"
          H.option key: "geometry", value: "geometry", "Geometry"
          H.option key: "enum", value: "enum", "Enum"
          H.option key: "enumset", value: "enumset", "Enum Set"
          H.option key: "date", value: "date", "Date"
          H.option key: "datetime", value: "datetime", "Datetime"
          H.option key: "text[]", value: "text[]", "Text Array"
          H.option key: "image", value: "image", "Image"
          H.option key: "imagelist", value: "imagelist", "Imagelist"
          H.option key: "json", value: "json", "JSON"
          if _.includes(@props.features, "idType") and @props.schema
            H.option key: "id", value: "id", "Reference"
          if _.includes(@props.features, "idType") and @props.schema
            H.option key: "id[]", value: "id[]", "Reference List"
          if _.includes(@props.features, "joinType")
            H.option key: "join", value: "join", "Join"
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
            aggrStatuses: ["individual", "aggregate", "literal"]
            onChange: (expr) => @props.onChange(_.extend({}, @props.property, expr: expr))
      
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
          H.input type: 'checkbox', checked: @props.property.uniqueCode, onChange: ((ev) => @props.onChange(_.extend({}, @props.property, uniqueCode: ev.target.checked)))
      
      if _.includes(@props.features, "sql")
        R ui.FormGroup, label: "SQL",
          H.input type: 'text', className: "form-control", value: @props.property.sql, onChange: ((ev) => @props.onChange(_.extend({}, @props.property, sql: ev.target.value)))
      
      if @props.createRoleEditElem
        R ui.FormGroup, label: "Roles",
          @props.createRoleEditElem(@props.property.roles or [], (roles) => @props.onChange(_.extend({}, @props.property, roles: roles)) )


# Edits join
class JoinEditorComponent extends React.Component
  @propTypes: 
    value: PropTypes.object  # The join object
    onChange: PropTypes.func.isRequired  # Called with new value
  
  render: ->
    H.div null,
      H.div className: "row",
        H.div className: "col-md-12",
          R ui.FormGroup, label: "Type",
            H.select className: "form-control", value: @props.value?.type, onChange: ((ev) => @props.onChange(_.extend({}, @props.value, type: ev.target.value))),
              H.option key: "", value: "", ""
              H.option key: "1-n", value: "1-n", "One to many"
              H.option key: "n-1", value: "n-1", "Many to one"
              H.option key: "n-n", value: "n-n", "Many to many"
              H.option key: "1-1", value: "1-1", "one to one"
        H.div className: "col-md-12",
          R ui.FormGroup, label: "To Table",
            H.input type: 'text', className: "form-control", value: @props.value?.toTable, onChange: ((ev) => @props.onChange(_.extend({}, @props.value, toTable: ev.target.value)))
        H.div className: "col-md-12",
          R ui.FormGroup, label: "From Column",
            H.input type: 'text', className: "form-control", value: @props.value?.fromColumn, onChange: ((ev) => @props.onChange(_.extend({}, @props.value, fromColumn: ev.target.value)))
        H.div className: "col-md-12",
          R ui.FormGroup, label: "To Column",
            H.input type: 'text', className: "form-control", value: @props.value?.toColumn, onChange: ((ev) => @props.onChange(_.extend({}, @props.value, toColumn: ev.target.value)))

# Reusable table select Component
class TableSelectComponent extends React.Component
  @propTypes: 
    value: PropTypes.string  # The selected table
    schema: PropTypes.object.isRequired # schema of all data
    onChange: PropTypes.func.isRequired  # Called with new value
  
  render: ->
    H.select className: "form-control", value: @props.value, onChange: ((ev) => @props.onChange(ev.target.value)),
      _.map @props.schema.tables, (table) =>
        H.option key: table.id, value: table.id, table.name[table.name._base or "en"]

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

  render: ->
    H.div null,
      _.map @props.value or [], (value, i) =>
        R EnumValueEditorComponent, key: i, value: value, onChange: @handleChange.bind(null, i), onRemove: @handleRemove.bind(null, i)
      H.button type: "button", className: "btn btn-link", onClick: @handleAdd,
        "+ Add Value"    

# Edits an enum value (id, name)
class EnumValueEditorComponent extends React.Component
  @propTypes: 
    value: PropTypes.object 
    onChange: PropTypes.func.isRequired  # Called with new value
    onRemove: PropTypes.func

  render: ->
    H.div null,
      H.div className: "row",
        H.div className: "col-md-6",
          R IdFieldComponent, 
            value: @props.value.id
            onChange: (value) => @props.onChange(_.extend({}, @props.value, id: value))

        H.div className: "col-md-6",
          R ui.FormGroup, label: "Code",
            H.input 
              type: "text"
              className: "form-control"
              placeholder: "Code"
              style: { width: "10em" }
              value: @props.value.code
              onChange: (ev) => @props.onChange(_.extend({}, @props.value, code: ev.target.value))
      H.div className: "row",
        H.div className: "col-md-12",
          R ui.FormGroup, label: "Name",
            R LocalizedStringEditorComp, value: @props.value.name, onChange: (value) => @props.onChange(_.extend({}, @props.value, name: value))
      H.div className: "row",
        H.div className: "col-md-12",
          R ui.FormGroup, label: "Description",
            R LocalizedStringEditorComp, value: @props.value.desc, onChange: (value) => @props.onChange(_.extend({}, @props.value, desc: value))
      if @props.onRemove
        H.div key: "remove",
          H.button className: "btn btn-link btn-xs", onClick: @props.onRemove, 
            "Remove"


    
