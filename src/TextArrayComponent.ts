// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let TextArrayComponent
import _ from "lodash"
import PropTypes from "prop-types"
import React from "react"
const R = React.createElement
import { default as AsyncReactSelect } from "react-select/async"
import { ExprCompiler } from "mwater-expressions"

// Displays a combo box that allows selecting multiple text values from an expression
export default TextArrayComponent = (function () {
  TextArrayComponent = class TextArrayComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        value: PropTypes.object,
        onChange: PropTypes.func.isRequired,
        refExpr: PropTypes.object.isRequired, // Expression for the text values to select from
        schema: PropTypes.object.isRequired, // Schema of the database
        dataSource: PropTypes.object.isRequired
      }
      // Data source to use to get values
    }

    focus() {
      return this.select.focus()
    }

    handleChange = (value: any) => {
      if (value && value.length > 0) {
        return this.props.onChange({ type: "literal", valueType: "text[]", value: _.pluck(value, "label") })
      } else {
        return this.props.onChange(null)
      }
    }

    escapeRegex(s: any) {
      return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    }

    loadOptions = (input: any, cb: any) => {
      // Create query to get matches ordered by most frequent to least
      const exprCompiler = new ExprCompiler(this.props.schema)

      // select <compiled expr> as value, count(*) as number from <table> where <compiled expr> like 'input%' group by value order by number desc limit 50
      const query = {
        type: "query",
        selects: [
          {
            type: "select",
            expr: exprCompiler.compileExpr({ expr: this.props.refExpr, tableAlias: "main" }),
            alias: "value"
          },
          { type: "select", expr: { type: "op", op: "count", exprs: [] }, alias: "number" }
        ],
        from: exprCompiler.compileTable(this.props.refExpr.table, "main"),
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
      this.props.dataSource.performQuery(query, (err: any, rows: any) => {
        if (err) {
          return
        }

        // Filter null and blank
        rows = _.filter(rows, (r) => r.value)

        return cb(
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
  TextArrayComponent.initClass()
  return TextArrayComponent
})()
