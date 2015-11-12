_ = require 'lodash'
React = require 'react'
R = React.createElement
H = React.DOM

ExprUtils = require("mwater-expressions").ExprUtils
SelectExprComponent = require './SelectExprComponent'
literalComponents = require './literalComponents'
TextArrayComponent = require './TextArrayComponent'
LinkComponent = require './LinkComponent'

# Display/editor component for an expression
# Uses ExprElementBuilder to create the tree of components
module.exports = class ExprComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired # Data source to use to get values

    table: React.PropTypes.string.isRequired # Current table
    value: React.PropTypes.object   # Current expression value
    onChange: React.PropTypes.func  # Called with new expression

    type: React.PropTypes.string    # If specified, the type (value type) of expression required. e.g. boolean
    enumValues: React.PropTypes.array # Array of { id:, name: } of enum values that can be selected. Only when type = "enum"

  render: ->
    new ExprElementBuilder(@props.schema, @props.dataSource).build(@props.value, @props.table, @props.onChange, { type: @props.type, enumValues: @props.enumValues })

class ExprElementBuilder 
  constructor: (schema, dataSource) ->
    @schema = schema
    @dataSource = dataSource

    @exprUtils = new ExprUtils(@schema)

  # Build the tree for an expression
  # Options include:
  #  type: required value type of expression
  #  key: key of the resulting element
  #  enumValues: array of { id, name } for the enumerable values to display
  #  refExpr: expression to get values for (used for literals)
  build: (expr, table, onChange, options = {}) ->
    # Create new onChange function. If a boolean type is required and the expression given is not, 
    # it will wrap it with an expression
    innerOnChange = (newExpr) =>
      # If boolean and newExpr is not boolean, wrap with appropriate expression
      exprType = @exprUtils.getExprType(newExpr)

      if options.type == "boolean" and exprType and exprType != options.type
        # Find op item that matches
        opItem = @exprUtils.findMatchingOpItems(resultType: options.type, exprTypes: [exprType])[0]

        if opItem
          # Wrap in op to make it boolean
          newExpr = { type: "op", table: table, op: opItem.op, exprs: [newExpr] }

          # Determine number of arguments to append
          args = opItem.exprTypes.length - 1

          # Add extra nulls for other arguments
          for i in [1..args]
            newExpr.exprs.push(null)

      onChange(newExpr)

    # Handle null case by returning select expression component
    if not expr?
      # text[] and enum[] are special cases that require non-standard component that can't select array
      if options.type in ["text[]", "enum[]"]
        return @buildLiteral(expr, options.type, innerOnChange, { key: options.key, enumValues: options.enumValues, refExpr: options.refExpr })

      return R SelectExprComponent, 
        schema: @schema
        table: table
        placeholder: "None"
        initiallyOpen: false
        onSelect: innerOnChange
        key: options.key
        type: if options.type != "boolean" then options.type # Boolean can be any type because of autowrapping above
        enumValues: options.enumValues

    # Handle {} placeholder
    if _.isEmpty(expr)
      return R SelectExprComponent, 
        schema: @schema
        table: table
        placeholder: "Select..."
        initiallyOpen: true
        onSelect: innerOnChange
        key: options.key
        type: if options.type != "boolean" then options.type # Boolean can be any type because of autowrapping above
        enumValues: options.enumValues

    # Handle literals
    if expr.type == "literal"
      elem = @buildLiteral(expr, expr.valueType, innerOnChange, { key: options.key, enumValues: options.enumValues, refExpr: options.refExpr })
    else if expr.type == "op"
      elem = @buildOp(expr, table, innerOnChange, options)
    else if expr.type == "field"
      elem = @buildField(expr, innerOnChange, { key: options.key })
    else if expr.type == "scalar"
      elem = @buildScalar(expr, innerOnChange, { key: options.key, type: options.type })
    else
      throw new Error("Unhandled expression type #{expr.type}")

    # Wrap element with hover links to build more complex expressions or to clear it
    links = []

    type = @exprUtils.getExprType(expr)

    # If boolean, add + And link
    if type == "boolean"
      # if @props.parentOp != "and" and @props.value.op != "and"
      links.push({ label: "+ And", onClick: => innerOnChange({ type: "op", op: "and", table: table, exprs: [expr, {}] }) })
      # if @props.parentOp != "or" and @props.value.op != "or"
      links.push({ label: "+ Or", onClick: => innerOnChange({ type: "op", op: "or", table: table, exprs: [expr, {}] }) })

    links.push({ label: "Remove", onClick: => onChange(null) })
    elem = R WrappedLinkComponent, links: links, elem

    return elem

  # Build a simple field component. No options
  buildField: (expr, onChange, options = {}) ->
    H.b null, @exprUtils.summarizeExpr(expr)

  # Display aggr if present
  buildScalar: (expr, onChange, options = {}) ->
    # Get aggregations possible on inner expression
    if expr.aggr
      aggrs = @exprUtils.getAggrs(expr.expr)

      # Get current aggr
      aggr = _.findWhere(aggrs, id: expr.aggr)

      aggrElem = R(LinkComponent, 
        dropdownItems: _.map(aggrs, (ag) -> { id: ag.id, name: ag.name }) 
        onDropdownItemClicked: (aggr) =>
          onChange(_.extend({}, expr, { aggr: aggr }))
        , aggr.name)

    # Get joins string
    t = expr.table
    joinsStr = ""
    for join in expr.joins
      joinCol = @schema.getColumn(t, join)
      joinsStr += joinCol.name + " > "
      t = joinCol.join.toTable

    # Create inner expression onChange
    innerOnChange = (value) =>
      onChange(_.extend({}, expr, { expr: value }))

    return H.div style: { display: "inline-block" },
      # Aggregate dropdown
      aggrElem
      H.b(null, joinsStr)
      # TODO what about count special handling?
      @build(expr.expr, (if expr.expr then expr.expr.table), innerOnChange, { type: options.type })

  # Builds on op component
  buildOp: (expr, table, onChange, options = {}) ->
    switch expr.op
      # For boolean vertical ops (ones with n values)
      when 'and', 'or'
        # Create inner elements
        innerElems = _.map expr.exprs, (innerExpr, i) =>
          # Create onChange that switched single value
          innerElemOnChange = (newValue) =>
            newExprs = expr.exprs.slice()
            newExprs[i] = newValue

            # Set expr value
            onChange(_.extend({}, expr, { exprs: newExprs }))

          @build(innerExpr, table, innerElemOnChange, type: "boolean")
        
        # Create vertical expression
        R(VerticalExprComponent, itemLabel: expr.op, innerElems)

      # For numeric vertical ops (ones with n values)
      when '+', '*'
        # Create inner elements
        innerElems = _.map elem.exprs, (innerExpr, i) =>
          # Create onChange that switched single value
          innerElemOnChange = (newValue) =>
            newExprs = expr.exprs.slice()
            newExprs[i] = newValue

            # Set expr value
            onChange(_.extend({}, expr, { exprs: newExprs }))

          @build(innerExpr, table, innerElemOnChange, type: "number")
        
        # Create vertical expression
        R(VerticalExprComponent, itemLabel: expr.op, innerElems)

      when "between"
        # TODO
      else
        # Horizontal expression. Render each part
        expr1Type = @exprUtils.getExprType(expr.exprs[0])
        opItem = @exprUtils.findMatchingOpItems(op: expr.op, resultType: options.type, exprTypes: [expr1Type])[0]
        if not opItem
          throw new Error("No opItem defined for op:#{expr.op}, resultType: #{options.type}, lhs:#{expr1Type}")

        lhsOnChange = (newValue) =>
          newExprs = expr.exprs.slice()
          newExprs[0] = newValue

          # Set expr value
          onChange(_.extend({}, expr, { exprs: newExprs }))
        
        lhsElem = @build(expr.exprs[0], table, lhsOnChange, type: opItem.exprTypes[0])

        # If has two expressions
        if opItem.exprTypes.length > 1
          rhsOnChange = (newValue) =>
            newExprs = expr.exprs.slice()
            newExprs[1] = newValue

            # Set expr value
            onChange(_.extend({}, expr, { exprs: newExprs }))

          rhsElem = @build(expr.exprs[1], table, rhsOnChange, type: opItem.exprTypes[1], enumValues: @exprUtils.getExprValues(expr.exprs[0]), refExpr: expr.exprs[0])

        # Create op dropdown (finding matching type and lhs, not op)
        opItems = @exprUtils.findMatchingOpItems(resultType: options.type, exprTypes: [expr1Type])

        # Remove current op
        opItems = _.filter(opItems, (oi) -> oi.op != expr.op)
        opElem = R(LinkComponent, 
          dropdownItems: _.map(opItems, (oi) -> { id: oi.op, name: oi.name }) 
          onDropdownItemClicked: (op) =>
            onChange(_.extend({}, expr, { op: op }))
          , opItem.name)

        return H.div style: { display: "inline-block" },
          lhsElem, opElem, rhsElem

  # Builds a literal component
  # Options include:
  #  key: sets the key of the component
  #  enumValues: array of { id, name } for the enumerable values to display
  #  refExpr: reference expression to use for selecting appropriate values. For example, text[] uses it to know which values to display
  buildLiteral: (expr, type, onChange, options = {}) ->
    switch type
      when "text"
        return R(literalComponents.TextComponent, key: options.key, value: expr, onChange: onChange)
      when "number"
        return R(literalComponents.NumberComponent, key: options.key, value: expr, onChange: onChange)
      when "date"
        return R(literalComponents.DateComponent, key: options.key, value: expr, onChange: onChange)
      when "datetime"
        return R(literalComponents.DatetimeComponent, key: options.key, value: expr, onChange: onChange)
      when "enum"
        return R(literalComponents.EnumComponent, 
          key: options.key, 
          value: expr, 
          enumValues: options.enumValues
          onChange: onChange)
      when "enum[]"
        return R(literalComponents.EnumArrComponent, 
          key: options.key, 
          value: expr, 
          enumValues: options.enumValues
          onChange: onChange)
      when "text[]"
        return R(TextArrayComponent, 
          key: options.key
          value: expr
          refExpr: options.refExpr
          schema: @schema
          dataSource: @dataSource
          onChange: onChange)


