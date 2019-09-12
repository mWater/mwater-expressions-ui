PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
R = React.createElement
AsyncReactSelect = require('react-select/lib/Async').default
ExprCompiler = require("mwater-expressions").ExprCompiler
AsyncLoadComponent = require 'react-library/lib/AsyncLoadComponent'

# Displays a combo box that allows selecting one or multiple text values from an expression
# Needs two indexes to work fast:
# create index on some_table (label_column);
# create index on some_table (lower(label_column) text_pattern_ops);
module.exports = class IdLiteralComponent extends AsyncLoadComponent
  @propTypes: 
    value: PropTypes.any # String value of primary key or array of primary keys
    onChange: PropTypes.func.isRequired  # Called with primary key or array of primary keys
    idTable: PropTypes.string.isRequired # Array of id and name (localized string)
    schema: PropTypes.object.isRequired # Schema of the database
    dataSource: PropTypes.object.isRequired # Data source to use to get values
    placeholder: PropTypes.string
    orderBy: PropTypes.array   # Optional extra orderings. Put "main" as tableAlias. JsonQL
    multi: PropTypes.bool      # Allow multiple values (id[] type)
    filter: PropTypes.object   # Optional extra filter. Put "main" as tableAlias. JsonQL
    labelExpr: PropTypes.object # Optional label expression to use. Defaults to label column or PK if none. JsonQL

  focus: ->
    @select.focus()

  # Override to determine if a load is needed. Not called on mounting
  isLoadNeeded: (newProps, oldProps) -> 
    return newProps.value != oldProps.value or newProps.idTable != oldProps.idTable

  # Call callback with state changes
  load: (props, prevProps, callback) ->
    # Create query to get current value
    if not props.value 
      callback(currentValue: null)
      return

    table = props.schema.getTable(props.idTable)

    # Primary key column
    idColumn = { type: "field", tableAlias: "main", column: table.primaryKey }
    labelExpr = @getLabelExpr()

    query = {
      type: "query"
      selects: [
        { type: "select", expr: idColumn, alias: "value" }
        { type: "select", expr: labelExpr, alias: "label" }
      ]
      from: { type: "table", table: @props.idTable, alias: "main" }
      where: {
        type: "op"
        op: "="
        modifier: "any"
        exprs: [
          idColumn
          { type: "literal", value: (if props.multi then props.value else [props.value]) }
        ]
      }
    }

    # Execute query
    props.dataSource.performQuery query, (err, rows) =>
      if err or not rows[0]
        callback(currentValue: null)
        return 
      if not @props.multi
        callback(currentValue: rows[0])
      else
        callback(currentValue: rows)

  handleChange: (value) =>
    if @props.multi
      if value and value.length == 0
        @props.onChange(null)
      else
        @props.onChange(_.pluck(value, "value"))
    else
      @props.onChange(value?.value)

  getLabelExpr: ->
    if @props.labelExpr
      return @props.labelExpr

    table = @props.schema.getTable(@props.idTable)
    if table.label
      return { type: "field", tableAlias: "main", column: table.label }

    # Use primary key. Ugly, but what else to do?
    return { type: "field", tableAlias: "main", column: table.primaryKey }

  loadOptions: (input, cb) =>
    table = @props.schema.getTable(@props.idTable)

    # Primary key column
    idColumn = { type: "field", tableAlias: "main", column: table.primaryKey }
    labelExpr = @getLabelExpr()

    if input
      where = {
        type: "op"
        op: "like"
        exprs: [
          { type: "op", op: "lower", exprs: [labelExpr] }
          input.toLowerCase() + "%"
        ]
      }
    else  
      where = null 

    # select <label column> as value from <table> where <label column> ~* 'input%' limit 50
    query = {
      type: "query"
      selects: [
        { type: "select", expr: idColumn, alias: "value" }
        { type: "select", expr: labelExpr, alias: "label" }
      ]
      from: { type: "table", table: @props.idTable, alias: "main" }
      where: where
      orderBy: [{ ordinal: 2, direction: "asc" }]
      limit: 50
    }
    
    if @props.filter
      query.where = {
        type: "op"
        op: "and"
        exprs: [query.where, @props.filter]
      }

    # Add custom orderings
    if @props.orderBy
      query.orderBy = @props.orderBy.concat(query.orderBy)

    # Execute query
    @props.dataSource.performQuery query, (err, rows) =>
      if err
        return 

      # Filter null and blank
      rows = _.filter(rows, (r) -> r.label)

      cb(rows)

    return

  render: ->
    R 'div', style: { width: "100%" },
      R AsyncReactSelect, 
        ref: (c) => @select = c
        value: @state.currentValue
        placeholder: @props.placeholder or "Select"
        loadOptions: @loadOptions
        isMulti: @props.multi
        isClearable: true
        isLoading: @state.loading
        onChange: @handleChange
        noOptionsMessage: () => "Type to search"
        defaultOptions: true
