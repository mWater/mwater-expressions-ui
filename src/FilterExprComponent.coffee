# _ = require 'lodash'
# React = require 'react'
# R = React.createElement
# H = React.DOM

# ExprComponent = require './ExprComponent'


# # Displays a boolean filter expression
# module.exports = class FilterExprComponent extends React.Component
#   @propTypes:
#     schema: React.PropTypes.object.isRequired
#     dataSource: React.PropTypes.object.isRequired # Data source to use to get values
#     table: React.PropTypes.string.isRequired # Current table
#     value: React.PropTypes.object   # Current value
#     onChange: React.PropTypes.func  # Called with new expression

#   # Handle add filter clicked by wrapping in and if existing, otherwise adding 
#   handleAddFilter: =>

#   render: ->
#     # If null, just add filter
#     if not @props.value
#       return @renderAddFilter()

#     # If {} placeholder, just render component without add filter
#     if _.isEmpty(@props.value)
#       return @renderExpr(@props.value)

#     If and
#     H.div null,
#       R ExprComponent, schema: @props.schema, dataSource: @props.dataSource, table: @props.table, value: @props.value, onChange: @props.onChange, parentOp: "and"
#       # Add filter link 
#       H.a onClick: @handleAddFilter, "+ Add Filter"

# class OpExprComponent extends React.Component
#   @propTypes:
#     schema: React.PropTypes.object.isRequired
#     dataSource: React.PropTypes.object.isRequired # Data source to use to get values
#     value: React.PropTypes.object   # Current value
#     onChange: React.PropTypes.func  # Called with new expression

#   render: ->
#     exprUtils = new ExprUtils(@props.schema)

#     switch @props.value.op
#       when "=", "= any"
#         return H.div style: { display: "inline-block" },
#           R ExprComponent, schema: @props.schema, dataSource: @props.dataSource, table: @props.value.table, value: @props.value.exprs[0], parentOp: @props.value.op, onChange: -> alert("todo")
