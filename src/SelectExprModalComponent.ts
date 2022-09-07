import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
const R = React.createElement

import { AggrStatus, DataSource, EnumValue, Expr, ExprUtils, LiteralType, Schema, Variable } from "mwater-expressions"
import ModalWindowComponent from "react-library/lib/ModalWindowComponent"
import TabbedComponent from "react-library/lib/TabbedComponent"
import SelectFieldExprComponent from "./SelectFieldExprComponent"
import SelectFormulaExprComponent from "./SelectFormulaExprComponent"
import SelectLiteralExprComponent from "./SelectLiteralExprComponent"
import SelectVariableExprComponent from "./SelectVariableExprComponent"

export interface SelectExprModalComponentProps {
  /** Called with new expression */
  onSelect: (expr: Expr) => void

  onCancel: () => void

  /** Variables that are available to be selected */
  variables?: Variable[]

  /** Current table. undefined for literal only */
  table?: string

  /** Current expression value */
  value: Expr

  /** If specified, the types (value type) of expression required. e.g. ["boolean"] */
  types?: LiteralType[]

  /** Array of { id:, name: } of enum values that can be selected. Only when type = "enum" */
  enumValues?: EnumValue[]

  /** If specified the table from which id-type expressions must come */
  idTable?: string

  /** Initial mode. Default "field" unless no table, then "literal" */
  initialMode: "field" | "formula" | "literal"

  /** Allow case statements */
  allowCase?: boolean 

  /** statuses of aggregation to allow. list of "individual", "literal", "aggregate". Default: ["individual", "literal"] */
  aggrStatuses?: AggrStatus[]

  /** expression to get values for (used for literals). This is primarily for text fields to allow easy selecting of literal values */
  refExpr?: Expr

  /** Hint that must be boolean (even though boolean can take any type) */
  booleanOnly?: boolean

  /** placeholder for empty value */
  placeholder?: string

  schema: Schema

  /** Data source to use to get values */
  dataSource: DataSource

  /** True to prefer literal expressions */
  preferLiteral?: boolean
}

export default class SelectExprModalComponent extends React.Component<SelectExprModalComponentProps> {
  static contextTypes = { locale: PropTypes.string }

  static defaultProps = {
    placeholder: "Select...",
    initialMode: "field",
    aggrStatuses: ["individual", "literal"]
  }

  renderContents() {
    const table = this.props.table ? this.props.schema.getTable(this.props.table) : undefined

    const tabs = []

    if (table) {
      tabs.push({
        id: "field",
        label: [
          R("i", { className: "fa fa-table" }),
          ` ${ExprUtils.localizeString(table.name, this.context.locale)} Field`
        ],
        elem: R(SelectFieldExprComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          variables: this.props.variables,
          onChange: this.props.onSelect,
          table: this.props.table,
          types: this.props.types,
          allowCase: this.props.allowCase,
          enumValues: this.props.enumValues,
          idTable: this.props.idTable,
          aggrStatuses: this.props.aggrStatuses
        })
      })
    }

    if (table || this.props.aggrStatuses!.includes("literal")) {
      tabs.push({
        id: "formula",
        label: [R("i", { className: "fa fa-calculator" }), " Formula"],
        elem: R(SelectFormulaExprComponent, {
          table: this.props.table,
          onChange: this.props.onSelect,
          types: this.props.types,
          allowCase: this.props.allowCase,
          aggrStatuses: this.props.aggrStatuses,
          enumValues: this.props.enumValues,
          locale: this.context.locale
        })
      })
    }

    if (this.props.aggrStatuses!.includes("literal")) {
      tabs.push({
        id: "literal",
        label: [R("i", { className: "fa fa-pencil" }), " Value"],
        elem: R(SelectLiteralExprComponent, {
          value: this.props.value,
          onChange: this.props.onSelect,
          onCancel: this.props.onCancel,
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          types: this.props.booleanOnly ? ["boolean"] : this.props.types,
          enumValues: this.props.enumValues,
          idTable: this.props.idTable,
          refExpr: this.props.refExpr
        })
      })
    }

    if ((this.props.variables || []).length > 0) {
      tabs.push({
        id: "variables",
        label: ["Variables"],
        elem: R(SelectVariableExprComponent, {
          value: this.props.value,
          variables: this.props.variables,
          onChange: this.props.onSelect,
          types: this.props.types,
          enumValues: this.props.enumValues,
          idTable: this.props.idTable
        })
      })
    }

    return R(
      "div",
      null,
      R("h5", null, "Select Field, Formula or Value"),
      R(TabbedComponent, {
        tabs,
        initialTabId: table ? this.props.initialMode : "literal"
      })
    )
  }

  render() {
    return R(
      ModalWindowComponent,
      {
        isOpen: true,
        onRequestClose: this.props.onCancel
      },
      this.renderContents()
    )
  }
}
