import _ from "lodash"
import React from "react"
const R = React.createElement
import { default as AsyncReactSelect } from "react-select/async"
import { DataSource, Expr, ExprCompiler, ExprUtils, FieldExpr, OpExpr, Schema } from "mwater-expressions"
import { JsonQLSelectQuery } from "jsonql"

export interface RefTextComponentProps {
  value?: Expr
  onChange: (value: Expr) => void

  /** Type of expression (text or text[]) */
  type: "text" | "text[]"

  /** Expression for the text values to select from */
  refExpr: Expr

  /** Schema of the database */
  schema: Schema

  /** Data source to use */
  dataSource: DataSource
}

/** Displays a combo box that allows selecting single text values from an expression */
export default class RefTextComponent extends React.Component<RefTextComponentProps> {
  select: AsyncReactSelect<any, boolean> | null

  focus() {
    this.select!.focus()
  }

  handleChange = (value: any) => {
    if (this.props.type == "text") {
      if (value) {
        this.props.onChange({ type: "literal", valueType: "text", value: value.value })
      } else {
        this.props.onChange(null)
      }
    }
    else {
      if (value && value.length > 0) {
        this.props.onChange({ type: "literal", valueType: "text[]", value: _.pluck(value, "value") })
      } else {
        this.props.onChange(null)
      }
    }
  }

  escapeRegex(s: any) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")
  }

  loadOptions = (input: any, cb: any) => {
    // Create query to get matches ordered by most frequent to least
    const exprCompiler = new ExprCompiler(this.props.schema)
    const exprUtils = new ExprUtils(this.props.schema)

    // Determine type of reference expression
    const refExprType = exprUtils.getExprType(this.props.refExpr)
    const refExprTable = exprUtils.getExprTable(this.props.refExpr)

    let query: JsonQLSelectQuery

    if (refExprTable != null && refExprType == "text") {
      // select <compiled expr> as value, count(*) as number from <table> where <compiled expr> like 'input%' group by value order by number desc limit 50
      query = {
        type: "query",
        selects: [
          {
            type: "select",
            expr: exprCompiler.compileExpr({ expr: this.props.refExpr, tableAlias: "main" }),
            alias: "value"
          },
          { type: "select", expr: { type: "op", op: "count", exprs: [] }, alias: "number" }
        ],
        from: exprCompiler.compileTable(refExprTable, "main"),
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
    }
    else if (refExprTable != null && refExprType == "text[]") {
      // select distinct value from
      // <table> as main cross join jsonb_array_elements_text(<compiled expr>) as value
      // where value like 'abc%'
      // order by 1
      query = {
        type: "query",
        distinct: true,
        selects: [{ type: "select", expr: { type: "field", tableAlias: "values" }, alias: "value" }],
        from: {
          type: "join",
          kind: "cross",
          left: exprCompiler.compileTable(refExprTable, "main"),
          right: {
            type: "subexpr",
            expr: {
              type: "op",
              op: "jsonb_array_elements_text",
              exprs: [{ type: "op", op: "to_jsonb", exprs: [exprCompiler.compileExpr({ expr: this.props.refExpr, tableAlias: "main" })] }]
            },
            alias: "values"
          }
        },
        where: {
          type: "op",
          op: "~*",
          exprs: [
            { type: "field", tableAlias: "values", column: "value" },
            "^" + this.escapeRegex(input) // Don't use _.escapeRegExp as adds weird backslashes that postgres doesn't like
          ]
        },
        orderBy: [{ ordinal: 1, direction: "asc" }],
        limit: 50
      }
    }
    else {
      console.error(`Unsupported refExprType: ${refExprType}`)
      return
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
    let value: any = null

    if (this.props.value) {
      if (this.props.type == "text") {
        if (this.props.value.type == "literal" && this.props.value.valueType == "text" && this.props.value.value) {
          value ={ label: this.props.value.value, value: this.props.value.value } 
        }
      }
      else {
        if (this.props.value.type == "literal" && this.props.value.valueType == "text[]" && this.props.value.value) {
          value = (this.props.value.value as string[]).map(v => ({ label: v, value: v }))
        }
      }
    }

    return R(
      "div",
      { style: { width: "100%" } },
      R(AsyncReactSelect, {
        ref: (c) => {
          return (this.select = c)
        },
        value,
        placeholder: "Select...",
        isMulti: this.props.type == "text[]",
        defaultOptions: true,
        loadOptions: this.loadOptions,
        onChange: this.handleChange
      })
    )
  }
}
