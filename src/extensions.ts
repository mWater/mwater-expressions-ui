import {
  AggrStatus,
  DataSource,
  ExtensionExpr,
  LiteralType,
  LocalizedString,
  Schema,
  Variable
} from "mwater-expressions"
import { ReactNode } from "react"

/** Global list of extensions */
const exprUIExtensions: ExprUIExtension<ExtensionExpr>[] = []

/** Extension to the expression language. Referenced by ExtentionExprs  */
export interface ExprUIExtension<T extends ExtensionExpr> {
  /** Id of the expression type */
  id: string

  /** Name to display in function picker */
  name: LocalizedString

  /** Optional description */
  desc?: LocalizedString

  /** Possible aggregate statuses */
  aggrStatuses: AggrStatus[]

  /** Optionally restrict table */
  table?: string

  /** Optionally restrict types it can return */
  types?: LiteralType[]

  /** Create default expression for a table */
  createDefaultExpr(table: string | null): T

  /** Create display component for expression */
  createExprElement(options: {
    expr: T
    onExprChange: (expr: T | null) => void
    schema: Schema
    dataSource: DataSource
    variables: Variable[]
    aggrStatuses: AggrStatus[]
    locale: string | null
    types?: LiteralType[]
    idTable?: string
  }): ReactNode
}

/** Register an extension to expressions UI
 */
export function registerExprUIExtension(extension: ExprUIExtension<ExtensionExpr>) {
  exprUIExtensions.push(extension)
}

/** Get all extensions registered */
export function getExprUIExtensions(): ExprUIExtension<ExtensionExpr>[] {
  return exprUIExtensions
}
