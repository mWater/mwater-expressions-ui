PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
R = React.createElement

ExprUtils = require('mwater-expressions').ExprUtils

module.exports = class SelectVariableExprComponent extends React.Component
  @propTypes:
    value: PropTypes.object   # Current expression value
    onChange: PropTypes.func.isRequired # Called with new expression
    variables: PropTypes.array.isRequired

    # Props to narrow down choices
    types: PropTypes.array    # If specified, the types (value type) of expression required. e.g. ["boolean"]
    enumValues: PropTypes.array # Array of { id:, name: } of enum values that can be selected. Only when type = "enum"
    idTable: PropTypes.string # If specified the table from which id-type expressions must come

  @contextTypes:
    locale: PropTypes.string  # e.g. "en"

  render: ->
    variables = _.filter(@props.variables, (variable) =>
      # Filter types
      if @props.types and variable.type not in @props.types
        return false

      # Filter by idTable
      if @props.idTable and variable.idTable and variable.idTable != @props.idTable
        return false
      
      # Filter by enumValues
      if @props.enumValues and variable.enumValues
        if _.difference(_.pluck(variable.enumValues, "id"), _.pluck(@props.enumValues, "id")).length > 0
          return false

      return true
    )

    items = _.map(variables, (variable) => 
      return { 
        id: variable.id
        name: ExprUtils.localizeString(variable.name, @context.locale) or "(unnamed)"
        desc: ExprUtils.localizeString(variable.desc, @context.locale)
        onClick: => @props.onChange({ type: "variable", variableId: variable.id })
      }
    )

    # Create list
    return R 'div', style: { paddingTop: 10 },
      _.map items, (item) =>
        R 'div', 
          key: item.id
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
