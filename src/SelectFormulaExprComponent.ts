import _ from "lodash"
import React from "react"
const R = React.createElement

import { getExprUIExtensions } from "./extensions"
import { AggrStatus, BuildEnumsetExpr, CaseExpr, EnumValue, Expr, ExprUtils, LiteralType, OpExpr, Schema, ScoreExpr } from "mwater-expressions"

interface SelectFormulaExprComponentProps {
  schema: Schema

  /** Current expression value */
  value?: Expr

  /** Called with new expression */
  onChange: (value: Expr) => void

  /** Props to narrow down choices */
  table?: string

  /** Allow case statements */
  allowCase?: boolean
  
  /** If specified, the types (value type) of expression required. e.g. ["boolean"] */
  types?: LiteralType[]
  
  /** statuses of aggregation to allow. list of "individual", "literal", "aggregate". Default: ["individual", "literal"] */
  aggrStatuses: AggrStatus[]

  locale?: string

  /** Array of { id:, name: } of enum values that can be selected. Only when type = "enum" */
  enumValues?: EnumValue[]
}

interface SelectFormulaExprComponentState {
  searchText: any
}

export default class SelectFormulaExprComponent extends React.Component<
  SelectFormulaExprComponentProps,
  SelectFormulaExprComponentState
> {
  searchComp: HTMLInputElement | null
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

  handleIfSelected = () => {
    const ifExpr: CaseExpr = {
      type: "case",
      cases: [{ when: null, then: null }],
      else: null
    }
    if (this.props.table) {
      ifExpr.table = this.props.table
    }

    this.props.onChange(ifExpr)
  }

  handleScoreSelected = () => {
    const scoreExpr: ScoreExpr = {
      type: "score",
      input: null,
      scores: {}
    }
    if (this.props.table) {
      scoreExpr.table = this.props.table
    }

    this.props.onChange(scoreExpr)
  }

  handleBuildEnumsetSelected = () => {
    const expr: BuildEnumsetExpr = {
      type: "build enumset",
      values: {}
    }
    if (this.props.table) {
      expr.table = this.props.table
    }
    this.props.onChange(expr)
  }

  handleOpSelected = (op: any) => {
    const expr: OpExpr = {
      type: "op",
      op,
      exprs: []
    }
    if (this.props.table) {
      expr.table = this.props.table
    }

    this.props.onChange(expr)
  }

  render() {
    let filter: any
    if (this.state.searchText) {
      filter = new RegExp(_.escapeRegExp(this.state.searchText), "i")
    }

    // Create list of formula
    let items = []

    // Add if statement (unless boolean only, in which case if/thens cause problems by returning null)
    if (this.props.allowCase) {
      items.push({
        name: "If/then",
        desc: "Choose different values based on a condition",
        onClick: this.handleIfSelected
      })
    }

    // Add score if has number possible
    if (!this.props.types || this.props.types.includes("number")) {
      items.push({
        name: "Score",
        desc: "Assign scores to different choices of a field and find total.",
        onClick: this.handleScoreSelected
      })
    }

    // Only allow aggregate expressions if relevant
    let aggr = undefined
    if (!this.props.aggrStatuses.includes("aggregate")) {
      aggr = false
    }

    // Add ops that are prefix ones (like "latitude of")
    const exprUtils = new ExprUtils(this.props.schema)
    const opItems = exprUtils.findMatchingOpItems({ resultTypes: this.props.types, prefix: true, aggr })
    for (let opItem of _.uniq(opItems, "op")) {
      items.push({ name: opItem.name, desc: opItem.desc || "", onClick: this.handleOpSelected.bind(null, opItem.op) })
    }

    // Add build enumset if has enumset possible and has values
    if (
      (!this.props.types || this.props.types.includes("enumset")) &&
      this.props.enumValues &&
      this.props.enumValues.length > 0
    ) {
      items.push({
        name: "Build enumset",
        desc: "Advanced: Create a multi-choice answer based on conditions",
        onClick: this.handleBuildEnumsetSelected
      })
    }

    // Add extensions
    for (let exprUIExtension of getExprUIExtensions()) {
      ;((exprUIExtension) => {
        // Filter types
        if (
          exprUIExtension.types &&
          this.props.types &&
          _.intersection(exprUIExtension.types, this.props.types).length === 0
        ) {
          return
        }

        // Filter aggr
        if (
          _.intersection(exprUIExtension.aggrStatuses, this.props.aggrStatuses || ["individual", "literal"]).length ===
          0
        ) {
          return
        }

        if (exprUIExtension.table && exprUIExtension.table !== this.props.table) {
          return
        }

        return items.push({
          name: ExprUtils.localizeString(exprUIExtension.name, this.props.locale),
          desc: ExprUtils.localizeString(exprUIExtension.desc, this.props.locale),
          onClick: () => this.props.onChange(exprUIExtension.createDefaultExpr(this.props.table ?? null))
        })
      })(exprUIExtension)
    }

    if (this.state.searchText) {
      filter = new RegExp(_.escapeRegExp(this.state.searchText), "i")
      items = _.filter(items, (item) => item.name.match(filter) || item.desc.match(filter))
    }

    return R(
      "div",
      null,
      R("input", {
        ref: (c: HTMLInputElement | null) => {
          this.searchComp = c
        },
        type: "text",
        placeholder: "Search Formulas...",
        className: "form-control form-control-lg",
        value: this.state.searchText,
        onChange: this.handleSearchTextChange
      }),

      // Create list
      R(
        "div",
        { style: { paddingTop: 10 } },
        _.map(items, (item) => {
          return R(
            "div",
            {
              key: item.name,
              style: {
                padding: 4,
                borderRadius: 4,
                cursor: "pointer",
                color: "var(--bs-primary)"
              },
              className: "hover-grey-background",
              onClick: item.onClick
            },
            item.name,
            item.desc
              ? R("span", { className: "text-muted", style: { fontSize: 12, paddingLeft: 3 } }, " - " + item.desc)
              : undefined
          )
        })
      )
    )
  }
}
