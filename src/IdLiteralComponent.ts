import _ from "lodash"
import React from "react"
import { default as AsyncReactSelect } from "react-select/async"
import { DataSource, ExprCompiler, Schema } from "mwater-expressions"
import AsyncLoadComponent from "react-library/lib/AsyncLoadComponent"
import { JsonQLExpr, JsonQLQuery } from "jsonql"
const R = React.createElement

export interface IdLiteralComponentProps {
  /** Value of primary key or array of primary keys */
  value: string | string[] | number | number[] | null | undefined

  /** Called with primary key or array of primary keys */
  onChange: (value: string | string[] | number | number[] | null) => void

  idTable: string

  /** Schema of the database */
  schema: Schema

  /** Data source to use to get values */
  dataSource: DataSource

  /** Placeholder to display */
  placeholder?: string

  /** Optional extra orderings. Put "main" as tableAlias. JsonQL */
  orderBy?: any // TODO

  /** Allow multiple values (id[] type) */
  multi?: boolean

  /** Optional extra filter. Put "main" as tableAlias. JsonQL   */
  filter?: JsonQLExpr

  /** Optional label expression to use. Will fallback to label column or primary key. Put "main" as tableAlias. JsonQL */
  labelExpr?: JsonQLExpr

  /** Allow searching anywhere in label, not just start */
  searchWithin?: boolean
}

// Displays a combo box that allows selecting one or multiple text values from an expression
// Needs two indexes to work fast:
// create index on some_table (label_column);
// create index on some_table (lower(label_column) text_pattern_ops);
export default class IdLiteralComponent extends AsyncLoadComponent<
  IdLiteralComponentProps,
  { currentValue: any; loading: boolean }
> {
  select?: any

  focus() {
    return this.select.focus()
  }

  // Override to determine if a load is needed. Not called on mounting
  isLoadNeeded(newProps: any, oldProps: any) {
    return newProps.value !== oldProps.value || newProps.idTable !== oldProps.idTable
  }

  // Call callback with state changes
  load(props: any, prevProps: any, callback: any) {
    // Create query to get current value
    if (props.value == null) {
      callback({ currentValue: null })
      return
    }

    const table = props.schema.getTable(props.idTable)

    // Primary key column
    const idColumn = { type: "field", tableAlias: "main", column: table.primaryKey }
    const labelExpr = this.getLabelExpr()

    const query = {
      type: "query",
      selects: [
        { type: "select", expr: idColumn, alias: "value" },
        { type: "select", expr: labelExpr, alias: "label" }
      ],
      from: { type: "table", table: this.props.idTable, alias: "main" },
      where: {
        type: "op",
        op: "=",
        modifier: "any",
        exprs: [idColumn, { type: "literal", value: props.multi ? props.value : [props.value] }]
      }
    }

    // Execute query
    return props.dataSource.performQuery(query, (err: any, rows: any) => {
      if (err || !rows[0]) {
        callback({ currentValue: null })
        return
      }
      if (!this.props.multi) {
        return callback({ currentValue: rows[0] })
      } else {
        return callback({ currentValue: rows })
      }
    })
  }

  handleChange = (value: any) => {
    if (this.props.multi) {
      if (value && value.length === 0) {
        return this.props.onChange(null)
      } else {
        return this.props.onChange(_.pluck(value, "value"))
      }
    } else {
      return this.props.onChange(value?.value)
    }
  }

  getLabelExpr(): JsonQLExpr {
    if (this.props.labelExpr) {
      return this.props.labelExpr
    }

    const table = this.props.schema.getTable(this.props.idTable)!
    if (table.label) {
      return { type: "field", tableAlias: "main", column: table.label } as JsonQLExpr
    }

    // Use primary key. Ugly, but what else to do?. Cast to text.
    return { type: "op", op: "::text", exprs: [{ type: "field", tableAlias: "main", column: table.primaryKey }] }
  }

  loadOptions = (input: any, cb: any) => {
    let where: JsonQLExpr
    const table = this.props.schema.getTable(this.props.idTable)!

    // Primary key column
    const idColumn: JsonQLExpr = { type: "field", tableAlias: "main", column: table.primaryKey }
    const labelExpr: JsonQLExpr = this.getLabelExpr()

    if (input) {
      where = {
        type: "op",
        op: "like",
        exprs: [
          { type: "op", op: "lower", exprs: [labelExpr] },
          this.props.searchWithin ? "%" + input.toLowerCase() + "%" : input.toLowerCase() + "%"
        ]
      }
    } else {
      where = null
    }

    // select <label column> as value from <table> where lower(<label column>) like 'input%' limit 50
    const query: JsonQLQuery = {
      type: "query",
      selects: [
        { type: "select", expr: idColumn, alias: "value" },
        { type: "select", expr: labelExpr, alias: "label" }
      ],
      from: { type: "table", table: this.props.idTable, alias: "main" },
      where,
      orderBy: [{ ordinal: 2, direction: "asc" }],
      limit: 50
    }

    if (this.props.filter) {
      if (query.where) {
        query.where = {
          type: "op",
          op: "and",
          exprs: [query.where, this.props.filter]
        }
      } else {
        query.where = this.props.filter
      }
    }

    // Add custom orderings
    if (this.props.orderBy) {
      query.orderBy = this.props.orderBy.concat(query.orderBy)
    }

    // Execute query
    this.props.dataSource.performQuery(query, (err: any, rows: any) => {
      if (err) {
        return
      }

      // Filter null and blank
      rows = _.filter(rows, (r: any) => r.label)

      return cb(rows)
    })
  }

  render() {
    return R(
      "div",
      { style: { width: "100%" } },
      R(AsyncReactSelect, {
        ref: (c) => {
          return (this.select = c)
        },
        value: this.state.currentValue,
        placeholder: this.props.placeholder || "Select",
        loadOptions: this.loadOptions,
        isMulti: this.props.multi,
        isClearable: true,
        isLoading: this.state.loading,
        onChange: this.handleChange,
        noOptionsMessage: () => "Type to search",
        defaultOptions: true,
        closeMenuOnScroll: true,
        menuPortalTarget: document.body,
        styles: {
          // Keep menu above fixed data table headers and map
          menu: (style) => _.extend({}, style, { zIndex: 2000 }),
          menuPortal: (style) => _.extend({}, style, { zIndex: 2000 })
        }
      })
    )
  }
}
