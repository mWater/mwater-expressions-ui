React = require 'react'
R = React.createElement
H = React.DOM
_ = require 'lodash'
className = require 'classnames'

LocalizedStringEditorComp = require '../LocalizedStringEditorComp'
ExprComponent = require '../ExprComponent'

# edit properties
module.exports = class PropertyListEditorComponent extends React.Component
  @propTypes:
    property: React.PropTypes.object.isRequired # The property being edited
    onChange: React.PropTypes.func.isRequired # Function called when anything is changed in the editor
    features: React.PropTypes.array # Features to be enabled apart from the default features
    schema: React.PropTypes.object.isRequired # schema of all data
    dataSource: React.PropTypes.object.isRequired # data source
    table: React.PropTypes.string.isRequired    # Table that properties are of
    createRoleEditElem: React.PropTypes.func
    
  @defaultProps:
    features: []
    
  @features:
    sql: "sql"
    idField: "idField"
    uniqueCode: "uniqueCode"
    idType: "idType"
    joinType: "joinType"
  
  render: ->
    H.div null,
      # todo: validate id
      if _.includes @props.features, PropertyListEditorComponent.features.idField
        R IdFieldComponent, 
          value: @props.property._id
          onChange: (value) => @props.onChange(_.extend({}, @props.property, _id: value))
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
          # H.option key: "id", value: "id", "Reference"
          H.option key: "expr", value: "expr", "Expression"
          if _.includes @props.features, PropertyListEditorComponent.features.idType
            H.option key: "id", value: "id", "Reference"
          if _.includes @props.features, PropertyListEditorComponent.features.joinType
            H.option key: "join", value: "join", "Join"
      if @props.property.type in ["enum", "enumset"]
        R FormGroupComponent, label: "Values",
          # todo: This is visually confusing
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
          R JoinEditorComponent, value: @props.property.join, schema: @props.schema, onChange: ((join) => @props.onChange(_.extend({}, @props.property, join: join)))
      
      if @props.property.type == "id"
        R FormGroupComponent, label: "ID Table",
          R TableSelectComponent, value: @props.property.idTable, schema: @props.schema, onChange: ((table) => @props.onChange(_.extend({}, @props.property, idTable: table))),
      
      R FormGroupComponent, label: "Deprecated",
        H.input type: 'checkbox', checked: @props.property.deprecated, onChange: ((ev) => @props.onChange(_.extend({}, @props.property, deprecated: ev.target.checked)))
      
      if _.includes @props.features, PropertyListEditorComponent.features.uniqueCode and @props.property.type == "text"
        R FormGroupComponent, label: "Unique Code?",
          H.input type: 'checkbox', checked: @props.property.uniqueCode, onChange: ((ev) => @props.onChange(_.extend({}, @props.property, uniqueCode: ev.target.checked)))
      
      if _.includes @props.features, PropertyListEditorComponent.features.sql
        R FormGroupComponent, label: "SQL",
          H.input type: 'text', className: "form-control", value: @props.property.sql, onChange: ((ev) => @props.onChange(_.extend({}, @props.property, sql: ev.target.value)))
      
      if @props.createRoleEditElem
        R FormGroupComponent, label: "Roles",
          @props.createRoleEditElem(@props.property._roles or [], (roles) => @props.onChange(_.extend({}, @props.property, _roles: roles)) )
      
      # H.pre null, JSON.stringify(@props.property, null, 2)

class IdFieldComponent extends React.Component
  @propTypes: 
    value: React.PropTypes.string  # The value
    onChange: React.PropTypes.func.isRequired  # Called with new value
    
  constructor: (props) ->
    super(props)
    @state = {
      value: @props.value
      valid: @isValid(props.value)
    }
    
  isValid: (string) =>
    return /^[a-z\-]+$/.test(string)
    
  handleChange: (ev) =>
    @setState(value:ev.target.value, valid: @isValid(ev.target.value))  
    
    if @state.valid
      @props.onChange(ev.target.value)
    
  render: ->
    R FormGroupComponent, label: "ID", hasErrors: not @state.valid,
      H.input type: "text", className: "form-control", value: @state.value, onChange: @handleChange
      H.p className: "help-block", "Letters lowercase only."

# Edits join
class JoinEditorComponent extends React.Component
  @propTypes: 
    value: React.PropTypes.object  # The join object
    schema: React.PropTypes.object.isRequired # schema of all data
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
          R FormGroupComponent, label: "To table",
            R TableSelectComponent, value: @props.value?.toTable, schema: @props.schema, onChange: ((table) => @props.onChange(_.extend({}, @props.value, toTable: table))),
        H.div className: "col-md-12",
          R FormGroupComponent, label: "From Column",
            H.input type: 'text', className: "form-control", value: @props.value?.fromColumn, onChange: ((ev) => @props.onChange(_.extend({}, @props.value, fromColumn: ev.target.value)))
        H.div className: "col-md-12",
          R FormGroupComponent, label: "To Column",
            H.input type: 'text', className: "form-control", value: @props.value?.toColumn, onChange: ((ev) => @props.onChange(_.extend({}, @props.value, toColumn: ev.target.value)))
            # R LocalizedStringEditorComp, value: @props.value.name, onChange: (value) => @props.onChange(_.extend({}, @props.value, type: value))

# reusable table select Component
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

  render: ->
    H.div null,
      _.map @props.value or [], (value, i) =>
        R EnumValueEditorComponent, key: i, value: value, onChange: @handleChange.bind(null, i)
      H.button type: "button", className: "btn btn-link", onClick: @handleAdd,
        "+ Add Value"    

# Edits an enum value (id, name)
class EnumValueEditorComponent extends React.Component
  @propTypes: 
    value: React.PropTypes.object 
    onChange: React.PropTypes.func.isRequired  # Called with new value

  render: ->
    H.div null,
      H.div className: "row",
        H.div className: "col-md-6",
          R IdFieldComponent, 
            value: @props.value.id
            onChange: (value) => @props.onChange(_.extend({}, @props.value, id: value))
          # R FormGroupComponent, label: "ID",
          #   H.input 
          #     type: "text"
          #     className: "form-control"
          #     placeholder: "ID"
          #     style: { width: "10em" }
          #     value: @props.value.id
          #     onChange: (ev) => @props.onChange(_.extend({}, @props.value, id: ev.target.value))
          #   H.p className: "help-block", "Letters lowercase only."
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

    
class FormGroupComponent extends React.Component
  render: ->
    classes = {
      "form-group": true
      "has-error": @props.hasErrors
      "has-warning": @props.hasWarnings
      "has-success": @props.hasSuccess
    }
    H.div className: className(classes),
      H.label null, @props.label
      @props.children
