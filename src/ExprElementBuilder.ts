import _ from "lodash"
import React, { ReactNode } from "react"
const R = React.createElement

import { AggrStatus, BuildEnumsetExpr, CaseExpr, DataSource, EnumValue, Expr, ExprUtils, LiteralExpr, LiteralType, OpExpr, ScalarExpr, Schema, Variable } from "mwater-expressions"
import LinkComponent from "./LinkComponent"
import StackedComponent from "./StackedComponent"
import ScoreExprComponent from "./ScoreExprComponent"
import BuildEnumsetExprComponent from "./BuildEnumsetExprComponent"
import ExprLinkComponent from "./ExprLinkComponent"
import { getExprUIExtensions } from "./extensions"
import { ListEditorComponent } from "react-library/lib/ListEditorComponent"
import RemovableComponent from "./RemovableComponent"

export interface BuildOptions {
  /** required value types of expression e.g. ['boolean'] */
  types?: LiteralType[]

  /** key of the resulting element */
  key?: string

  /** array of { id, name } for the enumerable values to display */
  enumValues?: EnumValue[]

  /** the table from which id-type expressions must come */
  idTable?: string

  /** expression to get values for (used for literals). This is primarily for text fields to allow easy selecting of literal values */
  refExpr?: Expr

  /** to preferentially choose literal expressions (used for RHS of expressions) */
  preferLiteral?: boolean

  /** pass ops to *not* offer to wrap in */
  suppressWrapOps?: string[]

  /** true to include count (id) item at root level in expression selector */
  includeAggr?: boolean

  /** statuses of aggregation to allow. list of "individual", "literal", "aggregate". Default: ["individual", "literal"] or ["literal"] if not table */
  aggrStatuses?: AggrStatus[]

  /** empty placeholder */
  placeholder?: ReactNode

  /** ref to put on expr link component */
  exprLinkRef?: React.Ref<any>
}

// Builds a react element for an expression
export default class ExprElementBuilder {
  schema: Schema
  dataSource: DataSource
  locale: string | undefined
  variables: Variable[]
  exprUtils: ExprUtils

  constructor(schema: any, dataSource: any, locale?: any, variables?: Variable[]) {
    this.schema = schema
    this.dataSource = dataSource
    this.locale = locale
    this.variables = variables || []

    this.exprUtils = new ExprUtils(this.schema, variables)
  }

