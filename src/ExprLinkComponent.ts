// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let ExprLinkComponent
import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
const R = React.createElement

import SelectExprModalComponent from "./SelectExprModalComponent"
import LinkComponent from "./LinkComponent"
import { ExprUtils } from "mwater-expressions"
import LiteralExprStringComponent from "./LiteralExprStringComponent"

// Allows user to select an expression or display an existing one. Shows as a link
export default ExprLinkComponent = (function () {
  ExprLinkComponent = class ExprLinkComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        schema: PropTypes.object.isRequired,
        dataSource: PropTypes.object.isRequired, // Data source to use to get values
        variables: PropTypes.array.isRequired,

        table: PropTypes.string, // Current table
        value: PropTypes.object, // Current expression value
        onChange: PropTypes.func, // Called with new expression

        // Props to narrow down choices
        types: PropTypes.array, // If specified, the types (value type) of expression required. e.g. ["boolean"]
        enumValues: PropTypes.array, // Array of { id:, name: } of enum values that can be selected. Only when type = "enum"
        idTable: PropTypes.string, // If specified the table from which id-type expressions must come
        initialMode: PropTypes.oneOf(["field", "formula", "literal"]), // Initial mode. Default field
        allowCase: PropTypes.bool, // Allow case statements
        aggrStatuses: PropTypes.array, // statuses of aggregation to allow. list of "individual", "literal", "aggregate". Default: ["individual", "literal"]
        refExpr: PropTypes.object, // expression to get values for (used for literals). This is primarily for text fields to allow easy selecting of literal values

        placeholder: PropTypes.string, // Placeholder text (default Select...)

        booleanOnly: PropTypes.bool // Hint that must be boolean (even though boolean can take any type)
      }

      this.contextTypes = { locale: PropTypes.string } // e.g. "en"

      this.defaultProps = {
        placeholder: "Select...",
        initialMode: "field",
        aggrStatuses: ["individual", "literal"]
      }
    }

    constructor(props) {
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
          { onClick: this.handleClick, style: { cursor: "pointer", fontStyle: "italic", color: "#478" } },
          this.props.onChange ? this.props.placeholder : "None"
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
          onDropdownItemClicked: (id) => {
            if (id === "edit") {
              return this.setState({ modalVisible: true })
            } else {
              return this.props.onChange(null)
            }
          }
        },
        exprUtils.summarizeExpr(this.props.value)
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
          onDropdownItemClicked: (id) => {
            if (id === "edit") {
              return this.setState({ modalVisible: true })
            } else {
              return this.props.onChange(null)
            }
          }
        },
        R(LiteralExprStringComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          value: this.props.value,
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
              value: this.props.value,
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
              onSelect: (expr) => {
                this.setState({ modalVisible: false })
                return this.props.onChange(expr)
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
        })()
      )
    }
  }
  ExprLinkComponent.initClass()
  return ExprLinkComponent
})()
