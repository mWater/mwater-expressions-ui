// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let ExprComponent
import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
const R = React.createElement

import { ExprCleaner } from "mwater-expressions"
import ExprElementBuilder from "./ExprElementBuilder"

// Display/editor component for an expression
// Uses ExprElementBuilder to create the tree of components
// Cleans expression as a convenience
export default ExprComponent = (function () {
  ExprComponent = class ExprComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        schema: PropTypes.object.isRequired,
        dataSource: PropTypes.object.isRequired, // Data source to use to get values

        table: PropTypes.string, // Current table. null for literal only
        value: PropTypes.object, // Current expression value
        onChange: PropTypes.func, // Called with new expression

        variables: PropTypes.array, // Array of variables to allow selecting

        types: PropTypes.array, // If specified, the types (value type) of expression required. e.g. ["boolean"]
        enumValues: PropTypes.array, // Array of { id:, name: } of enum values that can be selected. Only when type = "enum"
        idTable: PropTypes.string, // If specified the table from which id-type expressions must come

        preferLiteral: PropTypes.bool, // True to prefer literal expressions
        aggrStatuses: PropTypes.array, // statuses of aggregation to allow. list of "individual", "literal", "aggregate". Default: ["individual", "literal"] or ["literal"] for no table
        placeholder: PropTypes.string // placeholder for empty value
      }

      this.defaultProps = { aggrStatuses: ["individual", "literal"] }

      this.contextTypes = { locale: PropTypes.string }
      // e.g. "en"
    }

    // Opens the editor popup. Only works if expression is blank
    openEditor = () => {
      return this.exprLink?.showModal()
    }

    // Clean expression and pass up
    handleChange = (expr) => {
      return this.props.onChange(this.cleanExpr(expr))
    }

    // Cleans an expression
    cleanExpr(expr) {
      return new ExprCleaner(this.props.schema, this.props.variables).cleanExpr(expr, {
        table: this.props.table,
        types: this.props.types,
        enumValueIds: this.props.enumValues ? _.pluck(this.props.enumValues, "id") : undefined,
        idTable: this.props.idTable,
        aggrStatuses: !this.props.table ? ["literal"] : this.props.aggrStatuses
      })
    }

    render() {
      const expr = this.cleanExpr(this.props.value)

      return new ExprElementBuilder(
        this.props.schema,
        this.props.dataSource,
        this.context.locale,
        this.props.variables
      ).build(expr, this.props.table, this.props.onChange ? this.handleChange : undefined, {
        types: this.props.types,
        enumValues: this.props.enumValues,
        preferLiteral: this.props.preferLiteral,
        idTable: this.props.idTable,
        includeAggr: this.props.aggrStatuses.includes("aggregate"),
        aggrStatuses: !this.props.table ? ["literal"] : this.props.aggrStatuses,
        placeholder: this.props.placeholder,
        // If no expression, pass a ref to use so that the expression editor can be opened
        exprLinkRef: !expr
          ? (c) => {
              return (this.exprLink = c)
            }
          : undefined
      })
    }
  }
  ExprComponent.initClass()
  return ExprComponent
})()