  // Build the tree for an expression
  // Options include:
  //   types: required value types of expression e.g. ['boolean']
  //   key: key of the resulting element
  //   enumValues: array of { id, name } for the enumerable values to display
  //   idTable: the table from which id-type expressions must come
  //   refExpr: expression to get values for (used for literals). This is primarily for text fields to allow easy selecting of literal values
  //   preferLiteral: to preferentially choose literal expressions (used for RHS of expressions)
  //   suppressWrapOps: pass ops to *not* offer to wrap in
  //   includeAggr: true to include count (id) item at root level in expression selector
  //   aggrStatuses: statuses of aggregation to allow. list of "individual", "literal", "aggregate". Default: ["individual", "literal"] or ["literal"] if not table
  //   placeholder: empty placeholder
  //   exprLinkRef: ref to put on expr link component
  build(expr: Expr, table: string | undefined, onChange: ((expr: Expr) => void) | undefined, options: BuildOptions = {}): ReactNode {
    let elem
    _.defaults(options, {
      aggrStatuses: table ? ["individual", "literal"] : ["literal"]
    })

    // True if a boolean expression is required
    const booleanOnly = options.types && options.types.length === 1 && options.types[0] === "boolean"

    // True if an aggregate number or individual boolean is required, in which case any expression can be transformed into it
    let anyTypeAllowed = false
    if (!options.types) {
      anyTypeAllowed = true
    } else if (
      options.types.includes("boolean") &&
      (options.aggrStatuses!.includes("individual") || options.aggrStatuses!.includes("literal")) &&
      options.types.length === 1
    ) {
      anyTypeAllowed = true
    } else if (
      options.types.includes("number") &&
      options.aggrStatuses!.includes("aggregate") &&
      !options.aggrStatuses!.includes("individual")
    ) {
      anyTypeAllowed = true
    }

    // Get current expression type
    const exprType = this.exprUtils.getExprType(expr)

    // Handle empty and literals and fields with ExprLinkComponent
    if (!expr || !expr.type || expr.type === "literal" || expr.type === "field") {
      elem = R(ExprLinkComponent, {
        schema: this.schema,
        dataSource: this.dataSource,
        variables: this.variables,
        table,
        value: expr,
        onChange,
        // Allow any type if transformable
        types: !anyTypeAllowed ? options.types : undefined,
        // Case statements only when not boolean
        allowCase: !booleanOnly,
        enumValues: options.enumValues,
        idTable: options.idTable,
        initialMode: options.preferLiteral ? "literal" : undefined,
        includeAggr: options.includeAggr,
        aggrStatuses: options.aggrStatuses,
        placeholder: options.placeholder,
        refExpr: options.refExpr,
        ref: options.exprLinkRef,
        // Hint that requires boolean
        booleanOnly
      })
    } else if (expr.type === "op") {
      elem = this.buildOp(expr, table, onChange, { ...options, aggrStatuses: options.aggrStatuses! })
      // else if expr.type == "field"
      //   elem = @buildField(expr, onChange, { key: options.key })
    } else if (expr.type === "scalar") {
      elem = this.buildScalar(expr, onChange, {
        key: options.key,
        types: options.types,
        enumValues: options.enumValues
      })
    } else if (expr.type === "case") {
      elem = this.buildCase(expr, onChange, { 
        key: options.key, 
        types: options.types, 
        enumValues: options.enumValues, 
        aggrStatuses: options.aggrStatuses!, 
        idTable: options.idTable 
      })
    } else if (expr.type === "id") {
      elem = this.buildId(expr, onChange, { key: options.key })
    } else if (expr.type === "score") {
      elem = this.buildScore(expr, onChange, { key: options.key })
    } else if (expr.type === "build enumset") {
      elem = this.buildBuildEnumset(expr, onChange, { key: options.key, enumValues: options.enumValues })
    } else if (expr.type === "variable") {
      elem = this.buildVariable(expr, onChange, { key: options.key })
    } else if (expr.type === "extension") {
      const extension = _.findWhere(getExprUIExtensions(), { id: expr.extension })
      if (!extension) {
        return `Unsupported extension ${expr.extension}`
      }
      elem = extension.createExprElement({
        expr,
        onExprChange: onChange,
        schema: this.schema,
        dataSource: this.dataSource,
        variables: this.variables || [],
        locale: this.locale || null,
        aggrStatuses: options.aggrStatuses!,
        types: options.types,
        idTable: options.idTable
      })
    } else {
      throw new Error(`Unhandled expression type ${expr.type}`)
    }

    // Wrap element with hover links to build more complex expressions or to clear it
    const links = []

    // Create a link to wrap the expression with an op. type is "n" for +/* that can take n, "binary" for -//, "unary" for sum, etc.
    function createWrapOp(op: string, name: string, type = "unary") {
      if (!onChange) {
        return
      }

      if (!(options.suppressWrapOps || []).includes(op)) {
        if (type === "unary") {
          links.push({ label: name, onClick: () => onChange({ type: "op", op, table, exprs: [expr] }) })
          // Prevent nesting when simple adding would work
        } else if ((expr as OpExpr).op !== op || type === "binary") {
          links.push({ label: name, onClick: () => onChange({ type: "op", op, table, exprs: [expr, null] }) })
        } else {
          // Just add extra element for n items
          links.push({
            label: name,
            onClick: () => {
              const exprs = (expr as OpExpr).exprs.slice()
              exprs.push(null)
              onChange({ ...(expr as OpExpr), exprs })
            }
          })
        }
      }
    }

    // If boolean, add and/or link.
    if (exprType === "boolean") {
      createWrapOp("and", "+ And", "n")
      createWrapOp("or", "+ Or", "n")
      createWrapOp("not", "Not", "unary")
      createWrapOp("is null", "Is blank", "unary")
    }

    if (exprType === "number") {
      createWrapOp("+", "+", "n")
      createWrapOp("-", "-", "binary")
      createWrapOp("*", "*", "n")
      createWrapOp("/", "/", "binary")

      // If option to wrap in sum
      if (options.aggrStatuses!.includes("aggregate") && this.exprUtils.getExprAggrStatus(expr) === "individual") {
        createWrapOp("sum", "Total", "unary")
      }
    }

    // Add + If
    if (expr && expr.type === "case") {
      links.push({
        label: "+ If",
        onClick: () => {
          const cases = expr.cases.slice()
          cases.push({ when: null, then: null })
          onChange!({ ...expr, cases })
        }
      })
    }

    const exprTable = expr ? (expr as any).table as string | undefined : undefined

    // Add case mapping for enum
    if (exprType === "enum") {
      links.push({
        label: "Map Values",
        onClick: () => {
          const newExpr: CaseExpr = {
            type: "case",
            table: exprTable,
            cases: _.map(this.exprUtils.getExprEnumValues(expr)!, (ev) => {
              const literal = { type: "literal", valueType: "enum", value: ev.id }

              return {
                when: { type: "op", table: exprTable, op: "=", exprs: [expr, literal] } as Expr,
                then: { type: "literal", valueType: "text", value: ExprUtils.localizeString(ev.name) } as Expr
              }
            }),
            else: null
          }

          onChange!(newExpr)
        }
      })
    }

    // links.push({ label: "Remove", onClick: => onChange(null) })
    if (links.length > 0 && onChange) {
      elem = R(WrappedLinkComponent, { links }, elem)
    }

    return elem
  }

