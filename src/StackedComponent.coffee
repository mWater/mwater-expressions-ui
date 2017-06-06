PropTypes = require('prop-types')
CrossComponent = require('react-library/lib/CrossComponent')
React = require 'react'
H = React.DOM
R = React.createElement

width = 60

# Displays a set of components vertically with lines connecting them
module.exports = class StackedComponent extends React.Component
  @propTypes:
    joinLabel: PropTypes.node   # Label between connections
    items: PropTypes.arrayOf(PropTypes.shape({
      elem: PropTypes.node.isRequired # Elem to display
      onRemove: PropTypes.func # Pass to put a remove link on right of specified item
      })).isRequired 

  renderRow: (item, i, first, last) ->
    # Create row that has lines to the left
    H.div style: { display: "flex" }, className: "hover-display-parent",
      H.div style: { flex: "0 0 #{width}px", display: "flex" }, 
        R(CrossComponent, 
          n: if not first then "solid 1px #DDD"
          e: "solid 1px #DDD"
          s: if not last then "solid 1px #DDD"
          height: "auto"
        )
      H.div style: { flex: "1 1 auto" }, 
        item.elem
      if item.onRemove
        H.div style: { flex: "0 0 auto", alignSelf: "center" }, className: "hover-display-child",
          H.a onClick: item.onRemove, style: { fontSize: "80%", cursor: "pointer", marginLeft: 5 },
            H.span className: "glyphicon glyphicon-remove"

  render: ->
    rowElems = []

    for child, i in @props.items
      # If not first, add joiner
      if i > 0 and @props.joinLabel
        rowElems.push(H.div(style: { width: width, textAlign: "center" }, @props.joinLabel))
      rowElems.push(@renderRow(child, i, i == 0, i == @props.items.length - 1))

    H.div style: { display: "flex", flexDirection: "column" }, # Outer container
      rowElems