# Displays a set of expressions vertically with an optional label before
class VerticalExprComponent extends React.Component
  render: ->
    H.div null,
      _.map @props.children, (child) =>
        H.div null, 
          @props.itemLabel
          child


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

# # Displays an expression of any type with controls to allow it to be altered
# module.exports = class ExprComponent extends React.Component
#   @propTypes:
#     schema: React.PropTypes.object.isRequired
#     dataSource: React.PropTypes.object.isRequired # Data source to use to get values
#     table: React.PropTypes.string.isRequired # Current table
#     value: React.PropTypes.object   # Current value
#     onChange: React.PropTypes.func  # Called with new expression

#     # Optionally tell the expr component what the parent op is so that it doesn't offer to double-wrap it
#     # For example, if this is inside an "and" op, we don't want to offer to wrap this expression in "and"
#     parentOp: React.PropTypes.string

#     # Optionally tell the expr component that a literal expression is preferred (for right-hand side of comparisons)
#     preferLiteral: React.PropTypes.bool

#   render: ->
#     exprUtils = new ExprUtils(@props.schema)

#     # If null or placeholder
#     # TODO

#     # If null, use SelectExprComponent, initially closed
#     if not @props.value
#       return R SelectExprComponent, schema: @props.schema, table: @props.table, placeholder: "None", initiallyOpen: false, onSelect: @props.onChange