  // Build an id component. Displays table name. Only remove option
  buildId(expr: any, onChange: any, options = {}): ReactNode {
    return R(
      LinkComponent,
      {
        dropdownItems: onChange
          ? [{ id: "remove", name: [R("i", { className: "fa fa-remove text-muted" }), " Remove"] }]
          : undefined,
        onDropdownItemClicked: () => onChange(null)
      },
      this.exprUtils.summarizeExpr(expr)
    )
  }

  // Build a variable component. Displays variable name. Only remove option
  buildVariable(expr: any, onChange: any, options = {}): ReactNode {
    return R(
      LinkComponent,
      {
        dropdownItems: onChange
          ? [{ id: "remove", name: [R("i", { className: "fa fa-remove text-muted" }), " Remove"] }]
          : undefined,
        onDropdownItemClicked: () => onChange(null)
      },
      this.exprUtils.summarizeExpr(expr)
    )
  }

  buildScalar(expr: ScalarExpr, onChange: any, options: {
    key?: any

    types?: LiteralType[]
 
    /** the table from which id-type expressions must come */
    idTable?: string
  
    /** array of { id, name } for the enumerable values to display */
    enumValues?: EnumValue[]
  } = {}): ReactNode {
    // Get joins string
    let innerElem
    let destTable = expr.table
    let joinsStr = ""
    for (let join of expr.joins) {
      const joinCol = this.schema.getColumn(destTable, join)!
      joinsStr += ExprUtils.localizeString(joinCol.name, this.locale) + " > "
      destTable = joinCol.type === "join" ? joinCol.join!.toTable : joinCol.idTable!
    }

    // If just a field or id inside, add to string and make a simple link control
    if (expr.expr && ["field", "id"].includes(expr.expr.type)) {
      // Summarize without aggregation (aggr is deprecated anyway)
      const summary = this.exprUtils.summarizeExpr(_.omit(expr, "aggr") as ScalarExpr)

      return R(
        "div",
        { style: { display: "flex", alignItems: "baseline" } },
        // Aggregate dropdown
        R(
          LinkComponent,
          {
            dropdownItems: onChange
              ? [{ id: "remove", name: [R("i", { className: "fa fa-remove text-muted" }), " Remove"] }]
              : undefined,
            onDropdownItemClicked: () => onChange(null)
          },
          summary
        )
      )
    } else {
      // Create inner expression onChange
      const innerOnChange = (value: any) => {
        return onChange(_.extend({}, expr, { expr: value }))
      }

      // Determine if can allow aggregation
      const multipleJoins = this.exprUtils.isMultipleJoins(expr.table, expr.joins)
      const innerAggrStatuses: AggrStatus[] = multipleJoins ? ["literal", "aggregate"] : ["literal", "individual"]

      // True if an individual boolean is required, in which case any expression can be transformed into it
      const anyTypeAllowed = !options.types || (options.types.includes("boolean") && options.types.length === 1)

      innerElem = this.build(expr.expr, destTable, onChange ? innerOnChange : undefined, {
        types: !anyTypeAllowed ? options.types : undefined,
        idTable: options.idTable,
        enumValues: options.enumValues,
        aggrStatuses: innerAggrStatuses
      })
    }

    return R(
      "div",
      { style: { display: "flex", alignItems: "baseline" }, key: options.key },
      R(
        LinkComponent,
        {
          dropdownItems: onChange
            ? [{ id: "remove", name: [R("i", { className: "fa fa-remove text-muted" }), " Remove"] }]
            : undefined,
          onDropdownItemClicked: () => onChange(null)
        },
        joinsStr
      ),
      innerElem
    )
  }

