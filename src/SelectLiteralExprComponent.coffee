PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
R = React.createElement

moment = require 'moment'

ExprUtils = require('mwater-expressions').ExprUtils

DateTimePickerComponent = require './DateTimePickerComponent'
TextArrayComponent = require './TextArrayComponent'
IdLiteralComponent = require './IdLiteralComponent'

module.exports = class SelectLiteralExprComponent extends React.Component
  @propTypes:
    value: PropTypes.object   # Current expression value
    onChange: PropTypes.func.isRequired # Called with new expression
    onCancel: PropTypes.func.isRequired # Called to cancel

    schema: PropTypes.object.isRequired
    dataSource: PropTypes.object.isRequired

    # Props to narrow down choices
    table: PropTypes.string.isRequired # Current table
    types: PropTypes.array    # If specified, the types (value type) of expression required. e.g. ["boolean"]
    enumValues: PropTypes.array # Array of { id:, name: } of enum values that can be selected. Only when type = "enum"
    idTable: PropTypes.string # If specified the table from which id-type expressions must come
    refExpr: PropTypes.object     # expression to get values for (used for literals). This is primarily for text fields to allow easy selecting of literal values

  constructor: (props) ->
    super(props)

    @state = {
      value: props.value
      inputText: null   # Unparsed input text. Null if not used
      changed: false
      inputTextError: false
    }

    # Set input text to value if text/number
    if props.value and props.value.valueType in ['text', 'number']
      @state.inputText = "" + props.value.value

  componentDidMount: ->
    @inputComp?.focus()

  handleChange: (value) =>
    @setState(value: value, changed: true)

  handleDateSelected: (date) =>
    if date
      @setState(value: { type: "literal", valueType: "date", value: date.format("YYYY-MM-DD") }, changed: true)
    else
      @setState(value: null, changed: true)

  handleDateTimeSelected: (datetime) =>
    if datetime
      @setState(value: { type: "literal", valueType: "datetime", value: datetime.toISOString() }, changed: true)
    else
      @setState(value: null, changed: true)

  handleAccept: =>
    # Parse text value if text
    if @state.inputText?
      # Empty means no value
      if @state.inputText == ""
        @props.onChange(null)
        return

      # Prefer number over text if can be parsed as number
      if ((@props.value and @props.value.valueType == "number") or "number" in (@props.types or ['number'])) and @state.inputText.match(/^-?\d+(\.\d+)?$/)
        value = parseFloat(@state.inputText)
        @props.onChange({ type: "literal", valueType: "number", value: value })
      # If text
      else if (@props.value and @props.value.valueType == "text") or "text" in (@props.types or ['text'])
        @props.onChange({ type: "literal", valueType: "text", value: @state.inputText })
      # If id (only allow if idTable is explicit)
      else if "id" in (@props.types or ['id']) and @props.idTable
        @props.onChange({ type: "literal", valueType: "id", idTable: @props.idTable, value: @state.inputText })
      else
        # Set error condition
        @setState(inputTextError: true)
    else
      @props.onChange(@state.value)

  handleTextChange: (ev) =>
    @setState(inputText: ev.target.value, changed: true)

  # Render a text box for inputting text/number
  renderTextBox: ->
    return R 'div', className: (if @state.inputTextError then "has-error"),
      R 'input', 
        type: "text"
        className: "form-control"
        value: @state.inputText or ""
        onChange: @handleTextChange
        placeholder: "Enter value..."

  renderInput: ->
    expr = @state.value

    # Get current expression type
    exprUtils = new ExprUtils(@props.schema)
    exprType = exprUtils.getExprType(expr)

    # If text[], enumset or id literal, use special component
    if exprType == "text[]" or _.isEqual(@props.types, ["text[]"])
      return R(TextArrayComponent, 
        value: expr
        refExpr: @props.refExpr
        schema: @props.schema
        dataSource: @props.dataSource
        onChange: @handleChange)

    if exprType == "enum" or _.isEqual(@props.types, ["enum"])
      return R(EnumAsListComponent, 
        value: expr
        enumValues: @props.enumValues
        onChange: @handleChange)

    if exprType == "enumset" or _.isEqual(@props.types, ["enumset"])
      return R(EnumsetAsListComponent, 
        value: expr
        enumValues: @props.enumValues
        onChange: @handleChange)

    if exprType == "id" or _.isEqual(@props.types, ["id"]) and @props.idTable
      idTable = @props.idTable or exprUtils.getExprIdTable(expr)
      return R(IdLiteralComponent, 
        value: expr?.value
        idTable: idTable
        schema: @props.schema
        dataSource: @props.dataSource
        onChange: (value) => @handleChange(if value then { type: "literal", valueType: "id", idTable: idTable, value: value } else null))

    if exprType == "id[]" or _.isEqual(@props.types, ["id[]"]) and @props.idTable
      idTable = @props.idTable or exprUtils.getExprIdTable(expr)
      return R(IdLiteralComponent, 
        value: expr?.value
        idTable: idTable
        schema: @props.schema
        dataSource: @props.dataSource
        multi: true
        onChange: (value) => @handleChange(if value and value.length > 0 then { type: "literal", valueType: "id[]", idTable: idTable, value: value } else null))

    # If already text/number, or text/number accepted, render field
    if exprType in ['text', 'number'] or not @props.types or "text" in @props.types or "number" in @props.types 
      return @renderTextBox()

    # If date type, display control
    if (@props.value and @props.value.valueType == "date") or "date" in (@props.types or [])
      return R DateTimePickerComponent, 
        date: if @state.value then moment(@state.value.value, moment.ISO_8601)
        onChange: @handleDateSelected

    # If datetime type, display control
    if (@props.value and @props.value.valueType == "datetime") or "datetime" in (@props.types or [])
      return R DateTimePickerComponent, 
        date: if @state.value then moment(@state.value.value, moment.ISO_8601)
        timepicker: true
        onChange: @handleDateTimeSelected

    return R 'div', className: "text-warning", "Literal input not supported for this type"
    
  render: ->
    R 'div', null,
      R 'div', style: { paddingBottom: 10 }, 
        R 'button', type: "button", className: "btn btn-primary", onClick: @handleAccept, disabled: not @state.changed,
          R 'i', className: "fa fa-check"
          " OK"
        " "
        R 'button', type: "button", className: "btn btn-default", onClick: @props.onCancel,
          "Cancel"
      @renderInput()

