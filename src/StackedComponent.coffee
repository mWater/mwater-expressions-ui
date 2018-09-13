PropTypes = require('prop-types')
CrossComponent = require('react-library/lib/CrossComponent')
React = require 'react'
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
    R 'div', style: { display: "flex" }, className: "hover-display-parent",
      R 'div', style: { flex: "0 0 #{width}px", display: "flex" }, 
        R(CrossComponent, 
          n: if not first then "solid 1px #DDD"
          e: "solid 1px #DDD"
          s: if not last then "solid 1px #DDD"
          height: "auto"
        )
      R 'div', style: { flex: "1 1 auto" }, 
        item.elem
      if item.onRemove
        R 'div', style: { flex: "0 0 auto", alignSelf: "center" }, className: "hover-display-child",
          R 'a', onClick: item.onRemove, style: { fontSize: "80%", cursor: "pointer", marginLeft: 5 },
            R 'span', className: "glyphicon glyphicon-remove"

  render: ->
    rowElems = []

    for child, i in @props.items
      # If not first, add joiner
      if i > 0 and @props.joinLabel
        rowElems.push(R('div', style: { width: width, textAlign: "center" }, @props.joinLabel))
      rowElems.push(@renderRow(child, i, i == 0, i == @props.items.length - 1))

    R 'div', style: { display: "flex", flexDirection: "column" }, # Outer container
      rowElems