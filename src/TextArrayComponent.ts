import _ from "lodash"
import React from "react"
const R = React.createElement
import { default as AsyncReactSelect } from "react-select/async"
import { DataSource, Expr, ExprCompiler, FieldExpr, OpExpr, Schema } from "mwater-expressions"
import { JsonQLSelectQuery } from "jsonql"

interface TextArrayComponentProps {
  value?: any
  onChange: any

  /** Expression for the text values to select from */
  refExpr: Expr

  /** Schema of the database */
  schema: Schema

  /** Data source to use */
  dataSource: DataSource
}

/** Displays a combo box that allows selecting multiple text values from an expression */
export default class TextArrayComponent extends React.Component<TextArrayComponentProps> {
  select: AsyncReactSelect<any, boolean> | null

  focus() {
    this.select!.focus()
  }

  handleChange = (value: any) => {
    if (value && value.length > 0) {
      this.props.onChange({ type: "literal", valueType: "text[]", value: _.pluck(value, "label") })
    } else {
      this.props.onChange(null)
    }
  }

  escapeRegex(s: any) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")
  }

  loadOptions = (input: any, cb: any) => {
    // Create query to get matches ordered by most frequent to least
    const exprCompiler = new ExprCompiler(this.props.schema)

    // select <compiled expr> as value, count(*) as number from <table> where <compiled expr> like 'input%' group by value order by number desc limit 50
    const query: JsonQLSelectQuery = {
      type: "query",
      selects: [
        {
          type: "select",
          expr: exprCompiler.compileExpr({ expr: this.props.refExpr, tableAlias: "main" }),
          alias: "value"
        },
        { type: "select", expr: { type: "op", op: "count", exprs: [] }, alias: "number" }
      ],
      from: exprCompiler.compileTable((this.props.refExpr as FieldExpr).table, "main"),
      where: {
        type: "op",
        op: "~*",
        exprs: [
          exprCompiler.compileExpr({ expr: this.props.refExpr, tableAlias: "main" }),
          "^" + this.escapeRegex(input)
        ]
      },
      groupBy: [1],
      orderBy: [
        { ordinal: 2, direction: "desc" },
        { ordinal: 1, direction: "asc" }
      ],
      limit: 50
    }

    // Execute query
    this.props.dataSource.performQuery(query, (err, rows) => {
      if (err) {
        return
      }

      // Filter null and blank
      rows = _.filter(rows, (r) => r.value)

      cb(
        _.map(rows, (r) => ({
          value: r.value,
          label: r.value
        }))
      )
    })
  }

  render() {
    const value = _.map(this.props.value?.value, (v) => ({ label: v, value: v }))

    return R(
      "div",
      { style: { width: "100%" } },
      R(AsyncReactSelect, {
        ref: (c) => {
          return (this.select = c)
        },
        value,
        isMulti: true,
        placeholder: "Select...",
        defaultOptions: true,
        loadOptions: this.loadOptions,
        onChange: this.handleChange
      })
    )
  }
}