  // Builds on op component
  buildOp(expr: OpExpr, table: string | undefined, onChange: any, options: {
    /** array of { id, name } for the enumerable values to display */
    enumValues?: EnumValue[]

    /** the table from which id-type expressions must come */
    idTable?: string

    types?: LiteralType[]
 
    /** statuses of aggregation to allow. list of "individual", "literal", "aggregate". Default: ["individual", "literal"] or ["literal"] if not table */
    aggrStatuses: AggrStatus[]
  }): ReactNode {
    let rhsElem
    switch (expr.op) {
      // For vertical ops (ones with n values or other arithmetic)
      case "and":
      case "or":
      case "+":
      case "*":
      case "-":
      case "/":
        // Create inner items
        var items = _.map(expr.exprs, (innerExpr, i) => {
          // Create onChange that switched single value
          const innerElemOnChange = (newValue: any) => {
            const newExprs = expr.exprs.slice()
            newExprs[i] = newValue

            // Set expr value
            return onChange(_.extend({}, expr, { exprs: newExprs }))
          }

          const types: LiteralType[] = ["and", "or"].includes(expr.op) ? ["boolean"] : ["number"]
          const elem = this.build(innerExpr, table, onChange ? innerElemOnChange : undefined, {
            types,
            aggrStatuses: options.aggrStatuses,
            suppressWrapOps: [expr.op],
            key: `expr${i}`
          })
          const handleRemove = () => {
            const exprs = expr.exprs.slice()
            exprs.splice(i, 1)

            // If only one left, remove op entirely
            if (exprs.length === 1) {
              return onChange(exprs[0])
            } else {
              return onChange(_.extend({}, expr, { exprs }))
            }
          }

          return { elem, onRemove: handleRemove }
        })

        // Create stacked expression
        return R(StackedComponent, { joinLabel: expr.op, items })
      // Expressions with list of values
      case "concat":
        const opItem2 = this.exprUtils.findMatchingOpItems({
          op: expr.op,
          resultTypes: options.types
        })[0]

        return R("div", null, 
          R(RemovableComponent, { onRemove: () => onChange(null) }, 
            opItem2.name + ":"
          ),  
          R("div", { style: { display: "inline-block", minWidth: 200 }}, 
            R(ListEditorComponent, {
              items: expr.exprs,
              onItemsChange: (exprs: Expr[]) => onChange({ ...expr, exprs: exprs }),
              renderItem: (item: Expr, index, onItemChange) => this.build(item, table, onItemChange, { ...options, types: [opItem2.exprTypes[0]] }),
              createNew: () => (null as any)
            })
          )
        )
      default:
        // Horizontal expression. Render each part
        var opItems = this.exprUtils.findMatchingOpItems({
          op: expr.op,
          resultTypes: options.types,
          lhsExpr: expr.exprs[0]
        })
        var opItem = opItems[0]
        if (!opItem) {
          throw new Error(
            `No opItem defined for op:${expr.op}, resultType: ${options.types}, lhs:${JSON.stringify(expr.exprs[0])}`
          )
        }

        // Special case for no expressions
        if (opItem.exprTypes.length === 0) {
          return R(
            LinkComponent,
            {
              dropdownItems: onChange
                ? [{ id: "remove", name: [R("i", { className: "fa fa-remove text-muted" }), " Remove"] }]
                : undefined,
              onDropdownItemClicked: () => onChange(null)
            },
            this.exprUtils.summarizeExpr(expr, this.locale)
          )
        }

        var innerAggrStatuses: AggrStatus[] | undefined = opItem.aggr ? ["literal", "individual"] : options.aggrStatuses

        var lhsOnChange = (newValue: any) => {
          const newExprs = expr.exprs.slice()
          newExprs[0] = newValue

          // Set expr value
          return onChange(_.extend({}, expr, { exprs: newExprs }))
        }

        // lhs type is matching op item
        var lhsTypes = [opItem.exprTypes[0]]

        // However, if there are multiple possibilities and there is no existing lhs, allow all (as in days difference can take date or datetime)
        if (!expr.exprs[0]) {
          lhsTypes = _.map(opItems, (oi) => oi.exprTypes[0])
        }

        var lhsElem = this.build(expr.exprs[0], table, onChange ? lhsOnChange : undefined, {
          types: lhsTypes,
          aggrStatuses: innerAggrStatuses,
          key: "lhs",
          placeholder: opItem.lhsPlaceholder
        })

        // Special case for between
        if (expr.op === "between") {
          const rhs1OnChange = (newValue: any) => {
            const newExprs = expr.exprs.slice()
            newExprs[1] = newValue

            // Set expr value
            return onChange(_.extend({}, expr, { exprs: newExprs }))
          }

          const rhs2OnChange = (newValue: any) => {
            const newExprs = expr.exprs.slice()
            newExprs[2] = newValue

            // Set expr value
            return onChange(_.extend({}, expr, { exprs: newExprs }))
          }

          // Build rhs
          rhsElem = [
            this.build(expr.exprs[1], table, onChange ? rhs1OnChange : undefined, {
              types: [opItem.exprTypes[1]],
              enumValues: this.exprUtils.getExprEnumValues(expr.exprs[0]) ?? undefined,
              idTable: this.exprUtils.getExprIdTable(expr.exprs[0]) ?? undefined,
              refExpr: expr.exprs[0],
              preferLiteral: true,
              aggrStatuses: innerAggrStatuses,
              key: "expr1"
            }),
            "\u00A0and\u00A0",
            this.build(expr.exprs[2], table, onChange ? rhs2OnChange : undefined, {
              types: [opItem.exprTypes[2]],
              enumValues: this.exprUtils.getExprEnumValues(expr.exprs[0]) ?? undefined,
              idTable: this.exprUtils.getExprIdTable(expr.exprs[0]) ?? undefined,
              refExpr: expr.exprs[0],
              preferLiteral: true,
              aggrStatuses: innerAggrStatuses,
              key: "expr2"
            })
          ]
        } else if (opItem.exprTypes.length > 1) {
          // If has two expressions
          const rhsOnChange = (newValue: any) => {
            const newExprs = expr.exprs.slice()
            newExprs[1] = newValue

            // Set expr value
            return onChange(_.extend({}, expr, { exprs: newExprs }))
          }

          rhsElem = this.build(expr.exprs[1], table, onChange ? rhsOnChange : undefined, {
            key: "rhs",
            types: _.uniq(_.map(opItems, (oi) => oi.exprTypes[1])),
            enumValues: ["enum", "enumset"].includes(opItem.exprTypes[1])
              ? this.exprUtils.getExprEnumValues(expr.exprs[0])!
              : undefined, // Only include if type is enum or enumset
            idTable: this.exprUtils.getExprIdTable(expr.exprs[0]) ?? undefined,
            refExpr: expr.exprs[0],
            preferLiteral: opItem.rhsLiteral,
            aggrStatuses: innerAggrStatuses,
            placeholder: opItem.rhsPlaceholder
          })
        }

        // Create op dropdown (finding matching type and lhs, not op). Allow aggregates if appropriate
        var aggr = undefined
        if (!options.aggrStatuses.includes("aggregate")) {
          aggr = false
        }

        opItems = this.exprUtils.findMatchingOpItems({ resultTypes: options.types, lhsExpr: expr.exprs[0], aggr })

        // Remove current op
        opItems = _.filter(opItems, (oi) => oi.op !== expr.op)

        // Prefix toggle must be the same as current expr
        opItems = _.filter(opItems, (oi) => oi.prefix === opItem.prefix)

        // Keep distinct ops
        opItems = _.uniq(opItems, "op")

        var opElem = R(
          LinkComponent,
          {
            dropdownItems: onChange
              ? [{ id: "_remove", name: [R("i", { className: "fa fa-remove text-muted" }), " Remove"] } as { id: string, name: ReactNode}].concat(
                  _.map(opItems, (oi) => ({
                    id: oi.op,
                    name: oi.name
                  }))
                )
              : undefined,
            onDropdownItemClicked: (op: any) => {
              if (op === "_remove") {
                return onChange(null)
              } else {
                return onChange(_.extend({}, expr, { op }))
              }
            }
          },
          opItem.prefixLabel || opItem.name
        )

        // Some ops have prefix (e.g. "latitude of")
        if (opItem.prefix) {
          return R(
            "div",
            { style: { display: "flex", alignItems: "baseline", flexWrap: "wrap" } },
            opElem,
            lhsElem,
            opItem.joiner ? R("span", { style: { paddingLeft: 5, paddingRight: 5 } }, opItem.joiner) : undefined,
            rhsElem
          )
        } else {
          return R(
            "div",
            { style: { display: "flex", alignItems: "baseline", flexWrap: "wrap" } },
            lhsElem,
            opElem,
            rhsElem
          )
        }
    }
  }

