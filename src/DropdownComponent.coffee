React = require 'react'
R = React.createElement
H = React.DOM

# Dropdown component. Specify dropdown as prop to display
module.exports = class DropdownComponent extends React.Component
  @propTypes: 
    dropdown: React.PropTypes.node

  render: ->
    H.div className: "dropdown #{if @props.dropdown then "open" else ""}", #style: { display: "inline-block" },
      @props.children
      if @props.dropdown
        H.div className: "dropdown-menu", style: { minWidth: 500 },
          @props.dropdown
