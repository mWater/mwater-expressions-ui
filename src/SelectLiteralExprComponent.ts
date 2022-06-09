import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
const R = React.createElement

import moment from "moment"
import { DataSource, EnumValue, Expr, ExprUtils, Schema } from "mwater-expressions"
import DateTimePickerComponent from "./DateTimePickerComponent"
import IdLiteralComponent from "./IdLiteralComponent"
import { Toggle } from "react-library/lib/bootstrap"
import RefTextComponent from "./RefTextComponent"

interface SelectLiteralExprComponentProps {
  /** Current expression value */
  value?: any
  /** Called with new expression */
  onChange: any
  /** Called to cancel */
  onCancel: any
  schema: Schema
  dataSource: DataSource
  /** Props to narrow down choices */
  types?: any
  /** Array of { id:, name: } of enum values that can be selected. Only when type = "enum" */
  enumValues?: EnumValue[]
  /** If specified the table from which id-type expressions must come */
  idTable?: string
  refExpr?: Expr
}

interface SelectLiteralExprComponentState {
  // Unparsed input text. Null if not used
  inputText: string | null
  value: any
  inputTextError: any
  changed: any
}

export default class SelectLiteralExprComponent extends React.Component<
  SelectLiteralExprComponentProps,
  SelectLiteralExprComponentState
> {
  constructor(props: SelectLiteralExprComponentProps) {
    super(props)

    this.state = {
      value: props.value,
      // Set input text to value if text/number
      inputText: (props.value && ["text", "number"].includes(props.value.valueType)) ? "" + props.value.value : null, 
      changed: false,
      inputTextError: false
    }
  }

  handleChange = (value: any) => {
    return this.setState({ value, changed: true, inputText: null })
  }

  handleDateSelected = (date: any) => {
    if (date) {
      return this.setState({
        value: { type: "literal", valueType: "date", value: date.format("YYYY-MM-DD") },
        changed: true
      })
    } else {
      return this.setState({ value: null, changed: true })
    }
  }

  handleDateTimeSelected = (datetime: any) => {
    if (datetime) {
      return this.setState({
        value: { type: "literal", valueType: "datetime", value: datetime.toISOString() },
        changed: true
      })
    } else {
      return this.setState({ value: null, changed: true })
    }
  }

  handleAccept = () => {
    // Parse text value if text
    let value
    if (this.state.inputText != null) {
      // Empty means no value
      if (this.state.inputText === "") {
        this.props.onChange(null)
        return
      }

      // Prefer number over text if can be parsed as number
      if (
        ((this.props.value && this.props.value.valueType === "number") ||
          (this.props.types || ["number"]).includes("number")) &&
        this.state.inputText.match(/^-?\d+(\.\d+)?$/)
      ) {
        value = parseFloat(this.state.inputText)
        return this.props.onChange({ type: "literal", valueType: "number", value })
        // If text
      } else if (
        (this.props.value && this.props.value.valueType === "text") ||
        (this.props.types || ["text"]).includes("text")
      ) {
        return this.props.onChange({ type: "literal", valueType: "text", value: this.state.inputText })
        // If id (only allow if idTable is explicit)
      } else if ((this.props.types || ["id"]).includes("id") && this.props.idTable) {
        return this.props.onChange({
          type: "literal",
          valueType: "id",
          idTable: this.props.idTable,
          value: this.state.inputText
        })
      } else {
        // Set error condition
        return this.setState({ inputTextError: true })
      }
    } else {
      return this.props.onChange(this.state.value)
    }
  }

  handleTextChange = (ev: any) => {
    return this.setState({ inputText: ev.target.value, changed: true })
  }

  // Render a text box for inputting text/number
  renderTextBox() {
    return R(
      "div",
      { className: this.state.inputTextError ? "has-error" : undefined },
      R("input", {
        type: "text",
        className: "form-control",
        value: this.state.inputText || "",
        onChange: this.handleTextChange,
        placeholder: "Enter value..."
      })
    )
  }

  renderInput() {
    let idTable: any
    const expr = this.state.value

    // Get current expression type
    const exprUtils = new ExprUtils(this.props.schema)
    const exprType = exprUtils.getExprType(expr)

    // If boolean, use Toggle
    if (exprType === "boolean" || _.isEqual(this.props.types, ["boolean"])) {
      return R(Toggle, {
        value: expr?.value,
        allowReset: true,
        options: [
          { value: false, label: "False" },
          { value: true, label: "True" }
        ],
        onChange: (value) => this.handleChange(value != null ? { type: "literal", valueType: "boolean", value } : null)
      })
    }

    // Simplify reference expression if it is a scalar, as they are more limited
    // in options and more difficult to compute.
    let refExpr = this.props.refExpr
    if (refExpr && refExpr.type == "scalar") {
      refExpr = refExpr.expr
    }

    // If text and has a reference expression
    if ((exprType === "text" || _.isEqual(this.props.types, ["text"])) && refExpr) {
      return R(RefTextComponent, {
        value: expr,
        refExpr: refExpr,
        type: "text",
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        onChange: this.handleChange
      })
    }
    
    // If text[] and has refExpr, use special component
    if ((exprType === "text[]" || _.isEqual(this.props.types, ["text[]"])) && refExpr) {
      return R(RefTextComponent, {
        value: expr,
        refExpr: refExpr,
        type: "text[]",
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        onChange: this.handleChange
      })
    }

    if ((exprType === "enum" || _.isEqual(this.props.types, ["enum"])) && this.props.enumValues) {
      return R(EnumAsListComponent, {
        value: expr,
        enumValues: this.props.enumValues,
        onChange: this.handleChange
      })
    }

    if ((exprType === "enumset" || _.isEqual(this.props.types, ["enumset"])) && this.props.enumValues) {
      return R(EnumsetAsListComponent, {
        value: expr,
        enumValues: this.props.enumValues,
        onChange: this.handleChange
      })
    }

    if (exprType === "id" || (_.isEqual(this.props.types, ["id"]) && this.props.idTable)) {
      idTable = this.props.idTable || exprUtils.getExprIdTable(expr)
      return R(IdLiteralComponent, {
        value: expr?.value,
        idTable,
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        onChange: (value) => this.handleChange(value ? { type: "literal", valueType: "id", idTable, value } : null)
      })
    }

    if (exprType === "id[]" || (_.isEqual(this.props.types, ["id[]"]) && this.props.idTable)) {
      idTable = this.props.idTable || exprUtils.getExprIdTable(expr)
      return R(IdLiteralComponent, {
        value: expr?.value,
        idTable,
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        multi: true,
        onChange: (value: string[] | number[] | null) =>
          this.handleChange(value && value.length > 0 ? { type: "literal", valueType: "id[]", idTable, value } : null)
      })
    }

    // If already text/number, or text/number accepted, render field
    if (exprType &&
      ["text", "number"].includes(exprType) ||
      !this.props.types ||
      this.props.types.includes("text") ||
      this.props.types.includes("number")
    ) {
      return this.renderTextBox()
    }

    // If date type, display control
    if ((this.props.value && this.props.value.valueType === "date") || (this.props.types || []).includes("date")) {
      return R(DateTimePickerComponent, {
        date: this.state.value ? moment(this.state.value.value, moment.ISO_8601) : undefined,
        onChange: this.handleDateSelected
      })
    }

    // If datetime type, display control
    if (
      (this.props.value && this.props.value.valueType === "datetime") ||
      (this.props.types || []).includes("datetime")
    ) {
      return R(DateTimePickerComponent, {
        date: this.state.value ? moment(this.state.value.value, moment.ISO_8601) : undefined,
        timepicker: true,
        onChange: this.handleDateTimeSelected
      })
    }

    return R("div", { className: "text-warning" }, "Literal input not supported for this type")
  }

  render() {
    return R(
      "div",
      null,
      R(
        "div",
        { style: { paddingBottom: 10 } },
        R(
          "button",
          { type: "button", className: "btn btn-primary", onClick: this.handleAccept, disabled: !this.state.changed },
          R("i", { className: "fa fa-check" }),
          " OK"
        ),
        " ",
        R("button", { type: "button", className: "btn btn-secondary", onClick: this.props.onCancel }, "Cancel")
      ),
      this.renderInput()
    )
  }
}

