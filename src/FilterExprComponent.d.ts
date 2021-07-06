import { Schema, DataSource, Variable, Expr } from "mwater-expressions"
import React from "react"

/** Displays a boolean filter expression. Just shows "+ Add filter" (or other add label) when empty */
export default class FilterExprComponent extends React.Component<{
  schema: Schema
  dataSource: DataSource
  variables?: Variable[]
  /** Current table */
  table: string
  /** Current value */
  value?: Expr
  /** Called with new expression */
  onChange: (expr: Expr) => void
  /** Label for adding item. Default "+ Add Label" */
  addLabel?: React.ReactNode
}> {}
