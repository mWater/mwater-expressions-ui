_ = require 'lodash'
React = require 'react'
R = React.createElement
H = React.DOM

ExprCleaner = require("mwater-expressions").ExprCleaner
ExprElementBuilder = require './ExprElementBuilder'

# Display/editor component for an expression
# Uses ExprElementBuilder to create the tree of components
# Cleans expression as a convenience
module.exports = class ExprComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired # Data source to use to get values

    table: React.PropTypes.string.isRequired # Current table
    value: React.PropTypes.object   # Current expression value
    onChange: React.PropTypes.func  # Called with new expression

    types: React.PropTypes.array    # If specified, the types (value type) of expression required. e.g. ["boolean"]
    enumValues: React.PropTypes.array # Array of { id:, name: } of enum values that can be selected. Only when type = "enum"
    idTable: React.PropTypes.string # If specified the table from which id-type expressions must come

    preferLiteral: React.PropTypes.bool # True to prefer literal expressions
    aggrStatuses: React.PropTypes.array # statuses of aggregation to allow. list of "individual", "literal", "aggregate". Default: ["individual", "literal"]
    placeholder: React.PropTypes.string # placeholder for empty value

  @defaultProps:
    aggrStatuses: ["individual", "literal"]

  @contextTypes:
    locale: React.PropTypes.string  # e.g. "en"

  # Opens the editor popup. Only works if expression is blank
  openEditor: =>
    @refs.exprLink?.showModal()

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
      exprLinkRef: if not expr then "exprLink"
      })

