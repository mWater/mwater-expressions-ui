PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
R = React.createElement

ExprUtils = require('mwater-expressions').ExprUtils

module.exports = class SelectFormulaExprComponent extends React.Component
  @propTypes:
    value: PropTypes.object   # Current expression value
    onChange: PropTypes.func.isRequired # Called with new expression

    # Props to narrow down choices
    table: PropTypes.string     # Current table
    allowCase: PropTypes.bool    # Allow case statements
    types: PropTypes.array    # If specified, the types (value type) of expression required. e.g. ["boolean"]
    aggrStatuses: PropTypes.array # statuses of aggregation to allow. list of "individual", "literal", "aggregate". Default: ["individual", "literal"]

  constructor: (props) ->
    super(props)

    @state = {
      searchText: ""
    }

  componentDidMount: ->
    @searchComp?.focus()

  handleSearchTextChange: (ev) =>
    @setState(searchText: ev.target.value)

  handleIfSelected: =>
    ifExpr = {
      type: "case"
      cases: [{ when: null, then: null }]
      else: null
    }
    if @props.table
      ifExpr.table = @props.table

    @props.onChange(ifExpr)

  handleScoreSelected: =>
    scoreExpr = {
      type: "score"
      input: null
      scores: {}
    }
    if @props.table
      scoreExpr.table = @props.table

    @props.onChange(scoreExpr)

  handleBuildEnumsetSelected: =>
    expr = {
      type: "build enumset"
      values: {}
    }
    if @props.table
      expr.table = @props.table
    @props.onChange(expr)

  handleOpSelected: (op) =>
    expr = {
      type: "op"
      op: op
      exprs: []
    }
    if @props.table
      expr.table = @props.table

    @props.onChange(expr)

  render: ->
    if @state.searchText 
      filter = new RegExp(_.escapeRegExp(@state.searchText), "i")

    # Create list of formula
    items = []

    # Add if statement (unless boolean only, in which case if/thens cause problems by returning null)
    if @props.allowCase
      items.push({ name: "If/then", desc: "Choose different values based on a condition", onClick: @handleIfSelected })

    # Add score if has number possible
    if not @props.types or 'number' in @props.types
      items.push({ name: "Score", desc: "Assign scores to different choices of a field and find total.", onClick: @handleScoreSelected })


    # Only allow aggregate expressions if relevant
    aggr = null
    if "aggregate" not in @props.aggrStatuses
      aggr = false

    # Add ops that are prefix ones (like "latitude of")
    exprUtils = new ExprUtils(@props.schema)
    opItems = exprUtils.findMatchingOpItems(resultTypes: @props.types, prefix: true, aggr: aggr)
    for opItem in _.uniq(opItems, "op")
      items.push({ name: opItem.name, desc: opItem.desc, onClick: @handleOpSelected.bind(null, opItem.op) })

    # Add build enumset if has enumset possible and has values
    if (not @props.types or 'enumset' in @props.types) and @props.enumValues and @props.enumValues.length > 0
      items.push({ name: "Build enumset", desc: "Advanced: Create a multi-choice answer based on conditions", onClick: @handleBuildEnumsetSelected })

    if @state.searchText 
      filter = new RegExp(_.escapeRegExp(@state.searchText), "i")
      items = _.filter(items, (item) -> item.name.match(filter) or item.desc.match(filter))

    R 'div', null,
      R 'input', 
        ref: (c) => @searchComp = c
        type: "text"
        placeholder: "Search Formulas..."
        className: "form-control input-lg"
        value: @state.searchText
        onChange: @handleSearchTextChange

      # Create list
      R 'div', style: { paddingTop: 10 },
        _.map items, (item) =>
          R 'div', 
            key: item.name
            style: {
              padding: 4
              borderRadius: 4
              cursor: "pointer"
              color: "#478"
            }
            className: "hover-grey-background"
            onClick: item.onClick,
              item.name
              if item.desc
                R 'span', className: "text-muted", style: { fontSize: 12, paddingLeft: 3 }, " - " + item.desc
