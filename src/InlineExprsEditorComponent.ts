import _ from "lodash"
import PropTypes from "prop-types"
import React from "react"
const R = React.createElement
import ExprComponent from "./ExprComponent"
import { ExprUtils } from "mwater-expressions"
import ActionCancelModalComponent from "react-library/lib/ActionCancelModalComponent"
import ContentEditableComponent from "./ContentEditableComponent"

interface InlineExprsEditorComponentProps {
  /** Schema to use */
  schema: any
  /** Data source to use to get values */
  dataSource: any
  /** Current table */
  table: string
  /** Text with embedded expressions as {0}, {1}, etc. */
  text?: string
  /** Expressions that correspond to {0}, {1}, etc. */
  exprs?: any
  /** Called with (text, exprs) */
  onChange: any
  /** Allow multiple lines */
  multiline?: boolean
  /** Optional number of lines */
  rows?: number
}

// TODO perhaps use http://wadmiraal.net/lore/2012/06/14/contenteditable-hacks-returning-like-a-pro/

// Editor that is a text box with embeddable expressions
export default class InlineExprsEditorComponent extends React.Component<InlineExprsEditorComponentProps> {
  static defaultProps = { exprs: [] }

  handleInsertClick = () => {
    return this.insertModal.open()
  }

  handleInsert = (expr: any) => {
    if (expr) {
      return this.contentEditable.pasteHTML(this.createExprHtml(expr))
    }
  }

  handleUpdate = (expr: any, index: any) => {
    const exprs = this.props.exprs.slice()
    exprs[index] = expr
    return this.props.onChange(this.props.text, exprs)
  }

  handleClick = (ev: any) => {
    // Get index of expression
    let index = ev.target.dataset["index"]
    if (index && index.match(/^\d+$/)) {
      index = parseInt(index)
      return this.updateModal.open(this.props.exprs[index], index)
    }
  }

  // Handle a change to the content editable element
  handleChange = (elem: any) => {
    // console.log "handleChange: #{elem.innerHTML}"

    // Walk DOM tree, adding strings and expressions
    let text = ""
    const exprs: any = []

    // Keep track of <br> as a div after a br is not a new cr
    let wasBr = false

    // Which index of expression is current
    let index = 0

    var processNode = (node: any, isFirst: any) => {
      if (node.nodeType === 1) {
        // Element
        // If br, add enter
        if (["br", "BR"].includes(node.tagName)) {
          text += "\n"
          wasBr = true
          return
        }

        // If expression, handle specially
        if (node.className && node.className.match(/inline-expr-block/)) {
          // Get expression decoded from comment which is first child
          const commentNode = _.find(node.childNodes, (subnode) => subnode.nodeType === 8)
          if (commentNode) {
            text += "{" + index + "}"
            exprs.push(JSON.parse(decodeURIComponent(commentNode.nodeValue)))
            index += 1
          }
          return
        }

        // <div><br><div> is just simple \n
        if (node.tagName.toLowerCase() === "div" && node.innerHTML.toLowerCase() === "<br>") {
          text += "\n"
          wasBr = false
          return
        }

        // If div, add enter if not initial div
        if (!isFirst && !wasBr && ["div", "DIV"].includes(node.tagName)) {
          text += "\n"
        }

        wasBr = false

        // Recurse to children
        return (() => {
          const result = []
          for (let subnode of node.childNodes) {
            result.push(processNode(subnode))
          }
          return result
        })()
      } else if (node.nodeType === 3) {
        wasBr = false

        // Append text, stripping \r\n if not multiline
        let nodeText = node.nodeValue
        if (!this.props.multiline) {
          nodeText = nodeText.replace(/\r?\n/g, " ")
        }

        return (text += nodeText)
      }
    }

    processNode(elem, true)

    // Strip word joiner used to allow editing at end of string
    text = text.replace(/\u2060/g, "")

    // Enfore single line
    if (!this.props.multiline) {
      text = text.replace(/\r?\n/g, "")
    }

    // console.log "onChange: #{text}"
    return this.props.onChange(text, exprs)
  }

  // Create html for an expression
  createExprHtml(expr: any, index: any) {
    // Create expr utils
    const exprUtils = new ExprUtils(this.props.schema)

    let summary = exprUtils.summarizeExpr(expr) || ""

    // Limit length
    if (summary.length > 50) {
      summary = summary.substr(0, 50) + "..."
    }

    // Add as div with a comment field that encodes the content
    return (
      '<div class="inline-expr-block" contentEditable="false" data-index="' +
      index +
      '"><!--' +
      encodeURIComponent(JSON.stringify(expr)) +
      "-->" +
      _.escape(summary) +
      "</div>&#x2060;"
    )
  }

