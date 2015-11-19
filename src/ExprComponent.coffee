_ = require 'lodash'
React = require 'react'
R = React.createElement
H = React.DOM

ExprCleaner = require("mwater-expressions").ExprCleaner
ExprUtils = require("mwater-expressions").ExprUtils
OmniBoxExprComponent = require './OmniBoxExprComponent'
literalComponents = require './literalComponents'
TextArrayComponent = require './TextArrayComponent'
LinkComponent = require './LinkComponent'
StackedComponent = require './StackedComponent'

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

    type: React.PropTypes.string    # If specified, the type (value type) of expression required. e.g. boolean
    enumValues: React.PropTypes.array # Array of { id:, name: } of enum values that can be selected. Only when type = "enum"
    idTable: React.PropTypes.string # If specified the table from which id-type expressions must come

    preferLiteral: React.PropTypes.bool # True to prefer literal expressions
    includeCount: React.PropTypes.bool # true to include count (id) item at root level in expression selector

  # Clean expression and pass up
  handleChange: (expr) =>
    # Clean expression
    expr = new ExprCleaner(@props.schema).cleanExpr(expr, {
      table: @props.table
      type: @props.type
      enumValueIds: if @props.enumValues then _.pluck(@props.enumValues, "id")
    })

    @props.onChange(expr)

  render: ->
    new ExprElementBuilder(@props.schema, @props.dataSource).build(@props.value, @props.table, @handleChange, { 
      type: @props.type
      enumValues: @props.enumValues 
      preferLiteral: @props.preferLiteral
      idTable: @props.idTable
      })

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
  #  idTable: the table from which id-type expressions must come
  #  refExpr: expression to get values for (used for literals). This is primarily for text fields to allow easy selecting of literal values
  #  preferLiteral: to preferentially choose literal expressions (used for RHS of expressions)
  #  suppressWrapOps: pass ops to *not* offer to wrap in
  #  includeCount: true to include count (id) item at root level in expression selector
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

    # Get type (what it is, or barring that, what it should be)
    exprType = @exprUtils.getExprType(expr) or options.type

    # If text[] or enum[], use special component
    if exprType == "text[]"
      return R(TextArrayComponent, 
        key: options.key
        value: expr
        refExpr: options.refExpr
        schema: @schema
        dataSource: @dataSource
        onChange: onChange)

    if exprType == "enum[]"
      return R(literalComponents.EnumArrComponent, 
        key: options.key, 
        value: expr, 
        enumValues: options.enumValues
        onChange: onChange)

    # Handle empty and literals with OmniBox
    if not expr or not expr.type or expr.type == "literal"
      elem = R(OmniBoxExprComponent,
        schema: @schema
        table: table
        value: expr
        onChange: innerOnChange
        # Allow any type for boolean due to wrapping
        type: if options.type != "boolean" then options.type
        enumValues: options.enumValues
        initialMode: if options.preferLiteral then "literal"
        includeCount: options.includeCount
        enumValues: options.enumValues)

    else if expr.type == "op"
      elem = @buildOp(expr, table, innerOnChange, options)
    else if expr.type == "field"
      elem = @buildField(expr, innerOnChange, { key: options.key })
    else if expr.type == "scalar"
      elem = @buildScalar(expr, innerOnChange, { key: options.key, type: options.type })
    else if expr.type == "case"
      elem = @buildCase(expr, innerOnChange, { key: options.key, type: options.type, enumValues: options.enumValues })
    else if expr.type == "id"
      elem = @buildId(expr, innerOnChange, { key: options.key })
    else
      throw new Error("Unhandled expression type #{expr.type}")

    # Wrap element with hover links to build more complex expressions or to clear it
    links = []

    type = @exprUtils.getExprType(expr)

    # If boolean, add and/or link
    createWrapOp = (op, name, binaryOnly) =>
      if op not in (options.suppressWrapOps or [])
        # Prevent nesting when simple adding would work
        if expr.op != op or binaryOnly
          links.push({ label: name, onClick: => innerOnChange({ type: "op", op: op, table: table, exprs: [expr, null] }) })
        else
          # Just add extra element
          links.push({ label: name, onClick: => 
            exprs = expr.exprs.slice()
            exprs.push(null)
            innerOnChange(_.extend({}, expr, { exprs: exprs }))
          })

    if type == "boolean"
      createWrapOp("and", "+ And", false)
      createWrapOp("or", "+ Or", false)

    if type == "number"
      createWrapOp("+", "+", false)
      createWrapOp("-", "-", true)
      createWrapOp("*", "*", false)
      createWrapOp("/", "/", true)

    # Add + If
    if expr and expr.type == "case"
      links.push({ label: "+ If", onClick: => 
        cases = expr.cases.slice()
        cases.push({ when: null, then: null })
        innerOnChange(_.extend({}, expr, { cases: cases }))
      })

    # links.push({ label: "Remove", onClick: => onChange(null) })
    if links.length > 0
      elem = R WrappedLinkComponent, links: links, elem

    return elem

  # Build a simple field component. Only remove option
  buildField: (expr, onChange, options = {}) ->
    return R(LinkComponent, 
      dropdownItems: [{ id: "remove", name: "Remove" }]
      onDropdownItemClicked: => onChange(null),
      @exprUtils.summarizeExpr(expr))    

  # Build an id component. Displays table name. Only remove option
  buildId: (expr, onChange, options = {}) ->
    return R(LinkComponent, 
      dropdownItems: [{ id: "remove", name: "Remove" }]
      onDropdownItemClicked: => onChange(null),
      @exprUtils.summarizeExpr(expr)) 

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

    # If just a field or id inside, add to string and make a simple link control
    if expr.expr and expr.expr.type in ["field", "id"]
      # Summarize without aggr
      joinsStr = @exprUtils.summarizeExpr(_.omit(expr, "aggr"))
      return R(LinkComponent, 
        dropdownItems: [{ id: "remove", name: "Remove" }]
        onDropdownItemClicked: => onChange(null),
        joinsStr)

    # Create inner expression onChange
    innerOnChange = (value) =>
      onChange(_.extend({}, expr, { expr: value }))

    return H.div style: { display: "flex", alignItems: "center" },
      # Aggregate dropdown
      aggrElem
      R(LinkComponent, 
        dropdownItems: [{ id: "remove", name: "Remove" }]
        onDropdownItemClicked: => onChange(null),
        joinsStr)
      # TODO what about count special handling?
      @build(expr.expr, (if expr.expr then expr.expr.table), innerOnChange, { type: options.type })

  # Builds on op component
  buildOp: (expr, table, onChange, options = {}) ->
    switch expr.op
      # For vertical ops (ones with n values or other arithmetic)
      when 'and', 'or', '+', '*', '-', "/"
        # Create inner items
        items = _.map expr.exprs, (innerExpr, i) =>
          # Create onChange that switched single value
          innerElemOnChange = (newValue) =>
            newExprs = expr.exprs.slice()
            newExprs[i] = newValue

            # Set expr value
            onChange(_.extend({}, expr, { exprs: newExprs }))

          type = if expr.op in ['and', 'or'] then "boolean" else "number"
          elem = @build(innerExpr, table, innerElemOnChange, type: type, suppressWrapOps: [expr.op])
          handleRemove = =>
            exprs = expr.exprs.slice()
            exprs.splice(i, 1)
            onChange(_.extend({}, expr, { exprs: exprs }))          

          return { elem: elem, onRemove: handleRemove }
        
        # Create stacked expression
        R(StackedComponent, joinLabel: expr.op, items: items)
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

          rhsElem = @build(expr.exprs[1], table, rhsOnChange, type: opItem.exprTypes[1], enumValues: @exprUtils.getExprEnumValues(expr.exprs[0]), refExpr: expr.exprs[0], preferLiteral: true)

        # Create op dropdown (finding matching type and lhs, not op)
        opItems = @exprUtils.findMatchingOpItems(resultType: options.type, exprTypes: [expr1Type])

        # Remove current op
        opItems = _.filter(opItems, (oi) -> oi.op != expr.op)
        opElem = R(LinkComponent, 
          dropdownItems: _.map(opItems, (oi) -> { id: oi.op, name: oi.name }) 
          onDropdownItemClicked: (op) =>
            onChange(_.extend({}, expr, { op: op }))
          , opItem.name)

        return H.div style: { display: "flex", alignItems: "center", flexWrap: "wrap" },
          lhsElem, opElem, rhsElem

  buildCase: (expr, onChange, options) ->
    # Style for labels "if", "then", "else"
    labelStyle = { 
      flex: "0 0 auto"  # Don't resize
      padding: 5
      color: "#AAA"
    }

    # Create inner elements
    items = _.map expr.cases, (cse, i) =>
      # Create onChange functions
      innerElemOnWhenChange = (newWhen) =>
        cases = expr.cases.slice()
        cases[i] = _.extend({}, cases[i], { when: newWhen })
        onChange(_.extend({}, expr, { cases: cases }))

      innerElemOnThenChange = (newThen) =>
        cases = expr.cases.slice()
        cases[i] = _.extend({}, cases[i], { then: newThen })
        onChange(_.extend({}, expr, { cases: cases }))

      # Build a flexbox that wraps with a when and then flexbox
      elem = H.div key: "#{i}", style: { display: "flex", alignItems: "center"  },
        H.div key: "when", style: { display: "flex", alignItems: "center" },
          H.div key: "label", style: labelStyle, "if"
          @build(cse.when, expr.table, innerElemOnWhenChange, key: "content", type: "boolean", suppressWrapOps: ["if"])
        H.div key: "then", style: { display: "flex", alignItems: "center" },
          H.div key: "label", style: labelStyle, "then"
          @build(cse.then, expr.table, innerElemOnThenChange, key: "content", type: options.type, preferLiteral: true, enumValues: options.enumValues)

      handleRemove = =>
        cases = expr.cases.slice()
        cases.splice(i, 1)
        onChange(_.extend({}, expr, { cases: cases })) 

      return { elem: elem, onRemove: handleRemove }
    
    # Add else
    onElseChange = (newValue) =>
      onChange(_.extend({}, expr, { else: newValue }))

    items.push({
      elem: H.div key: "when", style: { display: "flex", alignItems: "center" },
        H.div key: "label", style: labelStyle, "else"
        @build(expr.else, expr.table, onElseChange, key: "content", type: options.type, preferLiteral: true, enumValues: options.enumValues)  
    })

    # Create stacked expression
    R(StackedComponent, items: items)

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
    H.div style: { paddingBottom: 20, position: "relative" }, className: "hover-display-parent",
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