  buildCase(expr: CaseExpr, onChange: ((expr: CaseExpr) => void) | undefined, options: {
    key?: any

    /** array of { id, name } for the enumerable values to display */
    enumValues?: EnumValue[]

    /** the table from which id-type expressions must come */
    idTable?: string

    types?: LiteralType[]
 
    /** statuses of aggregation to allow. list of "individual", "literal", "aggregate". Default: ["individual", "literal"] or ["literal"] if not table */
    aggrStatuses: AggrStatus[]
  }): ReactNode {
    // Style for labels "if", "then", "else"
    const labelStyle = {
      flex: "0 0 auto", // Don't resize
      padding: 5,
      color: "#AAA"
    }

    // Create inner elements
    const items: ReactNode[] = _.map(expr.cases, (cse, i) => {
      // Create onChange functions
      const innerElemOnWhenChange = (newWhen: any) => {
        const cases = expr.cases.slice()
        cases[i] = _.extend({}, cases[i], { when: newWhen })
        onChange!(_.extend({}, expr, { cases }))
      }

      const innerElemOnThenChange = (newThen: any) => {
        const cases = expr.cases.slice()
        cases[i] = _.extend({}, cases[i], { then: newThen })
        onChange!(_.extend({}, expr, { cases }))
      }

      // Build a flexbox that wraps with a when and then flexbox
      const elem = R(
        "div",
        { key: `${i}`, style: { display: "flex", alignItems: "baseline" } },
        R(
          "div",
          { key: "when", style: { display: "flex", alignItems: "baseline" } },
          R("div", { key: "label", style: labelStyle }, "if"),
          this.build(cse.when, expr.table, onChange ? innerElemOnWhenChange : undefined, {
            key: "content",
            types: ["boolean"],
            suppressWrapOps: ["if"],
            aggrStatuses: options.aggrStatuses
          })
        ),
        R(
          "div",
          { key: "then", style: { display: "flex", alignItems: "baseline" } },
          R("div", { key: "label", style: labelStyle }, "then"),
          this.build(cse.then, expr.table, onChange ? innerElemOnThenChange : undefined, {
            key: "content",
            types: options.types,
            preferLiteral: true,
            enumValues: options.enumValues,
            aggrStatuses: options.aggrStatuses,
            idTable: options.idTable
          })
        )
      )

      const handleRemove = () => {
        const cases = expr.cases.slice()
        cases.splice(i, 1)
        onChange!(_.extend({}, expr, { cases }))
      }

      return { elem, onRemove: onChange ? handleRemove : undefined }
    })

    // Add else
    const onElseChange = (newValue: any) => {
      onChange!(_.extend({}, expr, { else: newValue }))
    }

    items.push({
      elem: R(
        "div",
        { key: "when", style: { display: "flex", alignItems: "baseline" } },
        R("div", { key: "label", style: labelStyle }, "else"),
        this.build(expr.else, expr.table, onChange ? onElseChange : undefined, {
          key: "content",
          types: options.types,
          preferLiteral: true,
          enumValues: options.enumValues,
          aggrStatuses: options.aggrStatuses,
          idTable: options.idTable
        })
      )
    })

    // Create stacked expression
    return R(StackedComponent, { key: options.key, items })
  }

