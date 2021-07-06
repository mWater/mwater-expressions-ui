import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
const R = React.createElement

import { ExprUtils } from "mwater-expressions"
import RemovableComponent from "./RemovableComponent"

interface BuildEnumsetExprComponentProps {
  schema: any
  /** Data source to use to get values */
  dataSource: any
  /** Current expression value */
  value?: any
  /** enum values. Can't display without them */
  enumValues?: any
  /** Called with new expression */
  onChange?: any
}

// Build enumset
export default class BuildEnumsetExprComponent extends React.Component<BuildEnumsetExprComponentProps> {
  static contextTypes = { locale: PropTypes.string }

  handleValueChange = (id: any, value: any) => {
    const values = _.clone(this.props.value.values)
    values[id] = value
    return this.props.onChange(_.extend({}, this.props.value, { values }))
  }

  renderValues() {
    // To avoid circularity
    const ExprComponent = require("./ExprComponent")

    const exprUtils = new ExprUtils(this.props.schema)

    return R(
      "table",
      { className: "table table-bordered" },
      R(
        "thead",
        null,
        R(
          "tr",
          null,
          R("th", { key: "name" }, "Choice"),
          // R 'th', key: "arrow"
          R("th", { key: "include" }, "Include if")
        )
      ),
      R(
        "tbody",
        null,
        _.map(this.props.enumValues, (enumValue) => {
          return R(
            "tr",
            { key: enumValue.id },
            // Name of value
            R("td", { key: "name" }, exprUtils.localizeString(enumValue.name, this.context.locale)),
            // R 'td', key: "arrow",
            //   R 'span', className: "glyphicon glyphicon-arrow-right"
            // Boolean condition
            R(
              "td",
              { key: "value", style: { maxWidth: "30em" } },
              R(ExprComponent, {
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                table: this.props.value.table,
                value: this.props.value.values[enumValue.id],
                onChange: this.handleValueChange.bind(null, enumValue.id),
                types: ["boolean"]
              })
            )
          )
        })
      )
    )
  }

  render() {
    return R(
      RemovableComponent,
      { onRemove: this.props.onChange.bind(null, null) },
      this.props.enumValues ? this.renderValues() : R("i", null, "Cannot display build enumset without known values")
    )
  }
}
