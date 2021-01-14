import { Schema, DataSource, Expr, Variable, LocalizedString, AggrStatus } from "mwater-expressions";
import React from "react";

export default class ExprComponent extends React.Component<{
  schema: Schema
  dataSource: DataSource
  table: string | null
  value: Expr
  onChange: (expr: Expr) => void
  
  /** Variables that are available to be selected */
  variables?: Variable[]

  /** If specified, the types (value type) of expression required. e.g. ["boolean"] */
  types?: string[]
  enumValues?: Array<{ id: string, name: LocalizedString }>
  idTable?: string
  preferLiteral?: boolean
  aggrStatuses?: Array<AggrStatus>
  placeholder?: string
}> {}