  buildScore(expr: any, onChange: any, options: any): ReactNode {
    return R(ScoreExprComponent, {
      schema: this.schema,
      dataSource: this.dataSource,
      value: expr,
      onChange
    })
  }

  buildBuildEnumset(expr: BuildEnumsetExpr, onChange: any, options: any): ReactNode {
    return R(BuildEnumsetExprComponent, {
      schema: this.schema,
      dataSource: this.dataSource,
      value: expr,
      enumValues: options.enumValues,
      onChange
    })
  }
}

interface WrappedLinkComponentProps {
  links: {
    label: ReactNode
    onClick: () => void
  }[]
}

/** Adds floating links below child component on hover */
class WrappedLinkComponent extends React.Component<WrappedLinkComponentProps> {
  renderLinks() {
    return R(
      "div",
      {
        style: {
          position: "absolute",
          left: 10,
          bottom: 0,
          whiteSpace: "nowrap"
        },
        className: "hover-display-child"
      },
      _.map(this.props.links, (link, i) => {
        return R(
          "a",
          {
            key: `${i}`,
            style: {
              paddingLeft: 3,
              paddingRight: 3,
              backgroundColor: "white",
              color: "var(--bs-primary)",
              cursor: "pointer",
              fontSize: 12
            },
            onClick: link.onClick
          },
          link.label
        )
      })
    )
  }

  render() {
    return R(
      "div",
      { style: { paddingBottom: 20, position: "relative" }, className: "hover-display-parent" },
      R("div", {
        style: {
          position: "absolute",
          height: 10,
          bottom: 10,
          left: 0,
          right: 0,
          borderLeft: "solid 1px #DDD",
          borderBottom: "solid 1px #DDD",
          borderRight: "solid 1px #DDD"
        },
        className: "hover-display-child"
      }),
      this.renderLinks(),
      this.props.children
    )
  }
}
