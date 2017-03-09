React = require 'react'
R = React.createElement
H = React.DOM
_ = require 'lodash'

LocalizedStringEditorComp = require '../LocalizedStringEditorComp'
ExprComponent = require '../ExprComponent'
FormGroupComponent = require './FormGroupComponent'
IdFieldComponent = require './IdFieldComponent'

# edit properties
module.exports = class PropertyListEditorComponent extends React.Component
  @propTypes:
    property: React.PropTypes.object.isRequired # The property being edited
    onChange: React.PropTypes.func.isRequired # Function called when anything is changed in the editor
    features: React.PropTypes.array # Features to be enabled apart from the default features
    schema: React.PropTypes.object   # schema of all data
    dataSource: React.PropTypes.object   # data source
    table: React.PropTypes.string.isRequired    # Table that properties are of
    createRoleEditElem: React.PropTypes.func
    
  @defaultProps:
    features: []
    
  render: ->
    H.div null,
      if _.includes(@props.features, "idField")
        R IdFieldComponent, 
          value: @props.property.id
          onChange: (value) => @props.onChange(_.extend({}, @props.property, id: value))
      if _.includes(@props.features, "code")
        R FormGroupComponent, label: "Code",
          H.input type: "text", className: "form-control", value: @props.property.code, onChange: (ev) => @props.onChange(_.extend({}, @props.property, code: ev.target.value))
      R FormGroupComponent, label: "Name",
        R LocalizedStringEditorComp, value: @props.property.name, onChange: (value) => @props.onChange(_.extend({}, @props.property, name: value))
      R FormGroupComponent, label: "Description",
        R LocalizedStringEditorComp, value: @props.property.desc, onChange: (value) => @props.onChange(_.extend({}, @props.property, desc: value))
      R FormGroupComponent, label: "Type",
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
          if _.includes(@props.features, "exprType")
            H.option key: "expr", value: "expr", "Expression"
          if _.includes(@props.features, "idType") and @props.schema
            H.option key: "id", value: "id", "Reference"
          if _.includes(@props.features, "idType") and @props.schema
            H.option key: "id[]", value: "id[]", "Reference List"
          if _.includes(@props.features, "joinType")
            H.option key: "join", value: "join", "Join"
      if @props.property.type in ["enum", "enumset"]
        R FormGroupComponent, label: "Values",
          R EnumValuesEditorComponent, value: @props.property.enumValues, onChange: ((value) => @props.onChange(_.extend({}, @props.property, enumValues: value)))
      
      if @props.property.type == "expr"
        R FormGroupComponent, label: "Expression",
          R ExprComponent, 
            schema: @props.schema
            dataSource: @props.dataSource
            table: @props.table 
            value: @props.property.expr
            aggrStatuses: ["individual", "aggregate", "literal"]
            onChange: (expr) => @props.onChange(_.extend({}, @props.property, expr: expr))
      
      if @props.property.type == "join"
        R FormGroupComponent, label: "Join",
          R JoinEditorComponent, value: @props.property.join, onChange: ((join) => @props.onChange(_.extend({}, @props.property, join: join)))
      
      if @props.property.type in ["id", "id[]"]
        R FormGroupComponent, label: "ID Table",
          R TableSelectComponent, value: @props.property.idTable, schema: @props.schema, onChange: ((table) => @props.onChange(_.extend({}, @props.property, idTable: table))),
      
      R FormGroupComponent, label: "Deprecated",
        H.input type: 'checkbox', checked: @props.property.deprecated, onChange: ((ev) => @props.onChange(_.extend({}, @props.property, deprecated: ev.target.checked)))
      
      if _.includes @props.features, "uniqueCode" and @props.property.type == "text"
        R FormGroupComponent, label: "Unique Code?",
          H.input type: 'checkbox', checked: @props.property.uniqueCode, onChange: ((ev) => @props.onChange(_.extend({}, @props.property, uniqueCode: ev.target.checked)))
      
      if _.includes @props.features, "sql"
        R FormGroupComponent, label: "SQL",
          H.input type: 'text', className: "form-control", value: @props.property.sql, onChange: ((ev) => @props.onChange(_.extend({}, @props.property, sql: ev.target.value)))
      
      if @props.createRoleEditElem
        R FormGroupComponent, label: "Roles",
          @props.createRoleEditElem(@props.property.roles or [], (roles) => @props.onChange(_.extend({}, @props.property, roles: roles)) )


