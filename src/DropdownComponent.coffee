React = require 'react'
R = React.createElement
H = React.DOM

# Dropdown component. Specify dropdown as prop to display
module.exports = class DropdownComponent extends React.Component
  @propTypes: 
    dropdown: React.PropTypes.node

  render: ->
    H.div className: "dropdown #{if @props.dropdown then "open" else ""}",
      @props.children
      H.div className: "dropdown-menu", style: { width: "100%" },
        @props.dropdown
