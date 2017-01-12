React = require 'react'
ReactDOM = require 'react-dom'
H = React.DOM

# Shows a tree that selects table + joins + expr of a scalar expression
module.exports = class ScalarExprTreeComponent extends React.Component 
  @propTypes: 
    tree: React.PropTypes.array.isRequired    # Tree from ScalarExprTreeBuilder
    onChange: React.PropTypes.func.isRequired # Called with newly selected value
    height: React.PropTypes.number            # Render height of the component

  render: ->
    H.div style: { overflowY: (if @props.height then "auto"), height: @props.height },
      React.createElement(ScalarExprTreeTreeComponent,
        tree: @props.tree,
        onChange: @props.onChange
        frame: this
      )

class ScalarExprTreeTreeComponent extends React.Component
  @propTypes:
    tree: React.PropTypes.array.isRequired    # Tree from ScalarExprTreeBuilder
    onChange: React.PropTypes.func.isRequired # Called with newly selected value

  render: ->
    elems = []
    # Get tree
    for item, i in @props.tree
      if item.children
        elems.push(
          React.createElement(ScalarExprTreeNodeComponent, key: item.name + "(#{i})", item: item, onChange: @props.onChange))
      else 
        elems.push(
           React.createElement(ScalarExprTreeLeafComponent, key: item.name + "(#{i})", item: item, onChange: @props.onChange))

    H.div null, 
      elems

class ScalarExprTreeLeafComponent extends React.Component
  @propTypes:
    item: React.PropTypes.object.isRequired # Contains item "name" and "value"
  
  handleClick: =>
    @props.onChange(@props.item.value)

  render: ->
    style = {
      padding: 4
      marginLeft: 15
      borderRadius: 4
      cursor: "pointer"
      color: "#478"
    }

    H.div style: style, className: "hover-grey-background", onClick: @handleClick,
      @props.item.name
      if @props.item.desc
        H.span className: "text-muted", style: { fontSize: 12, paddingLeft: 3 }, " - " + @props.item.desc

class ScalarExprTreeNodeComponent extends React.Component
  @propTypes:
    item: React.PropTypes.object.isRequired # Item to display
    onChange: React.PropTypes.func.isRequired # Called when item is selected

  constructor: (props) ->
    super
    @state = { 
      collapse: if @props.item.initiallyOpen then "open" else "closed" 
    }

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
      children = H.div style: { paddingLeft: 18 }, key: "tree",
        React.createElement(ScalarExprTreeTreeComponent, tree: @props.item.children(), onChange: @props.onChange)

    color = if @props.item.value then "#478" 

    H.div null,
      H.div style: { cursor: "pointer", padding: 4, marginLeft: 15, position: "relative" }, key: "item", className: (if @props.item.value then "hover-grey-background"),
        H.span style: { color: "#478", cursor: "pointer", position: "absolute", left: -15 }, onClick: @handleArrowClick, arrow
        H.div style: { color: color, display: "inline-block" }, onClick: @handleItemClick, 
          if @props.item.childrenType == "section"
            H.i className: "fa fa-folder-open-o", style: { paddingRight: 5 }
          @props.item.name
          if @props.item.childrenType == "join"
            H.i className: "fa fa-link", style: { paddingRight: 5, paddingLeft: 5 }
          if @props.item.desc
            H.span className: "text-muted", style: { fontSize: 12, paddingLeft: 3 }, " - " + @props.item.desc
      children
      