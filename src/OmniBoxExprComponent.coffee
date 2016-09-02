_ = require 'lodash'
React = require 'react'
R = React.createElement
H = React.DOM
ClickOutHandler = require('react-onclickout')
moment = require 'moment'

ScalarExprTreeComponent = require './ScalarExprTreeComponent'
ScalarExprTreeBuilder = require './ScalarExprTreeBuilder'
DropdownComponent = require './DropdownComponent'
LinkComponent = require './LinkComponent'
DateTimePickerComponent = require './DateTimePickerComponent'
ExprUtils = require('mwater-expressions').ExprUtils

# Box component that allows selecting if statements, scalars and literals, all in one place
# Has a dropdown when needed and focused.
# It has two modes: literal and formula. If a literal is being edited, it is by default in literal mode
module.exports = class OmniBoxExprComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired

    table: React.PropTypes.string.isRequired # Current table
    value: React.PropTypes.object   # Current expression value
    onChange: React.PropTypes.func  # Called with new expression

    types: React.PropTypes.array    # If specified, the types (value type) of expression required. e.g. ["boolean"]
    enumValues: React.PropTypes.array # Array of { id:, name: } of enum values that can be selected. Only when type = "enum"

    noFormulaPlaceholder: React.PropTypes.string # What to display when no formula. Default "Select..."
    noLiteralPlaceholder: React.PropTypes.string # What to display when no literal. Default "Enter Value..."
    initialMode: React.PropTypes.oneOf(['formula', 'literal']) # Initial mode. Default formula

    idTable: React.PropTypes.string # If specified the table from which id-type expressions must come

    includeCount: React.PropTypes.bool # Optionally include count at root level of a table. Returns id expression
    allowCase: React.PropTypes.bool    # Allow case statements
    aggrStatuses: React.PropTypes.array # statuses of aggregation to allow. list of "individual", "literal", "aggregate". Default: ["individual", "literal"]

  @defaultProps:
    noFormulaPlaceholder: "Select..."
    noLiteralPlaceholder: "Enter Value..."
    initialMode: "formula"
    aggrStatuses: ['individual', 'literal']

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
      # Handle date
      if literalExpr.valueType == "date"
        return moment(literalExpr.value, moment.ISO_8601).format("l")
      if literalExpr.valueType == "datetime"
        return moment(literalExpr.value, moment.ISO_8601).format("lll")
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

  handleClickOut: => 
    if not @state.focused
      return

    @setState(focused: false)

  # Blur fires immediately while clickout is later
  handleBlur: =>
    # Process literal if present
    if @state.mode == "literal"
      # Empty means no value
      if not @state.inputText
        if @props.value
          @props.onChange(null)
        return

      # If text
      if (@props.value and @props.value.valueType == "text") or "text" in (@props.types or ['text'])
        @props.onChange({ type: "literal", valueType: "text", value: @state.inputText })
      else if (@props.value and @props.value.valueType == "number") or "number" in (@props.types or ['number'])
        value = parseFloat(@state.inputText)
        if _.isFinite(value)
          @props.onChange({ type: "literal", valueType: "number", value: value })
      # If id (only allow if idTable is explicit)
      else if "id" in (@props.types or ['id']) and @props.idTable
        @props.onChange({ type: "literal", valueType: "id", idTable: @props.idTable, value: @state.inputText })
      # If date
      else if (@props.value and @props.value.valueType == "date") or "date" in (@props.types or ['date'])
        date = moment(@state.inputText, "l")
        if date.isValid()
          @props.onChange({ type: "literal", valueType: "date", value: date.format("YYYY-MM-DD") })
        else
          # TODO make red instead
          @setState(inputText: "")
      # If datetime
      else if (@props.value and @props.value.valueType == "datetime") or "datetime" in (@props.types or ['datetime'])
        date = moment(@state.inputText, "lll")
        if date.isValid()
          @props.onChange({ type: "literal", valueType: "datetime", value: date.toISOString() })
        else
          # TODO make red instead
          @setState(inputText: "")

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

  handleScoreSelected: =>
    scoreExpr = {
      type: "score"
      table: @props.table
      input: null
      scores: {}
    }
    @props.onChange(scoreExpr)

  handleOpSelected: (op) =>
    expr = {
      type: "op"
      table: @props.table
      op: op
      exprs: []
    }
    @props.onChange(expr)

  # Handle a selection in the scalar expression tree. Called with { table, joins, expr }
  handleTreeChange: (val) => 
    # Loses focus when selection made
    @setState(focused: false)

    expr = val.expr

    # If expr is enum and enumValues specified, perform a mapping
    exprUtils = new ExprUtils(@props.schema)
    if exprUtils.getExprType(val.expr) == "enum" and @props.enumValues
      expr = {
        type: "case"
        table: expr.table
        cases: _.map(@props.enumValues, (ev) =>
          # Find matching name (english)
          fromEnumValues = exprUtils.getExprEnumValues(expr)
          matchingEnumValue = _.find(fromEnumValues, (fev) -> fev.name.en == ev.name.en)

          if matchingEnumValue
            literal = { type: "literal", valueType: "enumset", value: [matchingEnumValue.id] }
          else
            literal = null

          return { 
            when: { type: "op", table: expr.table, op: "= any", exprs: [expr, literal] }
            then: { type: "literal", valueType: "enum", value: ev.id }
          }
        )
        else: null
      }

    # Make into expression
    if val.joins.length == 0 
      # Simple field expression
      @props.onChange(expr)
    else
      @props.onChange({ type: "scalar", table: @props.table, joins: val.joins, expr: expr })

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
      if @props.types?[0] == "number"
        label = "123"
      else if @props.types?[0] in ["text", "enum", "enumset", "date", "datetime", "id"]
        label = "abc"
      else
        return

      return H.a(onClick: @handleModeChange.bind(null, "literal"), H.i(null, label))
    else
      return H.a(onClick: @handleModeChange.bind(null, "formula"), H.i(null, "f", H.sub(null, "x")))

  handleDateSelected: (date) =>
    @setState(inputText: date.format("l"))
    @refs.input.blur()
    @handleBlur()

  handleDateTimeSelected: (datetime) =>
    @setState(inputText: datetime.format("lll"))
    @refs.input.blur()
    @handleBlur()

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
    if (@props.value and @props.value.valueType == "date") or "date" in (@props.types or [])
      return R DateTimePickerComponent, {onChange: @handleDateSelected, defaultDate: @state.inputText}

    # If datetime type, display dropdown
    if (@props.value and @props.value.valueType == "datetime") or "datetime" in (@props.types or [])
      return R DateTimePickerComponent, {timepicker: true, onChange: @handleDateTimeSelected, defaultDate: @state.inputText}

  # Renders a dropdown that allows formula building (mostly scalar expression choosing)
  renderFormulaDropdown: ->
    dropdown = []

    # Special links at the top
    specials = []

    # Add if statement (unless boolean only, in which case if/thens cause problems by returning null)
    if @props.allowCase
      specials.push(H.a(key: "case", onClick: @handleIfSelected, style: { fontSize: "80%", paddingLeft: 10, cursor: "pointer" }, "if/then"))

    # Add score if has number possible
    if not @props.types or 'number' in @props.types
      specials.push(H.a(key: "score", onClick: @handleScoreSelected, style: { fontSize: "80%", paddingLeft: 10, cursor: "pointer" }, "score"))

    # Only allow aggregate expressions if relevant
    aggr = null
    if "aggregate" not in @props.aggrStatuses
      aggr = false

    # Add ops that are prefix ones (like "latitude of")
    exprUtils = new ExprUtils(@props.schema)
    opItems = exprUtils.findMatchingOpItems(resultTypes: @props.types, prefix: true, aggr: aggr)
    for opItem in _.uniq(opItems, "op")
      specials.push(H.a(key: opItem.op, onClick: @handleOpSelected.bind(null, opItem.op), style: { fontSize: "80%", paddingLeft: 10, cursor: "pointer" }, opItem.name))

    if specials.length > 0
      dropdown.push(H.div(key: "specials", style: { padding: 5 }, specials))

    # Special handling for enumset type required with enumValues, as cannot select map anything now to enumset
    noTree = @props.enumValues and _.isEqual(@props.types, ["enumset"])
    
    if not noTree
      # Escape regex for filter string
      escapeRegex = (s) -> return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
      if @state.inputText 
        filter = new RegExp(escapeRegex(@state.inputText), "i")

      # Create tree 
      treeBuilder = new ScalarExprTreeBuilder(@props.schema, @context.locale)
      tree = treeBuilder.getTree(table: @props.table, types: @props.types, idTable: @props.idTable, includeCount: @props.includeCount, filter: filter)

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
    R ClickOutHandler, onClickOut: @handleClickOut,
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
          onBlur: @handleBlur
          placeholder: if @state.mode == "literal" then @props.noLiteralPlaceholder else @props.noFormulaPlaceholder

  