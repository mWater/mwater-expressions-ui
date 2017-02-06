React = require 'react'
R = React.createElement
H = React.DOM
_ = require 'lodash'

FormGroupComponent = require './FormGroupComponent'

module.exports = class IdFieldComponent extends React.Component
  @propTypes: 
    value: React.PropTypes.string  # The value
    onChange: React.PropTypes.func.isRequired  # Called with new value
    
  constructor: (props) ->
    super(props)
    
  isValid: (string) =>
    return /^[a-z][a-z_0-9]*$/.test(string)
    
  handleChange: (ev) =>
    @props.onChange(ev.target.value)
    
  render: ->
    R FormGroupComponent, label: "ID", hasWarnings: not @isValid(@props.value),
      H.input type: "text", className: "form-control", value: @props.value or "", onChange: @handleChange
      H.p className: "help-block", "Lowercase, numbers and underscores"
