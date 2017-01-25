React = require 'react'
H = React.DOM

# Displays a localized string (_base: "en", en: "apple", fr: "pomme", etc)
module.exports = class LocalizedStringComponent extends React.Component 
  @propTypes:
    value: React.PropTypes.object

  render: ->
    if @props.value
      return H.span(null, @props.value[@props.value._base or "en"])
    else
      return null
