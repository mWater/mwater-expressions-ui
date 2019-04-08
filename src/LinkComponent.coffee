PropTypes = require('prop-types')
React = require 'react'
R = React.createElement
_ = require 'lodash'

# Component that is blue to show that it is a link and responds to clicks
# Also has a dropdown component if dropdown items are specified
module.exports = class LinkComponent extends React.Component
  @propTypes:
    onClick: PropTypes.func # Called on click
    onRemove: PropTypes.func # Adds an x if specified 
    dropdownItems: PropTypes.array # Array of { id, name } or { value, label } to display as dropdown. Null name/label is a separator
    onDropdownItemClicked: PropTypes.func # Called with id/value of dropdown item

  renderRemove: ->
    if @props.onRemove
      return R 'span', className: "link-component-remove", onClick: @props.onRemove,
        R('span', className: "glyphicon glyphicon-remove")

  renderDropdownItem: (item) =>
    id = item.id or item.value
    name = item.name or item.label
    
    # Handle divider
    if not name?
      return R 'li', className: "divider"

    # Get a string key
    key = id
    if not _.isString(key)
      key = JSON.stringify(key)

    return R 'li', key: key,
      R('a', key: id, onClick: @props.onDropdownItemClicked.bind(null, id), name)

  render: ->
    # Simple case
    if not @props.onClick and not @props.onRemove and (not @props.dropdownItems or @props.dropdownItems.length == 0)
      return R 'div', className: "link-component-readonly", @props.children

    elem = R 'div', className: "link-component", "data-toggle": "dropdown", 
      R 'div', style: { display: "inline-block" }, onClick: @props.onClick, 
        @props.children
      @renderRemove()

    # If dropdown
    if @props.dropdownItems
      return R 'div', className: "dropdown", style: { display: "inline-block" },
        elem
        R 'ul', className: "dropdown-menu", style: { cursor: "pointer" },
          _.map @props.dropdownItems, @renderDropdownItem
    else
      return elem

