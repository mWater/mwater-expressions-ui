PropTypes = require('prop-types')
React = require 'react'
R = React.createElement
_ = require 'lodash'

ui = require 'react-library/lib/bootstrap'

module.exports = class IdFieldComponent extends React.Component
  @propTypes: 
    value: PropTypes.string  # The value
    onChange: PropTypes.func.isRequired  # Called with new value
    
  constructor: (props) ->
    super(props)
    
  isValid: (string) =>
    return /^[a-z][a-z_0-9]*$/.test(string)
    
  handleChange: (ev) =>
    @props.onChange(ev.target.value)
    
  render: ->
    R ui.FormGroup, label: "ID", hasWarnings: not @isValid(@props.value),
      R 'input', type: "text", className: "form-control", value: @props.value or "", onChange: @handleChange
      R 'p', className: "help-block", "Lowercase, numbers and underscores"
