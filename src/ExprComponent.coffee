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
    includeCount: React.PropTypes.bool # true to include count (id) item at root level in expression selector

  @contextTypes:
    locale: React.PropTypes.string  # e.g. "en"

  # Clean expression and pass up
  handleChange: (expr) =>
    # Clean expression
    expr = new ExprCleaner(@props.schema).cleanExpr(expr, {
      table: @props.table
      types: @props.types
      enumValueIds: if @props.enumValues then _.pluck(@props.enumValues, "id")
      idTable: @props.idTable
    })

    @props.onChange(expr)

  render: ->
    new ExprElementBuilder(@props.schema, @props.dataSource, @context.locale).build(@props.value, @props.table, @handleChange, { 
      types: @props.types
      enumValues: @props.enumValues 
      preferLiteral: @props.preferLiteral
      idTable: @props.idTable
      includeCount: @props.includeCount
      })

