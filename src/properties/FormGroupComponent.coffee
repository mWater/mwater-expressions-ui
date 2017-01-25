React = require 'react'
R = React.createElement
H = React.DOM
_ = require 'lodash'
classNames = require 'classnames'

module.exports = class FormGroupComponent extends React.Component
  render: ->
    classes = {
      "form-group": true
      "has-error": @props.hasErrors
      "has-warning": @props.hasWarnings
      "has-success": @props.hasSuccess
    }
    H.div className: classNames(classes),
      H.label null, @props.label
      @props.children
