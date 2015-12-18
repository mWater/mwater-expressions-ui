_ = require 'lodash'
React = require 'react'
R = React.createElement
H = React.DOM
ClickOutHandler = require('react-onclickout')

ScalarExprTreeComponent = require './ScalarExprTreeComponent'
ScalarExprTreeBuilder = require './ScalarExprTreeBuilder'
DropdownComponent = require './DropdownComponent'
LinkComponent = require './LinkComponent'
DateTimepickerComponent = require './DateTimepickerComponent'
ExprUtils = require('mwater-expressions').ExprUtils


# Box component that allows selecting if statements, scalars and literals, all in one place
# Has a dropdown when needed and focused.
# It has two modes: literal and formula. If a literal is being edited, it is by default in literal mode
# When in literal mode, 
module.exports = class OmniBoxExprComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired

    table: React.PropTypes.string.isRequired # Current table
    value: React.PropTypes.object   # Current expression value
    onChange: React.PropTypes.func  # Called with new expression

    types: React.PropTypes.array    # If specified, the types (value type) of expression required. e.g. ["boolean"]
    enumValues: React.PropTypes.array # Array of { id:, name: } of enum values that can be selected. Only when type = "enum"

    noneLabel: React.PropTypes.string # What to display when no value. Default "Select..."
    initialMode: React.PropTypes.oneOf(['formula', 'literal']) # Initial mode. Default formula

    includeCount: React.PropTypes.bool # Optionally include count at root level of a table. Returns id expression

  @defaultProps:
    noneLabel: "Select..."
    initialMode: "formula"

  @contextTypes:
    locale: React.PropTypes.string  # e.g. "en"

  constructor: (props) ->
    super

    @state = {
      focused: false    # True if focused
      mode: props.initialMode  # Mode can be "literal" for literal entering or "formula" for scalar, etc. choosing
      inputText: ""     # Current input text
    }

    # Mode is literal if value is literal
    if props.value and props.value.type == "literal"
      @state.mode = "literal"
      @state.inputText = @stringifyLiteral(props, props.value)

    # Cannot display non-literals
    if props.value and props.value.type != "literal"
      throw new Error("Cannot display expression type #{props.value.type}")

  componentWillReceiveProps: (newProps) ->
    # Mode is literal if value is literal
    if newProps.value and newProps.value.type == "literal"
      @setState(mode: "literal", inputText: @stringifyLiteral(newProps, newProps.value))
    else
      @setState(mode: newProps.initialMode, inputText: "")

    # Cannot display non-literals
    if newProps.value and newProps.value.type != "literal"
      throw new Error("Cannot display expression type #{newProps.value.type}")

  stringifyLiteral: (props, literalExpr) ->
    # Handle enum
    if literalExpr and literalExpr.valueType == "enum"
      item = _.findWhere(props.enumValues, { id: literalExpr.value })
      if item 
        return ExprUtils.localizeString(item.name, @context.locale)
      return "???"

    if literalExpr and literalExpr.value?
      return "" + literalExpr.value
    return ""

  handleTextChange: (ev) => @setState(inputText: ev.target.value)

  handleFocus: => 
    if @state.focused
      return

    @setState(focused: true)

    # Clear input text if literal enum
    if @props.value and @props.value.valueType == "enum"
      @setState(inputText: "")

  handleBlur: => 
    if not @state.focused
      return

    @setState(focused: false)

    # Process literal if present
    if @state.mode == "literal"
      if (@props.value and @props.value.valueType == "number") or "number" in (@props.types or [])
        # Empty means no value
        if not @state.inputText
          if @props.value
            @props.onChange(null)
          return

        value = parseFloat(@state.inputText)
        if _.isFinite(value)
          @props.onChange({ type: "literal", valueType: "number", value: value })
      # If text
      else if (@props.value and @props.value.valueType == "text") or "text" in (@props.types or [])
        @props.onChange({ type: "literal", valueType: "text", value: @state.inputText })

  # Handle enter+tab key
  handleKeyDown: (ev) =>
    if ev.keyCode == 13 or ev.keyCode == 9
      @handleBlur()

  handleEnumSelected: (id) => 
    if id?
      @props.onChange({ type: "literal", valueType: "enum", value: id })
    else
      @props.onChange(null)
    @setState(focused: false)

  handleIfSelected: =>
    ifExpr = {
      type: "case"
      table: @props.table
      cases: [{ when: null, then: null }]
      else: null
    }
    @props.onChange(ifExpr)

  # Handle a selection in the scalar expression tree. Called with { table, joins, expr }
  handleTreeChange: (val) => 
    # Loses focus when selection made
    @setState(focused: false)

    # Make into expression
    if val.joins.length == 0 
      # Simple field expression
      @props.onChange(val.expr)
    else
      @props.onChange({ type: "scalar", table: @props.table, joins: val.joins, expr: val.expr })

  handleModeChange: (mode, ev) => 
    ev.stopPropagation()

    @refs.input.focus()

    # If in formula, clear text
    if mode == "formula"
      @setState(mode: mode, inputText: "", focused: true)
    else 
      @setState(mode: mode, inputText: @stringifyLiteral(@props, @props.value), focused: true)

  # renders mode switching link
  renderModeSwitcher: ->
    # If no value and no single type, can't be literal
    if (not @props.types or @props.types.length != 1) and not @props.value
      return

    # If in formula, render literal
    if @state.mode == "formula"
      if @props.types[0] == "number"
        label = "123"
      else if @props.types[0] in ["text", "enum", "enumset"]
        label = "abc"
      else
        return

      return H.a(onClick: @handleModeChange.bind(null, "literal"), H.i(null, label))
    else
      return H.a(onClick: @handleModeChange.bind(null, "formula"), H.i(null, "f", H.sub(null, "x")))


  handleDateSelected: (event) =>
    @setState(inputText: event.date.format("YYYY-MM-DD"), focused: false)

  handleDateTimeSelected: (event) =>
    @setState(inputText: event.date.format("YYYY-MM-DD HH-mm-ss"))

  renderLiteralDropdown: ->
    # If enum type, display dropdown
    if (@props.value and @props.value.valueType == "enum") or "enum" in (@props.types or [])
      # Escape regex for filter string
      escapeRegex = (s) -> return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
      if @state.inputText 
        filter = new RegExp(escapeRegex(@state.inputText), "i")

      dropdown = _.map @props.enumValues, (ev) =>
        name = ExprUtils.localizeString(ev.name, @context.locale)
        if filter and not name.match(filter)
          return null
        H.li key: ev.id, 
          H.a 
            onClick: @handleEnumSelected.bind(null, ev.id),
            name

      # Add none selection
      dropdown.unshift(H.li(key: "_null", H.a(onClick: @handleEnumSelected.bind(null, null), H.i(null, "None"))))
      return dropdown

    # If date type, display dropdown
    if (@props.value and @props.value.valueType == "date") or (@props.type == "date")
      return R DateTimepickerComponent, {onChange: @handleDateSelected, defaultDate: @state.inputText}

    # If datetime type, display dropdown
    if (@props.value and @props.value.valueType == "datetime") or (@props.type == "datetime")
      return R DateTimepickerComponent, {timepicker: true, onChange: @handleDateTimeSelected, defaultDate: @state.inputText}

  # Renders a dropdown that allows formula building (mostly scalar expression choosing)
  renderFormulaDropdown: ->
    dropdown = []

    # Add if statement
    dropdown.push(H.div(key: "special", H.a(onClick: @handleIfSelected, style: { fontSize: "80%", paddingLeft: 10, cursor: "pointer" }, "If/Then")))

    # Special handling for enum/enumset type required, as cannot select arbitrary enum if enum is only type allowed and values are specified
    noTree = @props.enumValues and (_.isEqual(@props.types, ["enum"]) or _.isEqual(@props.types, ["enumset"]))
    
    if not noTree
      # Escape regex for filter string
      escapeRegex = (s) -> return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
      if @state.inputText 
        filter = new RegExp(escapeRegex(@state.inputText), "i")

      # Create tree 
      treeBuilder = new ScalarExprTreeBuilder(@props.schema, @context.locale)
      tree = treeBuilder.getTree(table: @props.table, types: @props.types, includeCount: @props.includeCount, filter: filter)

      # Create tree component with value of table and path
      dropdown.push(R(ScalarExprTreeComponent, 
        key: "scalar_tree"
        tree: tree,
        onChange: @handleTreeChange
        height: 350))

    return dropdown

  render: ->
    # If focused
    if @state.focused
      # If formula mode, render dropdown scalar
      if @state.mode == "formula"
        dropdown = @renderFormulaDropdown()
      else if @state.mode == "literal" 
        dropdown = @renderLiteralDropdown()

    # Close when clicked outside
    R ClickOutHandler, onClickOut: @handleBlur,
      R DropdownComponent, dropdown: dropdown,
        H.div style: { position: "absolute", right: 10, top: 8, cursor: "pointer" }, @renderModeSwitcher()
        H.input 
          type: "text"
          className: "form-control"
          # style: { width: "30em" }
          ref: "input"
          value: @state.inputText
          onFocus: @handleFocus
          onClick: @handleFocus
          onChange: @handleTextChange
          onKeyDown: @handleKeyDown
          placeholder: @props.noneLabel

    

