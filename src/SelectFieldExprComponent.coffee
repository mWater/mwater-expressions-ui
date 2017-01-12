_ = require 'lodash'
React = require 'react'
R = React.createElement
H = React.DOM

ScalarExprTreeComponent = require './ScalarExprTreeComponent'
ScalarExprTreeBuilder = require './ScalarExprTreeBuilder'
ExprUtils = require('mwater-expressions').ExprUtils

module.exports = class SelectFieldExprComponent extends React.Component
  @propTypes:
    value: React.PropTypes.object   # Current expression value
    onChange: React.PropTypes.func.isRequired # Called with new expression

    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired # Data source to use to get values

    # Props to narrow down choices
    table: React.PropTypes.string.isRequired # Current table
    types: React.PropTypes.array    # If specified, the types (value type) of expression required. e.g. ["boolean"]
    enumValues: React.PropTypes.array # Array of { id:, name: } of enum values that can be selected. Only when type = "enum"
    idTable: React.PropTypes.string # If specified the table from which id-type expressions must come
    aggrStatuses: React.PropTypes.array # statuses of aggregation to allow. list of "individual", "literal", "aggregate". Default: ["individual", "literal"]

  constructor: ->
    super

    @state = {
      searchText: ""
    }

  componentDidMount: ->
    @refs.search.focus()

  handleSearchTextChange: (ev) =>
    @setState(searchText: ev.target.value)

  # Handle a selection in the scalar expression tree. Called with { table, joins, expr }
  handleTreeChange: (val) => 
    # Loses focus when selection made
    @setState(focused: false)

    expr = val.expr
    exprUtils = new ExprUtils(@props.schema)

    # If expr is enum and enumValues specified, perform a mapping
    if exprUtils.getExprType(val.expr) == "enum" and @props.enumValues
      expr = {
        type: "case"
        table: expr.table
        cases: _.map(@props.enumValues, (ev) =>
          # Find matching name (english)
          fromEnumValues = exprUtils.getExprEnumValues(expr)
          matchingEnumValue = _.find(fromEnumValues, (fev) -> fev.name.en == ev.name.en)

          if matchingEnumValue
            literal = { type: "literal", valueType: "enumset", value: [matchingEnumValue.id] }
          else
            literal = null

          return { 
            when: { type: "op", table: expr.table, op: "= any", exprs: [expr, literal] }
            then: { type: "literal", valueType: "enum", value: ev.id }
          }
        )
        else: null
      }

    # If expr is enumset and enumValues specified, perform a mapping building an enumset
    if exprUtils.getExprType(val.expr) == "enumset" and @props.enumValues
      buildExpr = {
        type: "build enumset"
        table: expr.table
        values: {}
      }

      for ev in @props.enumValues
        # Find matching name (english)
        fromEnumValues = exprUtils.getExprEnumValues(expr)
        matchingEnumValue = _.find(fromEnumValues, (fev) -> fev.name.en == ev.name.en)

        if matchingEnumValue
          literal = { type: "literal", valueType: "enumset", value: [matchingEnumValue.id] }
        else
          literal = null

        buildExpr.values[ev.id] = { type: "op", table: expr.table, op: "contains", exprs: [expr, literal] }

      expr = buildExpr 

    # Make into expression
    if val.joins.length == 0 
      # Simple field expression
      @props.onChange(expr)
    else
      @props.onChange({ type: "scalar", table: @props.table, joins: val.joins, expr: expr })

  render: ->
    if @state.searchText 
      filter = new RegExp(_.escapeRegExp(@state.searchText), "i")

    # Create tree 
    treeBuilder = new ScalarExprTreeBuilder(@props.schema, @context.locale)
    tree = treeBuilder.getTree(table: @props.table, types: @props.types, idTable: @props.idTable, includeAggr: "aggregate" in @props.aggrStatuses, filter: filter)

    H.div null,
      H.input 
        ref: "search"
        type: "text"
        placeholder: "Search Fields..."
        className: "form-control input-lg"
        value: @state.searchText
        onChange: @handleSearchTextChange

      # Create tree component with value of table and path
      H.div style: { paddingTop: 10 },
        R ScalarExprTreeComponent, 
          key: "scalar_tree"
          tree: tree,
          onChange: @handleTreeChange
