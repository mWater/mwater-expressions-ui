import React from 'react'
import { Schema, DataSource, Expr, LocalizedString, AggrStatus, Variable, EnumValue, LiteralExpr } from 'mwater-expressions'
import { JsonQL } from 'jsonql'

export { default as PropertyListComponent } from './properties/PropertyListComponent'

export class ExprComponent extends React.Component<{
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

/** Displays a boolean filter expression. Just shows "+ Add filter" (or other add label) when empty */
export class FilterExprComponent extends React.Component<{
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

export class IdLiteralComponent extends React.Component<{
  /** Value of primary key or array of primary keys */
  value: string | string[] | number | number[] | null

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
  filter?: JsonQL

  /** Optional label expression to use. Will fallback to label column or primary key. Put "main" as tableAlias. JsonQL */
  labelExpr?: JsonQL
}> {}

export class LiteralExprStringComponent extends React.Component<{
  schema: Schema
  dataSource: DataSource

  /** Current expression value */
  value: LiteralExpr

  /** Array of { id:, name: } of enum values that can be selected. Only when type = "enum" */
  enumValues?: EnumValue[]

  /** e.g "en" */
  locale?: string
}> {}
