_ = require 'lodash'
React = require 'react'
R = React.createElement
H = React.DOM

ExprUtils = require("mwater-expressions").ExprUtils
OmniBoxExprComponent = require './OmniBoxExprComponent'
ExprUtils = require("mwater-expressions").ExprUtils
EnumSetComponent = require './EnumSetComponent'
TextArrayComponent = require './TextArrayComponent'
LinkComponent = require './LinkComponent'
StackedComponent = require './StackedComponent'
IdLiteralComponent = require './IdLiteralComponent'
ScoreExprComponent = require './ScoreExprComponent'

# Builds a react element for an expression
module.exports = class ExprElementBuilder 
  constructor: (schema, dataSource, locale) ->
    @schema = schema
    @dataSource = dataSource
    @locale = locale

    @exprUtils = new ExprUtils(@schema)

  # Build the tree for an expression
  # Options include:
  #   types: required value types of expression e.g. ['boolean']
  #   key: key of the resulting element
  #   enumValues: array of { id, name } for the enumerable values to display
  #   idTable: the table from which id-type expressions must come
  #   refExpr: expression to get values for (used for literals). This is primarily for text fields to allow easy selecting of literal values
  #   preferLiteral: to preferentially choose literal expressions (used for RHS of expressions)
  #   suppressWrapOps: pass ops to *not* offer to wrap in
  #   includeAggr: true to include count (id) item at root level in expression selector
  #   aggrStatuses: statuses of aggregation to allow. list of "individual", "literal", "aggregate". Default: ["individual", "literal"]
  #   placeholder: empty placeholder
  build: (expr, table, onChange, options = {}) ->
    _.defaults(options, {
      aggrStatuses: ["individual", "literal"]
      })

    # True if a boolean expression is required
    booleanOnly = options.types and options.types.length == 1 and options.types[0] == "boolean" 

    # True if an aggregate number or individual boolean is required, in which case any expression can be transformed into it
    anyTypeAllowed = not options.types or ("boolean" in options.types and "individual" in options.aggrStatuses and options.types.length == 1) or ("number" in options.types and "aggregate" in options.aggrStatuses)

    # Get current expression type
    exprType = @exprUtils.getExprType(expr)

    # If text[], enumset or id literal, use special component
    if (expr and expr.type == "literal") or (not expr and options.preferLiteral)
      if exprType == "text[]" or _.isEqual(options.types, ["text[]"])
        return R(TextArrayComponent, 
          key: options.key
          value: expr
          refExpr: options.refExpr
          schema: @schema
          dataSource: @dataSource
          onChange: onChange)

      if exprType == "enumset" or _.isEqual(options.types, ["enumset"])
        return R(EnumSetComponent, 
          key: options.key, 
          value: expr, 
          enumValues: options.enumValues
          onChange: onChange)

      if exprType == "id" or _.isEqual(options.types, ["id"]) and options.idTable
        idTable = options.idTable or @exprUtils.getExprIdTable(expr)
        return R(IdLiteralComponent, 
          key: options.key
          value: expr?.value
          idTable: idTable
          schema: @schema
          dataSource: @dataSource
          onChange: (value) => onChange(if value then { type: "literal", valueType: "id", idTable: idTable, value: value } else null))

      if exprType == "id[]" or _.isEqual(options.types, ["id[]"]) and options.idTable
        idTable = options.idTable or @exprUtils.getExprIdTable(expr)
        return R(IdLiteralComponent, 
          key: options.key
          value: expr?.value
          idTable: idTable
          schema: @schema
          dataSource: @dataSource
          multi: true
          onChange: (value) => onChange(if value then { type: "literal", valueType: "id[]", idTable: idTable, value: value } else null))

    # Handle empty and literals with OmniBox
    if not expr or not expr.type or expr.type == "literal"
      elem = R(OmniBoxExprComponent,
        schema: @schema
        table: table
        value: expr
        onChange: onChange
        # Allow any type if transformable
        types: if not anyTypeAllowed then options.types
        # Case statements only when not boolean
        allowCase: not booleanOnly
        enumValues: options.enumValues
        idTable: options.idTable
        initialMode: if options.preferLiteral then "literal"
        includeAggr: options.includeAggr
        aggrStatuses: options.aggrStatuses
        noFormulaPlaceholder: options.placeholder
        noLiteralPlaceholder: options.placeholder
      )

    else if expr.type == "op"
      elem = @buildOp(expr, table, onChange, options)
    else if expr.type == "field"
      elem = @buildField(expr, onChange, { key: options.key })
    else if expr.type == "scalar"
      elem = @buildScalar(expr, onChange, { key: options.key, types: options.types, enumValues: options.enumValues })
    else if expr.type == "case"
      elem = @buildCase(expr, onChange, { key: options.key, types: options.types, enumValues: options.enumValues })
    else if expr.type == "id"
      elem = @buildId(expr, onChange, { key: options.key })
    else if expr.type == "score"
      elem = @buildScore(expr, onChange, { key: options.key })
    else
      throw new Error("Unhandled expression type #{expr.type}")

    # Wrap element with hover links to build more complex expressions or to clear it
    links = []

    # If boolean, add and/or link
    createWrapOp = (op, name, binaryOnly) =>
      if op not in (options.suppressWrapOps or [])
        # Prevent nesting when simple adding would work
        if expr.op != op or binaryOnly
          links.push({ label: name, onClick: => onChange({ type: "op", op: op, table: table, exprs: [expr, null] }) })
        else
          # Just add extra element
          links.push({ label: name, onClick: => 
            exprs = expr.exprs.slice()
            exprs.push(null)
            onChange(_.extend({}, expr, { exprs: exprs }))
          })

    if exprType == "boolean"
      createWrapOp("and", "+ And", false)
      createWrapOp("or", "+ Or", false)

    if exprType == "number"
      createWrapOp("+", "+", false)
      createWrapOp("-", "-", true)
      createWrapOp("*", "*", false)
      createWrapOp("/", "/", true)

    # Add + If
    if expr and expr.type == "case"
      links.push({ label: "+ If", onClick: => 
        cases = expr.cases.slice()
        cases.push({ when: null, then: null })
        onChange(_.extend({}, expr, { cases: cases }))
      })

    # links.push({ label: "Remove", onClick: => onChange(null) })
    if links.length > 0
      elem = R WrappedLinkComponent, links: links, elem

    return elem

  # Build a simple field component. Only remove option
  buildField: (expr, onChange, options = {}) ->
    return R(LinkComponent, 
      onRemove: => onChange(null),
      @exprUtils.summarizeExpr(expr))    

  # Build an id component. Displays table name. Only remove option
  buildId: (expr, onChange, options = {}) ->
    return R(LinkComponent, 
      dropdownItems: [{ id: "remove", name: "Remove" }]
      onDropdownItemClicked: => onChange(null),
      @exprUtils.summarizeExpr(expr)) 

  buildScalar: (expr, onChange, options = {}) ->
    # Get joins string
    destTable = expr.table
    joinsStr = ""
    for join in expr.joins
      joinCol = @schema.getColumn(destTable, join)
      joinsStr += ExprUtils.localizeString(joinCol.name, @locale) + " > "
      destTable = joinCol.join.toTable

    # If just a field or id inside, add to string and make a simple link control
    if expr.expr and expr.expr.type in ["field", "id"]
      # Summarize without aggregation
      summary = @exprUtils.summarizeExpr(_.omit(expr, "aggr"))

      return H.div style: { display: "flex", alignItems: "baseline" },
        # Aggregate dropdown
        R(LinkComponent, 
          onRemove: => onChange(null)
          summary)
    else
      # Create inner expression onChange
      innerOnChange = (value) =>
        onChange(_.extend({}, expr, { expr: value }))

      # Determine if can allow aggregation
      multipleJoins = @exprUtils.isMultipleJoins(expr.table, expr.joins)
      innerAggrStatuses = if multipleJoins then ["literal", "aggregate"] else ["literal", "individual"]

      # TODO what about count special handling?
      innerElem = @build(expr.expr, destTable, innerOnChange, { types: options.types, idTable: options.idTable, enumValues: options.enumValues, aggrStatuses: innerAggrStatuses })

    return H.div style: { display: "flex", alignItems: "baseline" },
      R(LinkComponent, 
        onRemove: => onChange(null),
        joinsStr)
      innerElem

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

          types = if expr.op in ['and', 'or'] then ["boolean"] else ["number"]
          elem = @build(innerExpr, table, innerElemOnChange, types: types, suppressWrapOps: [expr.op], key: "expr#{i}")
          handleRemove = =>
            exprs = expr.exprs.slice()
            exprs.splice(i, 1)
            onChange(_.extend({}, expr, { exprs: exprs }))          

          return { elem: elem, onRemove: handleRemove }
        
        # Create stacked expression
        R(StackedComponent, joinLabel: expr.op, items: items)
      else
        # Horizontal expression. Render each part
        opItems = @exprUtils.findMatchingOpItems(op: expr.op, resultTypes: options.types, lhsExpr: expr.exprs[0])
        opItem = opItems[0]
        if not opItem
          throw new Error("No opItem defined for op:#{expr.op}, resultType: #{options.types}, lhs:#{JSON.stringify(expr.exprs[0])}")

        # Special case for no expressions
        if opItem.exprTypes.length == 0
          return R(LinkComponent, 
            onRemove: =>
              onChange(null)
            , @exprUtils.summarizeExpr(expr, @locale))

        innerAggrStatuses = if opItem.aggr then ["literal", "individual"] else options.aggrStatuses

        lhsOnChange = (newValue) =>
          newExprs = expr.exprs.slice()
          newExprs[0] = newValue

          # Set expr value
          onChange(_.extend({}, expr, { exprs: newExprs }))
        
        # lhs type is matching op item
        lhsTypes = [opItem.exprTypes[0]]

        # However, if there are multiple possibilities and there is no existing lhs, allow all (as in days difference can take date or datetime)
        if not expr.exprs[0]
          lhsTypes = _.map(opItems, (oi) -> oi.exprTypes[0])

        lhsElem = @build(expr.exprs[0], table, lhsOnChange, types: lhsTypes, aggrStatuses: innerAggrStatuses, key: "lhs", placeholder: opItem.lhsPlaceholder)

        # Special case for between 
        if expr.op == "between"
          rhs1OnChange = (newValue) =>
            newExprs = expr.exprs.slice()
            newExprs[1] = newValue

            # Set expr value
            onChange(_.extend({}, expr, { exprs: newExprs }))

          rhs2OnChange = (newValue) =>
            newExprs = expr.exprs.slice()
            newExprs[2] = newValue

            # Set expr value
            onChange(_.extend({}, expr, { exprs: newExprs }))

          # Build rhs
          rhsElem = [
            @build(expr.exprs[1], table, rhs1OnChange, types: [opItem.exprTypes[1]], enumValues: @exprUtils.getExprEnumValues(expr.exprs[0]), idTable: @exprUtils.getExprIdTable(expr.exprs[0]), refExpr: expr.exprs[0], preferLiteral: true, aggrStatuses: innerAggrStatuses, key: "expr1")
            "\u00A0and\u00A0"
            @build(expr.exprs[2], table, rhs2OnChange, types: [opItem.exprTypes[2]], enumValues: @exprUtils.getExprEnumValues(expr.exprs[0]), idTable: @exprUtils.getExprIdTable(expr.exprs[0]), refExpr: expr.exprs[0], preferLiteral: true, aggrStatuses: innerAggrStatuses, key: "expr2")
          ]
        else if opItem.exprTypes.length > 1 # If has two expressions
          rhsOnChange = (newValue) =>
            newExprs = expr.exprs.slice()
            newExprs[1] = newValue

            # Set expr value
            onChange(_.extend({}, expr, { exprs: newExprs }))

          rhsElem = @build(expr.exprs[1], table, rhsOnChange, {
            key: "rhs"
            types: [opItem.exprTypes[1]]
            enumValues: @exprUtils.getExprEnumValues(expr.exprs[0])
            idTable: @exprUtils.getExprIdTable(expr.exprs[0])
            refExpr: expr.exprs[0]
            preferLiteral: opItem.rhsLiteral
            aggrStatuses: innerAggrStatuses            
            placeholder: opItem.rhsPlaceholder
          })

        # Create op dropdown (finding matching type and lhs, not op). Allow aggregates if appropriate
        aggr = null
        if "aggregate" not in options.aggrStatuses
          aggr = false

        opItems = @exprUtils.findMatchingOpItems(resultTypes: options.types, lhsExpr: expr.exprs[0], aggr: aggr)

        # Remove current op
        opItems = _.filter(opItems, (oi) -> oi.op != expr.op)

        # Prefix toggle must be the same as current expr
        opItems = _.filter(opItems, (oi) -> oi.prefix == opItem.prefix)

        # Keep distinct ops
        opItems = _.uniq(opItems, "op")

        opElem = R(LinkComponent, 
          dropdownItems: if opItems.length > 0 then _.map(opItems, (oi) -> { id: oi.op, name: oi.name }) 
          onDropdownItemClicked: (op) =>
            onChange(_.extend({}, expr, { op: op }))
          onRemove: =>
            onChange(null)
          , opItem.name)

        # Some ops have prefix (e.g. "latitude of")
        if opItem.prefix
          return H.div style: { display: "flex", alignItems: "baseline", flexWrap: "wrap" },
            opElem
            lhsElem
            if opItem.joiner then H.span(style: { paddingLeft: 5, paddingRight: 5 }, opItem.joiner)
            rhsElem
        else
          return H.div style: { display: "flex", alignItems: "baseline", flexWrap: "wrap" },
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
      elem = H.div key: "#{i}", style: { display: "flex", alignItems: "baseline"  },
        H.div key: "when", style: { display: "flex", alignItems: "baseline" },
          H.div key: "label", style: labelStyle, "if"
          @build(cse.when, expr.table, innerElemOnWhenChange, key: "content", types: ["boolean"], suppressWrapOps: ["if"])
        H.div key: "then", style: { display: "flex", alignItems: "baseline" },
          H.div key: "label", style: labelStyle, "then"
          @build(cse.then, expr.table, innerElemOnThenChange, key: "content", types: options.types, preferLiteral: true, enumValues: options.enumValues)

      handleRemove = =>
        cases = expr.cases.slice()
        cases.splice(i, 1)
        onChange(_.extend({}, expr, { cases: cases })) 

      return { elem: elem, onRemove: handleRemove }
    
    # Add else
    onElseChange = (newValue) =>
      onChange(_.extend({}, expr, { else: newValue }))

    items.push({
      elem: H.div key: "when", style: { display: "flex", alignItems: "baseline" },
        H.div key: "label", style: labelStyle, "else"
        @build(expr.else, expr.table, onElseChange, key: "content", types: options.types, preferLiteral: true, enumValues: options.enumValues)  
    })

    # Create stacked expression
    R(StackedComponent, items: items)

  buildScore: (expr, onChange, options) ->
    return R ScoreExprComponent,
      schema: @schema
      dataSource: @dataSource
      value: expr
      onChange: onChange

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