# Edits join
class JoinEditorComponent extends React.Component
  @propTypes: 
    value: React.PropTypes.object  # The join object
    onChange: React.PropTypes.func.isRequired  # Called with new value
  
  render: ->
    H.div null,
      H.div className: "row",
        H.div className: "col-md-12",
          R FormGroupComponent, label: "Type",
            H.select className: "form-control", value: @props.value?.type, onChange: ((ev) => @props.onChange(_.extend({}, @props.value, type: ev.target.value))),
              H.option key: "", value: "", ""
              H.option key: "1-n", value: "1-n", "One to many"
              H.option key: "n-1", value: "n-1", "Many to one"
              H.option key: "n-n", value: "n-n", "Many to many"
              H.option key: "1-1", value: "1-1", "one to one"
        H.div className: "col-md-12",
          R FormGroupComponent, label: "To Table",
            H.input type: 'text', className: "form-control", value: @props.value?.toTable, onChange: ((ev) => @props.onChange(_.extend({}, @props.value, toTable: ev.target.value)))
        H.div className: "col-md-12",
          R FormGroupComponent, label: "From Column",
            H.input type: 'text', className: "form-control", value: @props.value?.fromColumn, onChange: ((ev) => @props.onChange(_.extend({}, @props.value, fromColumn: ev.target.value)))
        H.div className: "col-md-12",
          R FormGroupComponent, label: "To Column",
            H.input type: 'text', className: "form-control", value: @props.value?.toColumn, onChange: ((ev) => @props.onChange(_.extend({}, @props.value, toColumn: ev.target.value)))

# Reusable table select Component
class TableSelectComponent extends React.Component
  @propTypes: 
    value: React.PropTypes.string  # The selected table
    schema: React.PropTypes.object.isRequired # schema of all data
    onChange: React.PropTypes.func.isRequired  # Called with new value
  
  render: ->
    H.select className: "form-control", value: @props.value, onChange: ((ev) => @props.onChange(ev.target.value)),
      _.map @props.schema.tables, (table) =>
        H.option key: table.id, value: table.id, table.name[table.name._base or "en"]

# Edits a list of enum values
class EnumValuesEditorComponent extends React.Component
  @propTypes: 
    value: React.PropTypes.array  # Array of enum values to edit
    onChange: React.PropTypes.func.isRequired  # Called with new value

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
    value: React.PropTypes.object 
    onChange: React.PropTypes.func.isRequired  # Called with new value
    onRemove: React.PropTypes.func

  render: ->
    H.div null,
      H.div className: "row",
        H.div className: "col-md-6",
          R IdFieldComponent, 
            value: @props.value.id
            onChange: (value) => @props.onChange(_.extend({}, @props.value, id: value))

        H.div className: "col-md-6",
          R FormGroupComponent, label: "Code",
            H.input 
              type: "text"
              className: "form-control"
              placeholder: "Code"
              style: { width: "10em" }
              value: @props.value.code
              onChange: (ev) => @props.onChange(_.extend({}, @props.value, code: ev.target.value))
      H.div className: "row",
        H.div className: "col-md-12",
          R FormGroupComponent, label: "Name",
            R LocalizedStringEditorComp, value: @props.value.name, onChange: (value) => @props.onChange(_.extend({}, @props.value, name: value))
      H.div className: "row",
        H.div className: "col-md-12",
          R FormGroupComponent, label: "Description",
            R LocalizedStringEditorComp, value: @props.value.desc, onChange: (value) => @props.onChange(_.extend({}, @props.value, desc: value))
      if @props.onRemove
        H.div key: "remove",
          H.button className: "btn btn-link btn-xs", onClick: @props.onRemove, 
            "Remove"


    
