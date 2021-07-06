PropTypes = require('prop-types')
React = require 'react'
R = React.createElement

# Component with a remove x to the right
module.exports = class RemovableComponent extends React.Component
  @propTypes:
    onRemove: PropTypes.func # Pass to put a remove link on right of specified item

  render: ->
    R 'div', style: { display: "flex" }, className: "hover-display-parent",
      R 'div', style: { flex: "1 1 auto" }, 
        @props.children
      if @props.onRemove
        R 'div', style: { flex: "0 0 auto", alignSelf: "center" }, className: "hover-display-child",
          R 'a', onClick: @props.onRemove, style: { fontSize: "80%", cursor: "pointer", marginLeft: 5 },
            R 'i', className: "fa fa-remove"