interface EnumAsListComponentProps {
  value?: any
  onChange: any
  /** Array of id and name (localized string) */
  enumValues: EnumValue[]
}

// Component which displays an enum as a list
class EnumAsListComponent extends React.Component<EnumAsListComponentProps> {
  static contextTypes = { locale: PropTypes.string }

  handleChange = (val: any) => {
    if (!val) {
      return this.props.onChange(null)
    } else {
      return this.props.onChange({ type: "literal", valueType: "enum", value: val })
    }
  }

  render() {
    const value = this.props.value?.value

    const itemStyle = {
      padding: 4,
      marginLeft: 5,
      borderRadius: 4,
      cursor: "pointer"
    }

    return R(
      "div",
      null,
      _.map(this.props.enumValues, (val) => {
        return R(
          "div",
          {
            key: val.id,
            className: "hover-grey-background",
            style: itemStyle,
            onClick: this.handleChange.bind(null, val.id)
          },
          val.id === value
            ? R("i", { className: "fa fa-fw fa-check", style: { color: "#2E6DA4" } })
            : R("i", { className: "fa fa-fw" }),
          " ",
          ExprUtils.localizeString(val.name, this.context.locale)
        )
      })
    )
  }
}

interface EnumsetAsListComponentProps {
  value?: any
  onChange: any
  /** Array of id and name (localized string) */
  enumValues: EnumValue[]
}

// Component which displays an enumset as a list
class EnumsetAsListComponent extends React.Component<EnumsetAsListComponentProps> {
  static contextTypes = { locale: PropTypes.string }

  handleToggle = (val: any) => {
    let items = this.props.value?.value || []
    if (items.includes(val)) {
      items = _.without(items, val)
    } else {
      items = items.concat([val])
    }

    if (items.length === 0) {
      return this.props.onChange(null)
    } else {
      return this.props.onChange({ type: "literal", valueType: "enumset", value: items })
    }
  }

  render() {
    const items = this.props.value?.value || []

    const itemStyle = {
      padding: 4,
      marginLeft: 5,
      borderRadius: 4,
      cursor: "pointer"
    }

    return R(
      "div",
      null,
      _.map(this.props.enumValues, (val) => {
        return R(
          "div",
          {
            key: val.id,
            className: "hover-grey-background",
            style: itemStyle,
            onClick: this.handleToggle.bind(null, val.id)
          },
          items.includes(val.id)
            ? R("i", { className: "fa fa-fw fa-check-square", style: { color: "#2E6DA4" } })
            : R("i", { className: "fa fa-fw fa-square", style: { color: "#DDDDDD" } }),
          " ",
          ExprUtils.localizeString(val.name, this.context.locale)
        )
      })
    )
  }
}
