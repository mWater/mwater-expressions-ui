PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
R = React.createElement

ExprUtils = require("mwater-expressions").ExprUtils
RemovableComponent = require './RemovableComponent'

# Score 
module.exports = class ScoreExprComponent extends React.Component
  @propTypes:
    schema: PropTypes.object.isRequired
    dataSource: PropTypes.object.isRequired # Data source to use to get values
    value: PropTypes.object   # Current expression value
    onChange: PropTypes.func  # Called with new expression

  @contextTypes:
    locale: PropTypes.string  # e.g. "en"

  handleInputChange: (expr) =>
    @props.onChange(_.extend({}, @props.value, { input: expr }))

  handleScoreChange: (id, value) =>
    scores = _.clone(@props.value.scores)
    scores[id] = value
    @props.onChange(_.extend({}, @props.value, { scores: scores }))

  renderScores: ->
    # To avoid circularity
    ExprComponent = require './ExprComponent'

    exprUtils = new ExprUtils(@props.schema)
    # Get enum values
    enumValues = exprUtils.getExprEnumValues(@props.value.input)
    if not enumValues
      return null

    R 'table', className: "table table-bordered", 
      R 'thead', null,
        R 'tr', null,
          R 'th', key: "name", "Choice"
          # R 'th', key: "arrow"
          R 'th', key: "score", "Score"
      R 'tbody', null,
        _.map enumValues, (enumValue) =>
          R 'tr', key: enumValue.id,
            # Name of value
            R 'td', key: "name",
              exprUtils.localizeString(enumValue.name, @context.locale)
            # R 'td', key: "arrow",
            #   R 'span', className: "glyphicon glyphicon-arrow-right"
            # Score
            R 'td', key: "score", style: { maxWidth: "20em" },
              R ExprComponent,
                schema: @props.schema
                dataSource: @props.dataSource
                table: @props.value.table
                value: @props.value.scores[enumValue.id]
                onChange: if @props.onChange then @handleScoreChange.bind(null, enumValue.id)
                types: ['number']
                preferLiteral: true

  render: ->
    # To avoid circularity
    ExprComponent = require './ExprComponent'

    R RemovableComponent, onRemove: (if @props.onChange then @props.onChange.bind(null, null)),
      R 'div', null, 
        "Score choices of: "
        R 'div', style: { display: "inline-block", maxWidth: "50em" },
          R ExprComponent,
            schema: @props.schema
            dataSource: @props.dataSource
            table: @props.value.table
            value: @props.value.input
            onChange: if @props.onChange then @handleInputChange
            types: ['enum', 'enumset']
      @renderScores()