import _ from "lodash"
import { Expr, ExprUtils, Schema } from "mwater-expressions"
import React, { ReactElement } from "react"
import { createContext, ReactNode, useContext } from "react"
import ReactSelect from "react-select"

/* NOTE: NOT CURRENTLY USED, BUT SHOULD REPLACE THE ONE IN mwater-visualization and SWITCH TO NEW REACT CONTEXT */
/** Factory to create a custom table select component */
export type CustomTableSelectComponentFactory = (options: {
  schema: Schema

  /** Current table id */
  value: string | null | undefined

  /** Newly selected table id */
  onChange: (value: string | null) => void

  /** Some table select components (not the default) can also perform filtering. Include these props to enable this */
  filter?: Expr
  onFilterChange?: (filter: Expr) => void
}) => ReactNode

/** Context to override the table select component */
export const CustomTableSelectComponentFactoryContext = createContext<CustomTableSelectComponentFactory | null>(null)

/** Context to set the locale */
export const LocaleContext = createContext<string>("en")

/** Optional list of tables (ids) being used. Some overrides of the table select component may use this to present
 * an initially short list to select from */
export const ActiveTablesContext = createContext<string[]>([])

/** Table select component that uses custom one if available */
export const TableSelectComponent = (props: {
  schema: Schema

  /** Current table id */
  value: string | null | undefined

  /** Newly selected table id */
  onChange: (value: string | null) => void

  /** Locale to use */
  locale?: string

  /** Some table select components (not the default) can also perform filtering. Include these props to enable this */
  filter?: Expr
  onFilterChange?: (filter: Expr) => void
}) => {
  const value = props.value

  const customTableSelectComponentFactory = useContext(CustomTableSelectComponentFactoryContext)
  const locale = useContext(LocaleContext)

  if (customTableSelectComponentFactory) {
    return <div>{customTableSelectComponentFactory(props)}</div>
  }

  const tables = props.schema.getTables().filter((table) => !table.deprecated)
  const options = _.sortBy(
    tables.map((table) => ({ value: table.id, label: ExprUtils.localizeString(table.name, locale) })),
    "label"
  )

  return (
    <ReactSelect
      value={value ? options.find((t) => t.value == props.value) : null}
      options={options}
      onChange={(v) => {
        props.onChange(v ? v.value : null)
      }}
      menuPortalTarget={document.body}
      styles={{ menuPortal: (style) => ({ ...style, zIndex: 2000 }) }}
      placeholder="Select..."
    />
  )
}
