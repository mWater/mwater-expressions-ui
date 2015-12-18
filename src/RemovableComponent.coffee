React = require 'react'
H = React.DOM

# Component with a remove x to the right
module.exports = class RemovableComponent extends React.Component
  @propTypes:
    onRemove: React.PropTypes.func # Pass to put a remove link on right of specified item

  render: ->
    H.div style: { display: "flex" }, className: "hover-display-parent",
      H.div style: { flex: "1 1 auto" }, 
        @props.children
      if @props.onRemove
        H.div style: { flex: "0 0 auto", alignSelf: "center" }, className: "hover-display-child",
          H.a onClick: @props.onRemove, style: { fontSize: "80%", cursor: "pointer", marginLeft: 5 },
            H.span className: "glyphicon glyphicon-remove"
