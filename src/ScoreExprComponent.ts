import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
const R = React.createElement

import { ExprUtils } from "mwater-expressions"
import RemovableComponent from "./RemovableComponent"

interface ScoreExprComponentProps {
  schema: any
  /** Data source to use to get values */
  dataSource: any
  /** Current expression value */
  value?: any
  /** Called with new expression */
  onChange?: any
}

// Score
export default class ScoreExprComponent extends React.Component<ScoreExprComponentProps> {
  static contextTypes = { locale: PropTypes.string }

  handleInputChange = (expr: any) => {
    return this.props.onChange(_.extend({}, this.props.value, { input: expr }))
  }

  handleScoreChange = (id: any, value: any) => {
    const scores = _.clone(this.props.value.scores)
    scores[id] = value
    return this.props.onChange(_.extend({}, this.props.value, { scores }))
  }

  renderScores() {
    // To avoid circularity
    const ExprComponent = require("./ExprComponent")

    const exprUtils = new ExprUtils(this.props.schema)
    // Get enum values
    const enumValues = exprUtils.getExprEnumValues(this.props.value.input)
    if (!enumValues) {
      return null
    }

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
          R("th", { key: "score" }, "Score")
        )
      ),
      R(
        "tbody",
        null,
        _.map(enumValues, (enumValue) => {
          return R(
            "tr",
            { key: enumValue.id },
            // Name of value
            R("td", { key: "name" }, exprUtils.localizeString(enumValue.name, this.context.locale)),
            // R 'td', key: "arrow",
            //   R 'span', className: "glyphicon glyphicon-arrow-right"
            // Score
            R(
              "td",
              { key: "score", style: { maxWidth: "20em" } },
              R(ExprComponent, {
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                table: this.props.value.table,
                value: this.props.value.scores[enumValue.id],
                onChange: this.props.onChange ? this.handleScoreChange.bind(null, enumValue.id) : undefined,
                types: ["number"],
                preferLiteral: true
              })
            )
          )
        })
      )
    )
  }

  render() {
    // To avoid circularity
    const ExprComponent = require("./ExprComponent")

    return R(
      RemovableComponent,
      { onRemove: this.props.onChange ? this.props.onChange.bind(null, null) : undefined },
      R(
        "div",
        null,
        "Score choices of: ",
        R(
          "div",
          { style: { display: "inline-block", maxWidth: "50em" } },
          R(ExprComponent, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            table: this.props.value.table,
            value: this.props.value.input,
            onChange: this.props.onChange ? this.handleInputChange : undefined,
            types: ["enum", "enumset"]
          })
        )
      ),
      this.renderScores()
    )
  }
}
