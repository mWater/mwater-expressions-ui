_ = require 'lodash'
React = require 'react'
R = React.createElement
H = React.DOM

ExprUtils = require("mwater-expressions").ExprUtils
SelectExprComponent = require './SelectExprComponent'

# Displays an expression of any type with controls to allow it to be altered
module.exports = class ExprComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired # Data source to use to get values
    table: React.PropTypes.string.isRequired # Current table
    value: React.PropTypes.object   # Current value
    onChange: React.PropTypes.func  # Called with new expression

    # Optionally tell the expr component what the parent op is so that it doesn't offer to double-wrap it
    # For example, if this is inside an "and" op, we don't want to offer to wrap this expression in "and"
    parentOp: React.PropTypes.string

    # Optionally tell the expr component that a literal expression is preferred (for right-hand side of comparisons)
    preferLiteral: React.PropTypes.bool

  render: ->
    exprUtils = new ExprUtils(@props.schema)

    # If null or placeholder
    # TODO

    # If null, use SelectExprComponent, initially closed
    if not @props.value
      return R SelectExprComponent, schema: @props.schema, table: @props.table, placeholder: "None", initiallyOpen: false, onSelect: @props.onChange

    # If {} placeholder, initially open
    if _.isEmpty(@props.value)
      return R SelectExprComponent, schema: @props.schema, table: @props.table, placeholder: "Select...", initiallyOpen: true, onSelect: @props.onChange      

    # Get type of expression
    type = exprUtils.getExprType(@props.value)

    # TODO
    switch @props.value.type
      when "scalar", "field" 
        content = R ScalarExprComponent, schema: @props.schema, dataSource: @props.dataSource, value: @props.value, onChange: @props.onChange
      when "op"
        content = R OpExprComponent, schema: @props.schema, dataSource: @props.dataSource, value: @props.value, onChange: @props.onChange
      else
        content = H.code null, JSON.stringify(@props.value)

    # If boolean, add + And link
    if type == "boolean"
      links = []
      if @props.parentOp != "and" and @props.value.op != "and"
        links.push({ label: "+ and", onClick: => @props.onChange({ type: "op", op: "and", table: @props.table, exprs: [@props.value, {}] }) })
      if @props.parentOp != "or" and @props.value.op != "or"
        links.push({ label: "+ or", onClick: => @props.onChange({ type: "op", op: "or", table: @props.table, exprs: [@props.value, {}] }) })
      if links.length > 0
        content = R WrappedLinkComponent, links: links, content

    return content

class OpExprComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired # Data source to use to get values
    value: React.PropTypes.object   # Current value
    onChange: React.PropTypes.func  # Called with new expression

  render: ->
    exprUtils = new ExprUtils(@props.schema)

    switch @props.value.op
      when "=", "= any"
        return H.div style: { display: "inline-block" },
          R ExprComponent, schema: @props.schema, dataSource: @props.dataSource, table: @props.value.table, value: @props.value.exprs[0], parentOp: @props.value.op, onChange: -> alert("todo")
          @props.value.op #TODO
          R ExprComponent, schema: @props.schema, dataSource: @props.dataSource, table: @props.value.table, value: @props.value.exprs[1], parentOp: @props.value.op, onChange: -> alert("todo")
      when "and", "or"
        # Vertical stack
        return H.table null,
          H.tbody null,
            _.map @props.value.exprs, (expr, i) =>
              H.tr null,
                H.td null, 
                  if i > 0 then @props.value.op
                H.td null, 
                  R ExprComponent, schema: @props.schema, dataSource: @props.dataSource, table: @props.value.table, value: @props.value.exprs[i], parentOp: @props.value.op, onChange: -> alert("todo")


LinkComponent = require './LinkComponent'

class ScalarExprComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired
    value: React.PropTypes.object   # Current value
    onChange: React.PropTypes.func  # Called with new expression

  render: ->
    exprUtils = new ExprUtils(@props.schema)

    R LinkComponent, {}, exprUtils.summarizeExpr(@props.value)

# TODO DOC
class WrappedLinkComponent extends React.Component
  @propTypes:
    links: React.PropTypes.array.isRequired # Shape is label, onClick

  renderLinks: ->
    H.div style: { 
      position: "absolute"
      left: 10
      bottom: 0 
    }, className: "hover-display-child",
      _.map @props.links, (link, i) =>
        H.a key: "#{i}", style: { 
          paddingLeft: 3
          paddingRight: 3
          backgroundColor: "white"
          cursor: "pointer"
          fontSize: 12
        }, onClick: link.onClick,
          link.label

  render: ->
    H.div style: { display: "inline-block", paddingBottom: 20, position: "relative" }, className: "hover-display-parent",
      H.div style: { 
        position: "absolute"
        height: 10
        bottom: 10
        left: 0
        right: 0
        borderLeft: "solid 1px #DDD" 
        borderBottom: "solid 1px #DDD" 
        borderRight: "solid 1px #DDD" 
      }, className: "hover-display-child"
      @renderLinks(),
        @props.children