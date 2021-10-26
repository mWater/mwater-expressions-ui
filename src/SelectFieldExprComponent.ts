import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
const R = React.createElement

import ScalarExprTreeComponent from "./ScalarExprTreeComponent"
import ScalarExprTreeBuilder from "./ScalarExprTreeBuilder"
import { ExprUtils } from "mwater-expressions"

interface SelectFieldExprComponentProps {
  /** Current expression value */
  value?: any
  /** Called with new expression */
  onChange: any
  schema: any
  /** Data source to use to get values */
  dataSource: any
  variables: any
  /** Props to narrow down choices */
  table: string
  /** If specified, the types (value type) of expression required. e.g. ["boolean"] */
  types?: any
  /** Array of { id:, name: } of enum values that can be selected. Only when type = "enum" */
  enumValues?: any
  /** If specified the table from which id-type expressions must come */
  idTable?: string
  /** statuses of aggregation to allow. list of "individual", "literal", "aggregate". Default: ["individual", "literal"] */
  aggrStatuses?: any
}

interface SelectFieldExprComponentState {
  searchText: any
}

export default class SelectFieldExprComponent extends React.Component<
  SelectFieldExprComponentProps,
  SelectFieldExprComponentState
> {
  static contextTypes = {
    locale: PropTypes.string, // e.g. "en"

    // Function to override initial open state of a section. Passed { tableId: id of table, section: section object from schema, filter: optional string filter }
    // Should return true to set initially open
    isScalarExprTreeSectionInitiallyOpen: PropTypes.func,

    // Function to override filtering of a section. Passed { tableId: id of table, section: section object from schema, filter: optional string filter }
    // Should return null for default, true to include, false to exclude
    isScalarExprTreeSectionMatch: PropTypes.func
  }

  constructor(props: any) {
    super(props)

    this.state = {
      searchText: ""
    }
  }

  componentDidMount() {
    return this.searchComp?.focus()
  }

  handleSearchTextChange = (ev: any) => {
    return this.setState({ searchText: ev.target.value })
  }

  // Handle a selection in the scalar expression tree. Called with { table, joins, expr }
  handleTreeChange = (val: any) => {
    // Loses focus when selection made
    this.setState({ focused: false })

    let { expr } = val
    const exprUtils = new ExprUtils(this.props.schema)

    // If expr is enum and enumValues specified, perform a mapping
    if (exprUtils.getExprType(val.expr) === "enum" && this.props.enumValues) {
      expr = {
        type: "case",
        table: expr.table,
        cases: _.map(this.props.enumValues, (ev) => {
          // Find matching name (english)
          let literal
          const fromEnumValues = exprUtils.getExprEnumValues(expr)
          const matchingEnumValue = _.find(fromEnumValues, (fev) => fev.name.en === ev.name.en)

          if (matchingEnumValue) {
            literal = { type: "literal", valueType: "enumset", value: [matchingEnumValue.id] }
          } else {
            literal = null
          }

          return {
            when: { type: "op", table: expr.table, op: "= any", exprs: [expr, literal] },
            then: { type: "literal", valueType: "enum", value: ev.id }
          }
        }),
        else: null
      }
    }

    // If expr is enumset and enumValues specified, perform a mapping building an enumset
    if (exprUtils.getExprType(val.expr) === "enumset" && this.props.enumValues) {
      const buildExpr = {
        type: "build enumset",
        table: expr.table,
        values: {}
      }

      for (var ev of this.props.enumValues) {
        // Find matching name (english)
        var literal
        const fromEnumValues = exprUtils.getExprEnumValues(expr)
        const matchingEnumValue = _.find(fromEnumValues, (fev) => fev.name.en === ev.name.en)

        if (matchingEnumValue) {
          literal = { type: "literal", valueType: "enumset", value: [matchingEnumValue.id] }
        } else {
          literal = null
        }

        buildExpr.values[ev.id] = { type: "op", table: expr.table, op: "contains", exprs: [expr, literal] }
      }

      expr = buildExpr
    }

    // Make into expression
    if (val.joins.length === 0) {
      // Simple field expression
      return this.props.onChange(expr)
    } else {
      return this.props.onChange({ type: "scalar", table: this.props.table, joins: val.joins, expr })
    }
  }

  render() {
    // Create tree
    const treeBuilder = new ScalarExprTreeBuilder(this.props.schema, {
      locale: this.context.locale,
      isScalarExprTreeSectionMatch: this.context.isScalarExprTreeSectionMatch,
      isScalarExprTreeSectionInitiallyOpen: this.context.isScalarExprTreeSectionInitiallyOpen,
      variables: this.props.variables
    })

    const tree = treeBuilder.getTree({
      table: this.props.table,
      types: this.props.types,
      idTable: this.props.idTable,
      includeAggr: this.props.aggrStatuses.includes("aggregate"),
      filter: this.state.searchText
    })

    return R(
      "div",
      null,
      R("input", {
        ref: (c: any) => {
          return (this.searchComp = c)
        },
        type: "text",
        placeholder: "Search Fields...",
        className: "form-control form-control-lg",
        value: this.state.searchText,
        onChange: this.handleSearchTextChange
      }),

      // Create tree component with value of table and path
      R(
        "div",
        { style: { paddingTop: 10, paddingBottom: 200 } },
        R(ScalarExprTreeComponent, {
          tree,
          onChange: this.handleTreeChange,
          filter: this.state.searchText
        })
      )
    )
  }
}
