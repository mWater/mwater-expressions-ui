PropTypes = require('prop-types')
React = require 'react'
ReactDOM = require 'react-dom'
H = React.DOM
R = React.createElement

# Shows a tree that selects table + joins + expr of a scalar expression
# Supports some React context properties for special. See individual classes
module.exports = class ScalarExprTreeComponent extends React.Component 
  @propTypes: 
    tree: PropTypes.array.isRequired    # Tree from ScalarExprTreeBuilder
    onChange: PropTypes.func.isRequired # Called with newly selected value
    height: PropTypes.number            # Render height of the component
    filter: PropTypes.text              # Optional string filter 

  render: ->
    H.div style: { overflowY: (if @props.height then "auto"), height: @props.height },
      R(ScalarExprTreeTreeComponent,
        tree: @props.tree,
        onChange: @props.onChange
        filter: @props.filter
      )

class ScalarExprTreeTreeComponent extends React.Component
  @propTypes:
    tree: PropTypes.array.isRequired    # Tree from ScalarExprTreeBuilder
    onChange: PropTypes.func.isRequired # Called with newly selected value
    prefix: PropTypes.string            # String to prefix names with
    filter: PropTypes.text              # Optional string filter 

  render: ->
    elems = []
    # Get tree
    for item, i in @props.tree
      if item.children
        elems.push(
          R(ScalarExprTreeNodeComponent, key: item.key, item: item, prefix: @props.prefix, onChange: @props.onChange, filter: @props.filter))
      else 
        elems.push(
          R(ScalarExprTreeLeafComponent, key: item.key, item: item, prefix: @props.prefix, onChange: @props.onChange))

    H.div null, 
      elems

class ScalarExprTreeLeafComponent extends React.Component
  @propTypes:
    item: PropTypes.object.isRequired # Contains item "name" and "value"
    prefix: PropTypes.string            # String to prefix names with
  
  handleClick: =>
    @props.onChange(@props.item.value)

  render: ->
    style = {
      padding: 4
      borderRadius: 4
      cursor: "pointer"
      color: "#478"
    }

    H.div style: style, className: "hover-grey-background", onClick: @handleClick,
      if @props.prefix
        H.span className: "text-muted", @props.prefix
      @props.item.name
      if @props.item.desc
        H.span className: "text-muted", style: { fontSize: 12, paddingLeft: 3 }, " - " + @props.item.desc

class ScalarExprTreeNodeComponent extends React.Component
  @propTypes:
    item: PropTypes.object.isRequired # Item to display
    onChange: PropTypes.func.isRequired # Called when item is selected
    filter: PropTypes.text              # Optional string filter 

  @contextTypes:
    # Function to decorate the children component of a section. Passed { children: React element of children, tableId: id of table, section: section object from schema, filter: optional string filter }
    # Should return decorated element
    decorateScalarExprTreeSectionChildren: PropTypes.func 

  constructor: (props) ->
    super
    @state = { 
      collapse: if @props.item.initiallyOpen then "open" else "closed" 
    }

  componentWillReceiveProps: (nextProps) ->
    # If initially open changed, then update collapse
    if nextProps.item.initiallyOpen != @props.item.initiallyOpen
      @setState(collapse: if nextProps.item.initiallyOpen then "open" else "closed") 

  handleArrowClick: =>
    if @state.collapse == "open" 
      @setState(collapse: "closed")
    else if @state.collapse == "closed" 
      @setState(collapse: "open")

  handleItemClick: =>
    # If no value, treat as arrow click
    if not @props.item.value
      @handleArrowClick()
    else
      @props.onChange(@props.item.value)      

  render: ->
    arrow = null
    if @state.collapse == "closed"
      arrow = H.i className: "fa fa-plus-square-o", style: { width: 15 }
    else if @state.collapse == "open"
      arrow = H.i className: "fa fa-minus-square-o", style: { width: 15 }

    if @state.collapse == "open"
      # Compute new prefix, adding when going into joins
      prefix = @props.prefix or ""
      if @props.item.item.type == "join"
        prefix = prefix + @props.item.name + " > "

      # Render child items
      childItems = @props.item.children()

      children = _.map childItems, (item) =>
        if item.children
          R ScalarExprTreeNodeComponent, key: item.key, item: item, prefix: prefix, onChange: @props.onChange, filter: @props.filter
        else 
          R ScalarExprTreeLeafComponent, key: item.key, item: item, prefix: prefix, onChange: @props.onChange

      # Decorate children if section
      if @context.decorateScalarExprTreeSectionChildren and @props.item.item.type == "section"
        children = @context.decorateScalarExprTreeSectionChildren({ children: children, tableId: @props.item.tableId, section: @props.item.item, filter: @props.filter })

      # Pad left and give key
      children = H.div style: { paddingLeft: 18 }, key: "tree",
        children

    color = if @props.item.value then "#478" 

    H.div null,
      H.div style: { cursor: "pointer", padding: 4, marginLeft: 20, position: "relative" }, key: "item", className: (if @props.item.value then "hover-grey-background"),
        H.span style: { color: "#478", cursor: "pointer", position: "absolute", left: -15 }, onClick: @handleArrowClick, arrow
        H.div style: { color: color, display: "inline-block" }, onClick: @handleItemClick, 
          if @props.prefix
            H.span className: "text-muted", @props.prefix
          @props.item.name
          # if @props.item.item.type == "join"
          #   H.i className: "fa fa-link", style: { paddingRight: 5, paddingLeft: 5 }
          if @props.item.desc
            H.span className: "text-muted", style: { fontSize: 12, paddingLeft: 3 }, " - " + @props.item.desc
      children
      