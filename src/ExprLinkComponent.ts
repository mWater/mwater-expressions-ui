import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
const R = React.createElement

import SelectExprModalComponent from "./SelectExprModalComponent"
import LinkComponent from "./LinkComponent"
import { AggrStatus, DataSource, EnumValue, Expr, ExprUtils, LiteralExpr, LiteralType, Schema, Variable } from "mwater-expressions"
import LiteralExprStringComponent from "./LiteralExprStringComponent"

export interface ExprLinkComponentProps {
  schema: Schema
  /** Data source to use to get values */
  dataSource: DataSource

  variables: Variable[]

  /** Current table */
  table?: string 
  /** Current expression value */
  value?: Expr 
  onChange?: (value: Expr) => void

  // Props to narrow down choices
  /** If specified, the types (value type) of expression required. e.g. ["boolean"] */
  types?: LiteralType[]
  /** Array of { id:, name: } of enum values that can be selected. Only when type = "enum" */
  enumValues?: EnumValue[]
  /** If specified the table from which id-type expressions must come */
  idTable?: string
  /** Initial mode. Default field */
  initialMode?: "field" | "formula" | "literal"
  /** Allow case statements */
  allowCase?: boolean 
  /** Statuses of aggregation to allow. list of "individual", "literal", "aggregate". Default: ["individual", "literal"] */
  aggrStatuses?: AggrStatus[]
  /** expression to get values for (used for literals). This is primarily for text fields to allow easy selecting of literal values */
  refExpr?: Expr

  /** Placeholder text (default Select...) */
  placeholder?: string

  /** Hint that must be boolean (even though boolean can take any type) */
  booleanOnly?: boolean
}


// Allows user to select an expression or display an existing one. Shows as a link
export default class ExprLinkComponent extends React.Component<ExprLinkComponentProps, { modalVisible: boolean }> {
  static contextTypes = { locale: PropTypes.string }

  static defaultProps = {
    placeholder: "Select...",
    initialMode: "field",
    aggrStatuses: ["individual", "literal"]
  }

  constructor(props: any) {
    super(props)

    this.state = {
      modalVisible: false
    }
  }

  // Opens the editor modal
  showModal = () => {
    return this.setState({ modalVisible: true })
  }

  handleClick = () => {
    return this.setState({ modalVisible: true })
  }

  // Display placeholder if no value. If readonly, use "None" instead of "Select..."
  renderNone = () => {
    if (this.props.onChange) {
      return R(
        "a",
        { onClick: this.handleClick, style: { 
          cursor: "pointer", 
          fontStyle: "italic", 
          color: "var(--bs-primary)",
          backgroundColor: "var(--bs-gray-200)",
          borderRadius: 5,
          paddingLeft: 5,
          paddingRight: 5,
          paddingTop: 2,
          paddingBottom: 2
        } },
        this.props.placeholder ? this.props.placeholder : "None"
      )
    } else {
      return R("div", { className: "link-component-readonly", style: { fontStyle: "italic" } }, "None")
    }
  }

  // Display summary if field
  renderField = () => {
    const exprUtils = new ExprUtils(this.props.schema)

    return R(
      LinkComponent,
      {
        dropdownItems: this.props.onChange
          ? [
              { id: "edit", name: [R("i", { className: "fa fa-pencil text-muted" }), " Edit"] },
              { id: "remove", name: [R("i", { className: "fa fa-remove text-muted" }), " Remove"] }
            ]
          : undefined,
        onDropdownItemClicked: (id: any) => {
          if (id === "edit") {
            this.setState({ modalVisible: true })
          } else {
            this.props.onChange!(null)
          }
        }
      },
      exprUtils.summarizeExpr(this.props.value ?? null)
    )
  }

  renderLiteral = () => {
    return R(
      LinkComponent,
      {
        dropdownItems: this.props.onChange
          ? [
              { id: "edit", name: [R("i", { className: "fa fa-pencil text-muted" }), " Edit"] },
              { id: "remove", name: [R("i", { className: "fa fa-remove text-muted" }), " Remove"] }
            ]
          : undefined,
        onDropdownItemClicked: (id: any) => {
          if (id === "edit") {
            return this.setState({ modalVisible: true })
          } else {
            return this.props.onChange!(null)
          }
        }
      },
      R(LiteralExprStringComponent, {
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        value: this.props.value as LiteralExpr,
        enumValues: this.props.enumValues
      })
    )
  }

  render() {
    let { initialMode } = this.props

    // Override if already has value
    if (this.props.value) {
      if (["field", "scalar"].includes(this.props.value.type)) {
        initialMode = "field"
      } else if (this.props.value.type === "literal") {
        initialMode = "literal"
      } else {
        initialMode = "formula"
      }
    }

    return R(
      "div",
      null,
      this.state.modalVisible
        ? R(SelectExprModalComponent, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            table: this.props.table,
            value: this.props.value ?? null,
            variables: this.props.variables,
            types: this.props.types,
            enumValues: this.props.enumValues,
            idTable: this.props.idTable,
            initialMode,
            allowCase: this.props.allowCase,
            aggrStatuses: this.props.aggrStatuses,
            refExpr: this.props.refExpr,
            booleanOnly: this.props.booleanOnly,
            onCancel: () => {
              return this.setState({ modalVisible: false })
            },
            onSelect: (expr: any) => {
              this.setState({ modalVisible: false })
              return this.props.onChange!(expr)
            }
          })
        : undefined,

      (() => {
        if (!this.props.value) {
          return this.renderNone()
        } else if (this.props.value.type === "field") {
          return this.renderField()
        } else if (this.props.value.type === "literal") {
          return this.renderLiteral()
        }
        return null
      })()
    )
  }
}
