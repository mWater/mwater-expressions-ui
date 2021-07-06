PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
R = React.createElement

ExprUtils = require("mwater-expressions").ExprUtils
RemovableComponent = require './RemovableComponent'

# Build enumset
module.exports = class BuildEnumsetExprComponent extends React.Component
  @propTypes:
    schema: PropTypes.object.isRequired
    dataSource: PropTypes.object.isRequired # Data source to use to get values
    value: PropTypes.object   # Current expression value
    enumValues: PropTypes.array # enum values. Can't display without them
    onChange: PropTypes.func  # Called with new expression

  @contextTypes:
    locale: PropTypes.string  # e.g. "en"

  handleValueChange: (id, value) =>
    values = _.clone(@props.value.values)
    values[id] = value
    @props.onChange(_.extend({}, @props.value, { values: values }))

  renderValues: ->
    # To avoid circularity
    ExprComponent = require './ExprComponent'

    exprUtils = new ExprUtils(@props.schema)

    R 'table', className: "table table-bordered", 
      R 'thead', null,
        R 'tr', null,
          R 'th', key: "name", "Choice"
          # R 'th', key: "arrow"
          R 'th', key: "include", "Include if"
      R 'tbody', null,
        _.map @props.enumValues, (enumValue) =>
          R 'tr', key: enumValue.id,
            # Name of value
            R 'td', key: "name",
              exprUtils.localizeString(enumValue.name, @context.locale)
            # R 'td', key: "arrow",
            #   R 'span', className: "glyphicon glyphicon-arrow-right"
            # Boolean condition
            R 'td', key: "value", style: { maxWidth: "30em" },
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
        R('i', null, "Cannot display build enumset without known values")