PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
R = React.createElement
H = React.DOM

ExprCompiler = require("mwater-expressions").ExprCompiler
ExprUtils = require("mwater-expressions").ExprUtils
AsyncLoadComponent = require 'react-library/lib/AsyncLoadComponent'

# Displays a literal expression as a string. Simple for non-id types. For id types, loads using a query
module.exports = class LiteralExprStringComponent extends AsyncLoadComponent
  @propTypes:
    schema: PropTypes.object.isRequired
    dataSource: PropTypes.object.isRequired # Data source to use to get values
    value: PropTypes.object   # Current expression value
    enumValues: PropTypes.array # Array of { id:, name: } of enum values that can be selected. Only when type = "enum"

  @contextTypes:
    locale: PropTypes.string  # e.g. "en"

  # Override to determine if a load is needed. Not called on mounting
  isLoadNeeded: (newProps, oldProps) -> 
    return not _.isEqual(newProps.value, oldProps.value)

  # Call callback with state changes
  load: (props, prevProps, callback) ->
    # If no value or not id, id[]
    if not props.value or props.value.valueType not in ['id', "id[]"]
      callback(label: null)
      return

    # Create query to get current value
    table = props.schema.getTable(props.value.idTable)

    # Primary key column
    idColumn = { type: "field", tableAlias: "main", column: table.primaryKey }
    if table.label
      labelColumn = { type: "field", tableAlias: "main", column: table.label }
    else # Use primary key. Ugly, but what else to do?
      labelColumn = idColumn

    query = {
      type: "query"
      selects: [
        { type: "select", expr: labelColumn, alias: "label" }
      ]
      from: { type: "table", table: table.id, alias: "main" }
      where: {
        type: "op"
        op: "="
        modifier: "any"
        exprs: [
          idColumn
          { type: "literal", value: (if props.value.valueType == "id[]" then props.value.value else [props.value.value]) }
        ]
      }
    }

    # Execute query
    props.dataSource.performQuery query, (err, rows) =>
      if err or not rows[0]
        callback(label: "(error)")
        return 
      if props.value.valueType == "id"
        callback(label: rows[0].label)
      else
        callback(label: _.pluck(rows, "label").join(", ") or "None")

  render: ->
    exprUtils = new ExprUtils(@props.schema)

    type = @props.value?.valueType
    
    # Handle simple case
    if type not in ['id', 'id[]']
      str = exprUtils.stringifyLiteralValue(type, @props.value?.value, @context.locale, @props.enumValues)

      # Quote text
      if type == "text"
        str = '"' + str + '"'
    else
      if @state.loading
        str = "..."
      else
        str = @state.label

    return H.span null,
      str
        
