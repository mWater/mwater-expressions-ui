import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
const R = React.createElement

import { Schema, DataSource, Variable, Expr } from "mwater-expressions"
import update from "update-object"
import { ExprCleaner } from "mwater-expressions"
import ExprElementBuilder from "./ExprElementBuilder"
import StackedComponent from "./StackedComponent"
import RemovableComponent from "./RemovableComponent"
import ExprLinkComponent from "./ExprLinkComponent"

interface FilterExprComponentProps {
  schema: Schema
  dataSource: DataSource
  variables?: Variable[]
  /** Current table */
  table: string
  /** Current value */
  value?: Expr

  /** Called with new expression */
  onChange?: (expr: Expr) => void

  /** Label for adding item. Default "+ Add Label" */
  addLabel?: React.ReactNode
}

interface FilterExprComponentState {
  displayNull: any
}

/** Displays a boolean filter expression. Just shows "+ Add filter" (or other add label) when empty */
export default class FilterExprComponent extends React.Component<FilterExprComponentProps, FilterExprComponentState> {
  static contextTypes = { locale: PropTypes.string }

  static defaultProps = {
    addLabel: "+ Add Filter",
    variables: []
  }

  newExpr: ExprLinkComponent | null | undefined

  constructor(props: FilterExprComponentProps) {
    super(props)

    this.state = { displayNull: false } // Set true when initial null value should be displayed
  }

  // Handle add filter clicked by wrapping in "and" if existing, otherwise adding a null
  handleAddFilter = () => {
    // If already "and", add null
    if (this.props.value && this.props.value.type == "op" && this.props.value.op === "and") {
      this.props.onChange!(update(this.props.value, { exprs: { $push: [null] } }))
      return
    }

    // If already has value, wrap in and
    if (this.props.value) {
      this.props.onChange!({ type: "op", op: "and", table: this.props.table, exprs: [this.props.value, null] })
      return
    }

    return this.setState({ displayNull: true }, () => this.newExpr?.showModal())
  }

  // Clean expression and pass up
  handleChange = (expr: any) => {
    return this.props.onChange!(this.cleanExpr(expr))
  }

  // Cleans an expression
  cleanExpr(expr: any) {
    return new ExprCleaner(this.props.schema, this.props.variables).cleanExpr(expr, {
      table: this.props.table,
      types: ["boolean"]
    })
  }

  // Handle change to a single item
  handleAndChange = (i: any, expr: any) => {
    return this.handleChange(update(this.props.value, { exprs: { $splice: [[i, 1, expr]] } }))
  }

  handleAndRemove = (i: any) => {
    return this.handleChange(update(this.props.value, { exprs: { $splice: [[i, 1]] } }))
  }

  handleRemove = () => {
    this.setState({ displayNull: false })
    return this.handleChange(null)
  }

  renderAddFilter() {
    return R("div", null, R("a", { onClick: this.handleAddFilter }, this.props.addLabel))
  }

  render() {
    const expr = this.cleanExpr(this.props.value)

    // Render each item of and
    if (expr && expr.type == "op" && expr.op === "and") {
      return R(
        "div",
        null,
        R(StackedComponent, {
          joinLabel: "and",
          items: _.map(expr.exprs, (subexpr, i) => {
            return {
              elem: new ExprElementBuilder(
                this.props.schema,
                this.props.dataSource,
                this.context.locale,
                this.props.variables
              ).build(subexpr, this.props.table, this.props.onChange ? this.handleAndChange.bind(null, i) : undefined, {
                types: ["boolean"],
                preferLiteral: false,
                suppressWrapOps: ["and"] // Don't allow wrapping in and since this is an and control
              }),
              onRemove: this.props.onChange ? this.handleAndRemove.bind(null, i) : undefined
            }
          })
        }),

        // Only display add if last item is not null
        _.last(expr.exprs) !== null && this.props.onChange ? this.renderAddFilter() : undefined
      )
    } else if (expr) {
      return R(
        "div",
        null,
        R(
          RemovableComponent,
          { onRemove: this.props.onChange ? this.handleRemove : undefined },
          new ExprElementBuilder(
            this.props.schema,
            this.props.dataSource,
            this.context.locale,
            this.props.variables
          ).build(expr, this.props.table, this.props.onChange ? this.handleChange : undefined, {
            types: ["boolean"],
            preferLiteral: false,
            suppressWrapOps: ["and"] // Don't allow wrapping in and since this is an and control
          })
        ),

        // Only display add if has a value
        this.renderAddFilter()
      )
    } else if (this.state.displayNull) {
      return R(ExprLinkComponent, {
        ref: (c: any) => {
          return (this.newExpr = c)
        },
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        variables: this.props.variables,
        table: this.props.table,
        onChange: this.props.onChange ? this.handleChange : undefined
      })
    } else {
      return this.renderAddFilter()
    }
  }
}
