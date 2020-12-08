_ = require 'lodash'
PropTypes = require('prop-types')
React = require 'react'
R = React.createElement
AsyncReactSelect = require('react-select/async').default
ExprCompiler = require("mwater-expressions").ExprCompiler

# Displays a combo box that allows selecting multiple text values from an expression
module.exports = class TextArrayComponent extends React.Component
  @propTypes: 
    value: PropTypes.object
    onChange: PropTypes.func.isRequired 
    refExpr: PropTypes.object.isRequired # Expression for the text values to select from
    schema: PropTypes.object.isRequired # Schema of the database
    dataSource: PropTypes.object.isRequired # Data source to use to get values

  focus: ->
    @select.focus()

  handleChange: (value) =>
    if value and value.length > 0
      @props.onChange({ type: "literal", valueType: "text[]", value: _.pluck(value, "label") })
    else
      @props.onChange(null)

  escapeRegex: (s) ->
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')

  loadOptions: (input, cb) =>
    # Create query to get matches ordered by most frequent to least
    exprCompiler = new ExprCompiler(@props.schema)

    # select <compiled expr> as value, count(*) as number from <table> where <compiled expr> like 'input%' group by value order by number desc limit 50
    query = {
      type: "query"
      selects: [
        { type: "select", expr: exprCompiler.compileExpr(expr: @props.refExpr, tableAlias: "main"), alias: "value" }
        { type: "select", expr: { type: "op", op: "count", exprs: [] }, alias: "number" }
      ]
      from: exprCompiler.compileTable(@props.refExpr.table, "main") 
      where: {
        type: "op"
        op: "~*"
        exprs: [
          exprCompiler.compileExpr(expr: @props.refExpr, tableAlias: "main")
          "^" + @escapeRegex(input)
        ]
      }
      groupBy: [1]
      orderBy: [{ ordinal: 2, direction: "desc" }, { ordinal: 1, direction: "asc" }]
      limit: 50
    }

    # Execute query
    @props.dataSource.performQuery query, (err, rows) =>
      if err
        return 

      # Filter null and blank
      rows = _.filter(rows, (r) -> r.value)

      cb(_.map(rows, (r) -> { value: r.value, label: r.value }))

    return

  render: ->
    value = _.map(@props.value?.value, (v) => { label: v, value: v })

    R 'div', style: { width: "100%" },
      R AsyncReactSelect, 
        ref: (c) => @select = c
        value: value
        isMulti: true
        placeholder: "Select..."
        defaultOptions: true
        loadOptions: @loadOptions
        onChange: @handleChange

