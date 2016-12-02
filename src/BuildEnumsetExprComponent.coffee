_ = require 'lodash'
React = require 'react'
R = React.createElement
H = React.DOM

ExprUtils = require("mwater-expressions").ExprUtils
RemovableComponent = require './RemovableComponent'

# Build enumset
module.exports = class BuildEnumsetExprComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired # Data source to use to get values
    value: React.PropTypes.object   # Current expression value
    enumValues: React.PropTypes.array # enum values. Can't display without them
    onChange: React.PropTypes.func  # Called with new expression

  @contextTypes:
    locale: React.PropTypes.string  # e.g. "en"

  handleValueChange: (id, value) =>
    values = _.clone(@props.value.values)
    values[id] = value
    @props.onChange(_.extend({}, @props.value, { values: values }))

  renderValues: ->
    # To avoid circularity
    ExprComponent = require './ExprComponent'

    exprUtils = new ExprUtils(@props.schema)

    H.table className: "table table-bordered", 
      H.thead null,
        H.tr null,
          H.th key: "name", "Choice"
          # H.th key: "arrow"
          H.th key: "include", "Include if"
      H.tbody null,
        _.map @props.enumValues, (enumValue) =>
          H.tr key: enumValue.id,
            # Name of value
            H.td key: "name",
              exprUtils.localizeString(enumValue.name, @context.locale)
            # H.td key: "arrow",
            #   H.span className: "glyphicon glyphicon-arrow-right"
            # Boolean condition
            H.td key: "value", style: { maxWidth: "30em" },
              R ExprComponent,
                schema: @props.schema
                dataSource: @props.dataSource
                table: @props.value.table
                value: @props.value.values[enumValue.id]
                onChange: @handleValueChange.bind(null, enumValue.id)
                types: ['boolean']

  render: ->
    R RemovableComponent, onRemove: @props.onChange.bind(null, null),
      if @props.enumValues
        @renderValues()
      else
        H.i(null, "Cannot display build enumset without known values")