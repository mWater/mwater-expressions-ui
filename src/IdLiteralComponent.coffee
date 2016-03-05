_ = require 'lodash'
React = require 'react'
H = React.DOM
ReactSelect = require 'react-select'
ExprCompiler = require("mwater-expressions").ExprCompiler
AsyncLoadComponent = require 'react-library/lib/AsyncLoadComponent'

# Displays a combo box that allows selecting multiple text values from an expression
# Needs two indexes to work fast:
# create index on some_table (label_column);
# create index on some_table (lower(label_column) text_pattern_ops);

module.exports = class IdLiteralComponent extends AsyncLoadComponent
  @propTypes: 
    value: React.PropTypes.object # Literal { type: "literal", valueType: "id", idTable: <some table id>, value: <primary key> }
    onChange: React.PropTypes.func.isRequired 
    idTable: React.PropTypes.string.isRequired # Array of id and name (localized string)
    schema: React.PropTypes.object.isRequired # Schema of the database
    dataSource: React.PropTypes.object.isRequired # Data source to use to get values

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
    if table.label
      labelColumn = { type: "field", tableAlias: "main", column: table.label }
    else # Use primary key. Ugly, but what else to do?
      labelColumn = idColumn

    # select <label column> as value from <table> where <label column> ~* 'input%' limit 50
    query = {
      type: "query"
      selects: [
        { type: "select", expr: idColumn, alias: "value" }
        { type: "select", expr: labelColumn, alias: "label" }
      ]
      from: { type: "table", table: @props.idTable, alias: "main" }
      where: {
        type: "op"
        op: "="
        exprs: [
          idColumn
          props.value.value
        ]
      }
    }

    # Execute query
    props.dataSource.performQuery query, (err, rows) =>
      if err or not rows[0]
        callback(currentValue: null)
        return 

      callback(currentValue: { label: rows[0].label, value: rows[0].value })

  handleChange: (value) =>
    if value
      @props.onChange({ type: "literal", valueType: "id", idTable: @props.idTable, value: value })
    else
      @props.onChange(null)

  getOptions: (input, cb) =>
    # If no input, or just displaying current value
    if not input or _.isObject(input)
      # No options
      cb(null, {
        options: []
        complete: false
      })
      return

    table = @props.schema.getTable(@props.idTable)

    # Primary key column
    idColumn = { type: "field", tableAlias: "main", column: table.primaryKey }
    if table.label
      labelColumn = { type: "field", tableAlias: "main", column: table.label }
    else # Use primary key. Ugly, but what else to do?
      labelColumn = idColumn

    # select <label column> as value from <table> where <label column> ~* 'input%' limit 50
    query = {
      type: "query"
      selects: [
        { type: "select", expr: idColumn, alias: "value" }
        { type: "select", expr: labelColumn, alias: "label" }
      ]
      from: { type: "table", table: @props.idTable, alias: "main" }
      where: {
        type: "op"
        op: "like"
        exprs: [
          { type: "op", op: "lower", exprs: [labelColumn] }
          input.toLowerCase() + "%"
        ]
      }
      orderBy: [{ ordinal: 2, direction: "asc" }]
      limit: 50
    }

    # Execute query
    @props.dataSource.performQuery query, (err, rows) =>
      if err
        cb(err)
        return 

      # Filter null and blank
      rows = _.filter(rows, (r) -> r.label)

      cb(null, {
        options: _.map(rows, (r) -> { value: r.value, label: r.label })
        complete: false # TODO rows.length < 50 # Complete if didn't hit limit
      })

    return

  render: ->
    H.div style: { width: "100%" },
      React.createElement(ReactSelect, { 
        value: if @state.currentValue then @state.currentValue else "" #else (if @props.value and @props.value.value then @props.value.value else "")
        placeholder: "Select"
        asyncOptions: @getOptions
        isLoading: @state.loading
        onChange: @handleChange
      })

