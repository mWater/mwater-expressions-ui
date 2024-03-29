import _ from "lodash"
import PropTypes from "prop-types"
import React, { ReactNode } from "react"
import { ScalarTreeNode } from "./ScalarExprTreeBuilder"
const R = React.createElement

interface ScalarExprTreeComponentProps {
  /** Tree from ScalarExprTreeBuilder */
  tree: ScalarTreeNode[]
  /** Called with newly selected value */
  onChange: any
  /** Render height of the component */
  height?: number
  filter?: string
}

// Shows a tree that selects table + joins + expr of a scalar expression
// Supports some React context properties for special. See individual classes
export default class ScalarExprTreeComponent extends React.Component<ScalarExprTreeComponentProps> {
  render() {
    return R(
      "div",
      { style: { overflowY: this.props.height ? "auto" : undefined, height: this.props.height } },
      R(ScalarExprTreeTreeComponent, {
        tree: this.props.tree,
        onChange: this.props.onChange,
        filter: this.props.filter
      })
    )
  }
}

interface ScalarExprTreeTreeComponentProps {
  /** Tree from ScalarExprTreeBuilder */
  tree: ScalarTreeNode[]
  /** Called with newly selected value */
  onChange: any
  /** String to prefix names with */
  prefix?: string
  filter?: string
}

class ScalarExprTreeTreeComponent extends React.Component<ScalarExprTreeTreeComponentProps> {
  render() {
    const elems = []
    // Get tree
    for (let i = 0; i < this.props.tree.length; i++) {
      const item = this.props.tree[i]
      if (item.children) {
        elems.push(
          R(ScalarExprTreeNodeComponent, {
            key: item.key,
            item,
            prefix: this.props.prefix,
            onChange: this.props.onChange,
            filter: this.props.filter
          })
        )
      } else {
        elems.push(
          R(ScalarExprTreeLeafComponent, {
            key: item.key,
            item,
            prefix: this.props.prefix,
            onChange: this.props.onChange
          })
        )
      }
    }

    return R("div", null, elems)
  }
}

interface ScalarExprTreeLeafComponentProps {
  /** Contains item "name" and "value" */
  item: ScalarTreeNode
  prefix?: string
  onChange: any
}

class ScalarExprTreeLeafComponent extends React.Component<ScalarExprTreeLeafComponentProps> {
  handleClick = () => {
    return this.props.onChange(this.props.item.value)
  }

  render() {
    const style = {
      padding: 4,
      borderRadius: 4,
      cursor: "pointer",
      color: "var(--bs-primary)"
    }

    return R(
      "div",
      { style, className: "hover-grey-background", onClick: this.handleClick, "data-key": this.props.item.key },
      this.props.prefix ? R("span", { className: "text-muted" }, this.props.prefix) : undefined,
      this.props.item.name,
      this.props.item.desc
        ? R("span", { className: "text-muted", style: { fontSize: 12, paddingLeft: 3 } }, " - " + this.props.item.desc)
        : undefined
    )
  }
}

interface ScalarExprTreeNodeComponentProps {
  /** Item to display */
  item: ScalarTreeNode

  /** Called when item is selected */
  onChange: any
  /** Optional string filter */
  filter?: string

  prefix?: string
}

interface ScalarExprTreeNodeComponentState {
  collapse: any
}

class ScalarExprTreeNodeComponent extends React.Component<
  ScalarExprTreeNodeComponentProps,
  ScalarExprTreeNodeComponentState
> {
  static contextTypes = // Function to decorate the children component of a section. Passed { children: React element of children, tableId: id of table, section: section object from schema, filter: optional string filter }
    // Should return decorated element
    { decorateScalarExprTreeSectionChildren: PropTypes.func }

  constructor(props: ScalarExprTreeNodeComponentProps) {
    super(props)
    this.state = {
      collapse: this.props.item.initiallyOpen ? "open" : "closed"
    }
  }

  componentWillReceiveProps(nextProps: any) {
    // If initially open changed, then update collapse
    if (nextProps.item.initiallyOpen !== this.props.item.initiallyOpen) {
      return this.setState({ collapse: nextProps.item.initiallyOpen ? "open" : "closed" })
    }
  }

  handleArrowClick = () => {
    if (this.state.collapse === "open") {
      return this.setState({ collapse: "closed" })
    } else if (this.state.collapse === "closed") {
      return this.setState({ collapse: "open" })
    }
  }

  handleItemClick = () => {
    // If no value, treat as arrow click
    if (!this.props.item.value) {
      return this.handleArrowClick()
    } else {
      return this.props.onChange(this.props.item.value)
    }
  }

  render() {
    let children, prefix: any
    let arrow = null

    if (this.state.collapse === "closed") {
      arrow = R("i", { className: "fa fa-plus-square-o", style: { width: 15 } })
    } else if (this.state.collapse === "open") {
      arrow = R("i", { className: "fa fa-minus-square-o", style: { width: 15 } })
    }

    if (this.state.collapse === "open") {
      // Compute new prefix, adding when going into joins
      prefix = this.props.prefix || ""
      if (this.props.item.item!.type === "join") {
        prefix = prefix + this.props.item.name + " > "
      }

      // Render child items
      const childItems = this.props.item.children!()

      children = _.map(childItems, (item): ReactNode => {
        if (item.children) {
          return R(ScalarExprTreeNodeComponent, {
            key: item.key,
            item,
            prefix,
            onChange: this.props.onChange,
            filter: this.props.filter
          })
        } else {
          return R(ScalarExprTreeLeafComponent, { key: item.key, item, prefix, onChange: this.props.onChange })
        }
      })

      // Decorate children if section
      if (this.context.decorateScalarExprTreeSectionChildren && this.props.item.item!.type === "section") {
        children = this.context.decorateScalarExprTreeSectionChildren({
          children,
          tableId: this.props.item.tableId,
          section: this.props.item.item,
          filter: this.props.filter
        })
      }

      // Pad left and give key
      children = R("div", { style: { paddingLeft: 18 }, key: "tree" }, children)
    }

    const color = this.props.item.value ? "var(--bs-primary)" : undefined

    return R(
      "div",
      null,
      R(
        "div",
        {
          style: { cursor: "pointer", padding: 4, marginLeft: 20, position: "relative" },
          key: "item",
          className: this.props.item.value ? "hover-grey-background" : undefined
        },
        R(
          "span",
          {
            style: { color: "var(--bs-primary)", cursor: "pointer", position: "absolute", left: -15 },
            onClick: this.handleArrowClick
          },
          arrow
        ),
        R(
          "div",
          { style: { color, display: "inline-block" }, onClick: this.handleItemClick },
          this.props.prefix ? R("span", { className: "text-muted" }, this.props.prefix) : undefined,
          this.props.item.name,
          // if @props.item.item.type == "join"
          //   R 'i', className: "fa fa-link", style: { paddingRight: 5, paddingLeft: 5 }
          this.props.item.desc
            ? R(
                "span",
                { className: "text-muted", style: { fontSize: 12, paddingLeft: 3 } },
                " - " + this.props.item.desc
              )
            : undefined
        )
      ),
      children
    )
  }
}
