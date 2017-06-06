PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
R = React.createElement
H = React.DOM

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

    H.table className: "table table-bordered", 
      H.thead null,
        H.tr null,
          H.th key: "name", "Choice"
          # H.th key: "arrow"
          H.th key: "score", "Score"
      H.tbody null,
        _.map enumValues, (enumValue) =>
          H.tr key: enumValue.id,
            # Name of value
            H.td key: "name",
              exprUtils.localizeString(enumValue.name, @context.locale)
            # H.td key: "arrow",
            #   H.span className: "glyphicon glyphicon-arrow-right"
            # Score
            H.td key: "score", style: { maxWidth: "20em" },
              R ExprComponent,
                schema: @props.schema
                dataSource: @props.dataSource
                table: @props.value.table
                value: @props.value.scores[enumValue.id]
                onChange: @handleScoreChange.bind(null, enumValue.id)
                types: ['number']
                preferLiteral: true

  render: ->
    # To avoid circularity
    ExprComponent = require './ExprComponent'

    R RemovableComponent, onRemove: @props.onChange.bind(null, null),
      H.div null, 
        "Score choices of: "
        H.div style: { display: "inline-block", maxWidth: "50em" },
          R ExprComponent,
            schema: @props.schema
            dataSource: @props.dataSource
            table: @props.value.table
            value: @props.value.input
            onChange: @handleInputChange
            types: ['enum', 'enumset']
      @renderScores()