#     # If {} placeholder, initially open
#     if _.isEmpty(@props.value)
#       return R SelectExprComponent, schema: @props.schema, table: @props.table, placeholder: "Select...", initiallyOpen: true, onSelect: @props.onChange      

#     # Get type of expression
#     type = exprUtils.getExprType(@props.value)

#     # TODO
#     switch @props.value.type
#       when "scalar", "field" 
#         content = R ScalarExprComponent, schema: @props.schema, dataSource: @props.dataSource, value: @props.value, onChange: @props.onChange
#       when "op"
#         content = R OpExprComponent, schema: @props.schema, dataSource: @props.dataSource, value: @props.value, onChange: @props.onChange
#       else
#         content = H.code null, JSON.stringify(@props.value)

#     # If boolean, add + And link
#     if type == "boolean"
#       links = []
#       if @props.parentOp != "and" and @props.value.op != "and"
#         links.push({ label: "+ and", onClick: => @props.onChange({ type: "op", op: "and", table: @props.table, exprs: [@props.value, {}] }) })
#       if @props.parentOp != "or" and @props.value.op != "or"
#         links.push({ label: "+ or", onClick: => @props.onChange({ type: "op", op: "or", table: @props.table, exprs: [@props.value, {}] }) })
#       if links.length > 0
#         content = R WrappedLinkComponent, links: links, content

#     return content

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
#           @props.value.op #TODO
#           R ExprComponent, schema: @props.schema, dataSource: @props.dataSource, table: @props.value.table, value: @props.value.exprs[1], parentOp: @props.value.op, onChange: -> alert("todo")
#       when "and", "or"
#         # Vertical stack
#         return H.table null,
#           H.tbody null,
#             _.map @props.value.exprs, (expr, i) =>
#               H.tr null,
#                 H.td null, 
#                   if i > 0 then @props.value.op
#                 H.td null, 
#                   R ExprComponent, schema: @props.schema, dataSource: @props.dataSource, table: @props.value.table, value: @props.value.exprs[i], parentOp: @props.value.op, onChange: -> alert("todo")


# LinkComponent = require './LinkComponent'

# class ScalarExprComponent extends React.Component
#   @propTypes:
#     schema: React.PropTypes.object.isRequired
#     value: React.PropTypes.object   # Current value
#     onChange: React.PropTypes.func  # Called with new expression

#   render: ->
#     exprUtils = new ExprUtils(@props.schema)

#     R LinkComponent, {}, exprUtils.summarizeExpr(@props.value)