  createContentEditableHtml() {
    // Escape HTML
    let html = _.escape(this.props.text)

    // Replace {0}, {1}, etc with an inline div <div class="inline-expr"><!--encoded expression-->SUMMARY</div>
    html = html.replace(/\{(\d+)\}/g, (match, index) => {
      index = parseInt(index)
      const expr = this.props.exprs[index]
      if (expr) {
        return this.createExprHtml(expr, index)
      }
      return ""
    })

    // Keep CR
    if (this.props.multiline) {
      html = html.replace(/\r?\n/g, "<br>")
    }

    // Special case of trailing br (Chrome behaviour won't render)
    html = html.replace(/<br>$/, "<div><br></div>")
    // html = html.replace(/^<br>/, "<div><br></div>")

    // If empty, put placeholder
    if (html.length === 0) {
      html = "&#x2060;"
    }

    // console.log "createHtml: #{html}"
    return html
  }

  renderInsertModal() {
    return R(ExprInsertModalComponent, {
      ref: (c: any) => {
        return (this.insertModal = c)
      },
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.table,
      onInsert: this.handleInsert
    })
  }

  renderUpdateModal() {
    return R(ExprUpdateModalComponent, {
      ref: (c: any) => {
        return (this.updateModal = c)
      },
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.table,
      onUpdate: this.handleUpdate
    })
  }

  render() {
    return R(
      "div",
      { style: { position: "relative" } },
      this.renderInsertModal(),
      this.renderUpdateModal(),
      R(
        "div",
        { style: { paddingRight: 20 } },
        R(ContentEditableComponent, {
          ref: (c) => {
            return (this.contentEditable = c)
          },
          html: this.createContentEditableHtml(),
          style: {
            whiteSpace: "pre-wrap",
            padding: "6px 12px",
            border: "1px solid #ccc",
            borderRadius: 4,
            minHeight: this.props.multiline && this.props.rows ? `${this.props.rows * 2.5}ex` : undefined
          },
          onChange: this.handleChange,
          onClick: this.handleClick
        })
      ),
      R(
        "a",
        {
          onClick: this.handleInsertClick,
          style: { cursor: "pointer", position: "absolute", right: 5, top: 8, fontStyle: "italic", color: "var(--bs-primary)" }
        },
        "f",
        R("sub", null, "x")
      )
    )
  }
}

interface ExprInsertModalComponentProps {
  /** Schema to use */
  schema: any
  /** Data source to use to get values */
  dataSource: any
  /** Current table */
  table: string
  onInsert: any
}

interface ExprInsertModalComponentState {
  open: any
  expr: any
}

// Modal that displays an expression builder
class ExprInsertModalComponent extends React.Component<ExprInsertModalComponentProps, ExprInsertModalComponentState> {
  constructor(props: any) {
    super(props)

    this.state = {
      open: false,
      expr: null
    }
  }

  open() {
    return this.setState({ open: true, expr: null })
  }

  render() {
    if (!this.state.open) {
      return null
    }

    return R(
      ActionCancelModalComponent,
      {
        size: "large",
        actionLabel: "Insert",
        onAction: () => {
          // Close first to avoid strange effects when mixed with pojoviews
          return this.setState({ open: false }, () => {
            return this.props.onInsert(this.state.expr)
          })
        },
        onCancel: () => this.setState({ open: false }),
        title: "Insert Expression"
      },
      R(
        "div",
        { style: { paddingBottom: 200 } },
        R(ExprComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: this.props.table,
          types: ["text", "number", "enum", "date", "datetime"],
          value: this.state.expr,
          onChange: (expr: any) => this.setState({ expr })
        })
      )
    )
  }
}

interface ExprUpdateModalComponentProps {
  /** Schema to use */
  schema: any
  /** Data source to use to get values */
  dataSource: any
  /** Current table */
  table: string
  onUpdate: any
}

interface ExprUpdateModalComponentState {
  open: any
  expr: any
  index: any
}

// Modal that displays an expression builder
class ExprUpdateModalComponent extends React.Component<ExprUpdateModalComponentProps, ExprUpdateModalComponentState> {
  constructor(props: any) {
    super(props)

    this.state = {
      open: false,
      expr: null,
      index: null
    }
  }

  open(expr: any, index: any) {
    return this.setState({ open: true, expr, index })
  }

  render() {
    if (!this.state.open) {
      return null
    }

    return R(
      ActionCancelModalComponent,
      {
        size: "large",
        actionLabel: "Update",
        onAction: () => {
          // Close first to avoid strange effects when mixed with pojoviews
          return this.setState({ open: false }, () => {
            return this.props.onUpdate(this.state.expr, this.state.index)
          })
        },
        onCancel: () => this.setState({ open: false }),
        title: "Update Expression"
      },
      R(
        "div",
        { style: { paddingBottom: 200 } },
        R(ExprComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: this.props.table,
          types: ["text", "number", "enum", "date", "datetime"],
          value: this.state.expr,
          onChange: (expr: any) => this.setState({ expr })
        })
      )
    )
  }
}