# Component which displays an enum as a list
class EnumAsListComponent extends React.Component
  @propTypes: 
    value: PropTypes.object
    onChange: PropTypes.func.isRequired 
    enumValues: PropTypes.array.isRequired # Array of id and name (localized string)

  @contextTypes:
    locale: PropTypes.string  # e.g. "en"

  handleChange: (val) =>
    if not val
      @props.onChange(null)
    else
      @props.onChange({ type: "literal", valueType: "enum", value: val })

  render: ->
    value = @props.value?.value

    itemStyle = {
      padding: 4
      marginLeft: 5
      borderRadius: 4
      cursor: "pointer"
    }

    R 'div', null,
      _.map @props.enumValues, (val) => 
        R 'div', key: val.id, className: "hover-grey-background", style: itemStyle, onClick: @handleChange.bind(null, val.id),
          if val.id == value
            R 'i', className: "fa fa-fw fa-check", style: { color: "#2E6DA4" }
          else
            R 'i', className: "fa fa-fw"
          " "
          ExprUtils.localizeString(val.name, @context.locale)

# Component which displays an enumset as a list
class EnumsetAsListComponent extends React.Component
  @propTypes: 
    value: PropTypes.object
    onChange: PropTypes.func.isRequired 
    enumValues: PropTypes.array.isRequired # Array of id and name (localized string)

  @contextTypes:
    locale: PropTypes.string  # e.g. "en"

  handleToggle: (val) =>
    items = @props.value?.value or []
    if val in items
      items = _.without(items, val)
    else
      items = items.concat([val])

    if items.length == 0
      @props.onChange(null)
    else
      @props.onChange({ type: "literal", valueType: "enumset", value: items })

  render: ->
    items = @props.value?.value or []

    itemStyle = {
      padding: 4
      marginLeft: 5
      borderRadius: 4
      cursor: "pointer"
    }

    R 'div', null,
      _.map @props.enumValues, (val) => 
        R 'div', key: val.id, className: "hover-grey-background", style: itemStyle, onClick: @handleToggle.bind(null, val.id),
          if val.id in items
            R 'i', className: "fa fa-fw fa-check-square", style: { color: "#2E6DA4" }
          else
            R 'i', className: "fa fa-fw fa-square", style: { color: "#DDDDDD" }
          " "
          ExprUtils.localizeString(val.name, @context.locale)

# Component which displays an enum dropdown
class EnumComponent extends React.Component
  @propTypes: 
    value: PropTypes.object
    onChange: PropTypes.func.isRequired 
    enumValues: PropTypes.array.isRequired # Array of id and name (localized string)

  @contextTypes:
    locale: PropTypes.string  # e.g. "en"

  handleChange: (val) =>
    if not val
      @props.onChange(null)
    else
      @props.onChange({ type: "literal", valueType: "enum", value: JSON.parse(val) })

  render: ->
    value = @props.value.value

    # Use JSON to allow non-strings as ids
    options = _.map(@props.enumValues, (val) => { value: JSON.stringify(val.id), label: ExprUtils.localizeString(val.name, @context.locale) })
    R 'div', style: { width: "100%" },
      React.createElement(ReactSelect, { 
        value: value
        multi: false
        options: options 
        onChange: @handleChange
      })

