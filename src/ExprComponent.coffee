PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
R = React.createElement

ExprCleaner = require("mwater-expressions").ExprCleaner
ExprElementBuilder = require './ExprElementBuilder'

# Display/editor component for an expression
# Uses ExprElementBuilder to create the tree of components
# Cleans expression as a convenience
module.exports = class ExprComponent extends React.Component
  @propTypes:
    schema: PropTypes.object.isRequired
    dataSource: PropTypes.object.isRequired # Data source to use to get values

    table: PropTypes.string.isRequired # Current table
    value: PropTypes.object   # Current expression value
    onChange: PropTypes.func  # Called with new expression

    types: PropTypes.array    # If specified, the types (value type) of expression required. e.g. ["boolean"]
    enumValues: PropTypes.array # Array of { id:, name: } of enum values that can be selected. Only when type = "enum"
    idTable: PropTypes.string # If specified the table from which id-type expressions must come

    preferLiteral: PropTypes.bool # True to prefer literal expressions
    aggrStatuses: PropTypes.array # statuses of aggregation to allow. list of "individual", "literal", "aggregate". Default: ["individual", "literal"]
    placeholder: PropTypes.string # placeholder for empty value

  @defaultProps:
    aggrStatuses: ["individual", "literal"]

  @contextTypes:
    locale: PropTypes.string  # e.g. "en"

  # Opens the editor popup. Only works if expression is blank
  openEditor: =>
    @exprLink?.showModal()

  # Clean expression and pass up
  handleChange: (expr) =>
    @props.onChange(@cleanExpr(expr))

  # Cleans an expression
  cleanExpr: (expr) ->
    return new ExprCleaner(@props.schema).cleanExpr(expr, {
      table: @props.table
      types: @props.types
      enumValueIds: if @props.enumValues then _.pluck(@props.enumValues, "id")
      idTable: @props.idTable
      aggrStatuses: @props.aggrStatuses
    })

  render: ->
    expr = @cleanExpr(@props.value)

    new ExprElementBuilder(@props.schema, @props.dataSource, @context.locale).build(expr, @props.table, @handleChange, { 
      types: @props.types
      enumValues: @props.enumValues 
      preferLiteral: @props.preferLiteral
      idTable: @props.idTable
      includeAggr: "aggregate" in @props.aggrStatuses
      aggrStatuses: @props.aggrStatuses
      placeholder: @props.placeholder
      # If no expression, pass a ref to use so that the expression editor can be opened
      exprLinkRef: if not expr then ((c) => @exprLink = c)
      })

