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
    types: React.PropTypes.array # Optional types to limit to
    includeCount: React.PropTypes.bool # Optionally include count at root level of a table
    placeholder: React.PropTypes.node # Placeholder. "Select..." if not specified
    onSelect: React.PropTypes.func  # Called with new expression
    initiallyOpen: React.PropTypes.bool # True to open immediately

  constructor: (props) ->
    super
    @state = { 
      open: props.initiallyOpen or false
      filter: ""
    }
  
  handleOpen: => @setState(open: true)
  handleClose: => @setState(open: false)
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
      tree = treeBuilder.getTree(table: @props.table, types: @props.types, includeCount: @props.includeCount, filter: filter)

      # Create tree component with value of table and path
      dropdown = R ScalarExprTreeComponent, 
        tree: tree,
        onChange: @handleTreeChange
        height: 350

      # Close when clicked outside
      R ClickOutHandler, onClickOut: @handleClose,
        R DropdownComponent, dropdown: dropdown,
          H.input type: "text", className: "form-control input-sm", style: { maxWidth: "16em" }, ref: @inputRef, value: @state.filter, onChange: @handleFilterChange, placeholder: "Select..."

    else
      R LinkComponent, onClick: @handleOpen, (@props.placeholder or "Select...")

