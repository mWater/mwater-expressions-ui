PropTypes = require('prop-types')
React = require 'react'
R = React.createElement

# Displays a localized string (_base: "en", en: "apple", fr: "pomme", etc)
module.exports = class LocalizedStringComponent extends React.Component 
  @propTypes:
    value: PropTypes.object

  render: ->
    if @props.value
      return R('span', null, @props.value[@props.value._base or "en"])
    else
      return null
