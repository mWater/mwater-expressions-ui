import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
const R = React.createElement

import { ExprUtils } from "mwater-expressions"

interface SelectVariableExprComponentProps {
  /** Current expression value */
  value?: any
  /** Called with new expression */
  onChange: any
  variables: any
  /** Props to narrow down choices */
  types?: any
  /** Array of { id:, name: } of enum values that can be selected. Only when type = "enum" */
  enumValues?: any
  /** If specified the table from which id-type expressions must come */
  idTable?: string
}

export default class SelectVariableExprComponent extends React.Component<SelectVariableExprComponentProps> {
  static contextTypes = { locale: PropTypes.string }

  render() {
    const variables = _.filter(this.props.variables, (variable) => {
      // Filter types
      if (this.props.types && !this.props.types.includes(variable.type)) {
        return false
      }

      // Filter by idTable
      if (this.props.idTable && variable.idTable && variable.idTable !== this.props.idTable) {
        return false
      }

      // Filter by enumValues
      if (this.props.enumValues && variable.enumValues) {
        if (_.difference(_.pluck(variable.enumValues, "id"), _.pluck(this.props.enumValues, "id")).length > 0) {
          return false
        }
      }

      return true
    })

    const items = _.map(variables, (variable) => {
      return {
        id: variable.id,
        name: ExprUtils.localizeString(variable.name, this.context.locale) || "(unnamed)",
        desc: ExprUtils.localizeString(variable.desc, this.context.locale),
        onClick: () => this.props.onChange({ type: "variable", variableId: variable.id })
      }
    })

    // Create list
    return R(
      "div",
      { style: { paddingTop: 10 } },
      _.map(items, (item) => {
        return R(
          "div",
          {
            key: item.id,
            style: {
              padding: 4,
              borderRadius: 4,
              cursor: "pointer",
              color: "var(--bs-primary)"
            },
            className: "hover-grey-background",
            onClick: item.onClick
          },
          item.name,
          item.desc
            ? R("span", { className: "text-muted", style: { fontSize: 12, paddingLeft: 3 } }, " - " + item.desc)
            : undefined
        )
      })
    )
  }
}
