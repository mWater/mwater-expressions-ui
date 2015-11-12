CrossComponent = require './CrossComponent'
React = require 'react'
H = React.DOM
R = React.createElement

width = 60

# Displays a set of components vertically with lines connecting them
module.exports = class StackedComponent extends React.Component
  @propTypes:
    joinLabel: React.PropTypes.node   # Label between connections

  renderRow: (item, first, last) ->
    # Create row that has lines to the left
    H.div style: { display: "flex" },
      H.div style: { flex: "0 0 #{width}px", display: "flex" }, 
        R(CrossComponent, 
          n: if not first then "solid 1px #DDD"
          e: "solid 1px #DDD"
          s: if not last then "solid 1px #DDD"
        )
      H.div style: { flex: "1 1 auto" }, 
        item

  render: ->
    rowElems = []

    for child, i in @props.children
      # If not first, add joiner
      if i > 0 and @props.joinLabel
        rowElems.push(H.div(style: { width: width, textAlign: "center" }, @props.joinLabel))
      rowElems.push(@renderRow(child, i == 0, i == @props.children.length - 1))

    H.div style: { display: "flex", flexDirection: "column" }, # Outer container
      rowElems