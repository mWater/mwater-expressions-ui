_ = require 'lodash'
React = require 'react'
R = React.createElement
H = React.DOM
ClickOutHandler = require('react-onclickout')

ScalarExprTreeComponent = require './ScalarExprTreeComponent'
ScalarExprTreeBuilder = require './ScalarExprTreeBuilder'
DropdownComponent = require './DropdownComponent'
LinkComponent = require './LinkComponent'

# Selects an expression using a searchable dropdown control that opens when clicked.
module.exports = class SelectExprComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired
    table: React.PropTypes.string.isRequired # Table to restrict selections to (can still follow joins to other tables)
    type: React.PropTypes.string # Optional type to limit to
    includeCount: React.PropTypes.bool # Optionally include count at root level of a table
    placeholder: React.PropTypes.node # Placeholder. "Select..." if not specified
    onSelect: React.PropTypes.func  # Called with new expression
    initiallyOpen: React.PropTypes.bool # True to open immediately
    enumValues: React.PropTypes.array # Array of { id:, name: } of enum values that can be selected. Only when type = "enum"

  constructor: (props) ->
    super
    @state = { 
      open: props.initiallyOpen or false
      filter: ""
    }
  
  handleOpen: => @setState(open: true)

  handleClose: => 
    # If number required, parse number
    if @props.type == "number" and @inputComp.value.match(/^[0-9]+(\.[0-9]+)?$/)
      val = parseFloat(@inputComp.value)
      @props.onSelect({ type: "literal", valueType: "number", value: val })

    # If text required, use it
    if @props.type == "text" and @inputComp.value
      @props.onSelect({ type: "literal", valueType: "text", value: @inputComp.value })

    @setState(open: false)

  # Handle enter key
  handleKeyDown: (ev) =>
    if ev.keyCode == 13 
      @handleClose()

  handleFilterChange: (ev) => @setState(filter: ev.target.value)
  
  handleTreeChange: (val) => 
    # Called with { table, joins, expr }
    # Make into expression
    if val.joins.length == 0 
      # Simple field expression
      @props.onSelect(val.expr)
    else
      @props.onSelect({ type: "scalar", joins: val.joins, expr: val.expr })

  inputRef: (comp) =>
    @inputComp = comp
    if comp
      comp.focus()

  render: ->
    if @state.open
      # Escape regex for filter string
      escapeRegex = (s) -> return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
      if @state.filter 
        filter = new RegExp(escapeRegex(@state.filter), "i")

      # Create tree 
      treeBuilder = new ScalarExprTreeBuilder(@props.schema)
      types = if @props.type then [@props.type]
      tree = treeBuilder.getTree(table: @props.table, types: types, includeCount: @props.includeCount, filter: filter)

      # Create tree component with value of table and path
      dropdown = R ScalarExprTreeComponent, 
        tree: tree,
        onChange: @handleTreeChange
        height: 350

      # Create list of enums if selecting enum
      if @props.enumValues and @props.type == "enum"
        dropdown = _.map @props.enumValues, (ev) =>
          H.li(key: ev.id, H.a(onClick: @props.onSelect.bind(null, { type: "literal", valueType: "enum", value: ev.id }), ev.name))

      # Close when clicked outside
      R ClickOutHandler, onClickOut: @handleClose,
        R DropdownComponent, dropdown: dropdown,
          H.input 
            type: "text"
            className: "form-control input-sm"
            style: { maxWidth: "16em" }
            ref: @inputRef
            value: @state.filter
            onChange: @handleFilterChange
            onKeyDown: @handleKeyDown
            placeholder: "Select..."

    else
      R LinkComponent, onClick: @handleOpen, (@props.placeholder or "Select...")

