React = require 'react'
H = React.DOM
ReactSelect = require 'react-select'
_ = require 'lodash'
ExprUtils = require("mwater-expressions").ExprUtils

# Component which displays an array of enums
module.exports = class EnumSetComponent extends React.Component
  @propTypes: 
    value: React.PropTypes.object
    onChange: React.PropTypes.func.isRequired 
    enumValues: React.PropTypes.array.isRequired # Array of id and name (localized string)

  @contextTypes:
    locale: React.PropTypes.string  # e.g. "en"

  handleChange: (val) =>
    value = if val then val.split("\n") else []
    value = _.map(value, JSON.parse)
    if value.length > 0
      @props.onChange({ type: "literal", valueType: "enumset", value: value })
    else
      @props.onChange(null)

  render: ->
    value = null
    if @props.value and @props.value.value.length > 0 
      value = _.map(@props.value.value, JSON.stringify).join("\n")

    # Use JSON to allow non-strings as ids
    options = _.map(@props.enumValues, (val) => { value: JSON.stringify(val.id), label: ExprUtils.localizeString(val.name, @context.locale) })
    H.div style: { width: "100%" },
      React.createElement(ReactSelect, { 
        value: value
        multi: true
        delimiter: "\n"
        options: options 
        onChange: @handleChange
      })

