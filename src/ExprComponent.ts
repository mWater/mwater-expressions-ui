import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
const R = React.createElement

import { ExprCleaner } from "mwater-expressions"
import ExprElementBuilder from "./ExprElementBuilder"

interface ExprComponentProps {
  schema: any
  /** Data source to use to get values */
  dataSource: any
  /** Current table. null for literal only */
  table?: string
  /** Current expression value */
  value?: any
  /** Called with new expression */
  onChange?: any
  /** Array of variables to allow selecting */
  variables?: any
  /** If specified, the types (value type) of expression required. e.g. ["boolean"] */
  types?: any
  /** Array of { id:, name: } of enum values that can be selected. Only when type = "enum" */
  enumValues?: any
  /** If specified the table from which id-type expressions must come */
  idTable?: string
  /** True to prefer literal expressions */
  preferLiteral?: boolean
  /** statuses of aggregation to allow. list of "individual", "literal", "aggregate". Default: ["individual", "literal"] or ["literal"] for no table */
  aggrStatuses?: any
  /** placeholder for empty value */
  placeholder?: string
}

// Display/editor component for an expression
// Uses ExprElementBuilder to create the tree of components
// Cleans expression as a convenience
export default class ExprComponent extends React.Component<ExprComponentProps> {
  static defaultProps = { aggrStatuses: ["individual", "literal"] }
  static contextTypes = { locale: PropTypes.string }

  // Opens the editor popup. Only works if expression is blank
  openEditor = () => {
    return this.exprLink?.showModal()
  }

  // Clean expression and pass up
  handleChange = (expr: any) => {
    return this.props.onChange(this.cleanExpr(expr))
  }

  // Cleans an expression
  cleanExpr(expr: any) {
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
        ? (c: any) => {
            return (this.exprLink = c)
          }
        : undefined
    })
  }
}
