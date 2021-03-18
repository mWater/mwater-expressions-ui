import React from 'react'
import { Schema, DataSource, EnumValue, LiteralExpr } from 'mwater-expressions'
import { JsonQLExpr } from 'jsonql'

export { default as PropertyListComponent } from './properties/PropertyListComponent'

export { default as ExprComponent } from './ExprComponent'
export { default as FilterExprComponent } from './FilterExprComponent'

export * from './TableSelectComponent'

export * from './extensions'

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
  filter?: JsonQLExpr

  /** Optional label expression to use. Will fallback to label column or primary key. Put "main" as tableAlias. JsonQL */
  labelExpr?: JsonQLExpr
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
