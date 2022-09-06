import React from "react"
const R = React.createElement
import * as selection from "./saveSelection"

export interface ContentEditableComponentProps {
  html: string
  /** Called with element */
  onChange: any
  /** Style to add to div */
  style?: any
  /** Set to catch click events */
  onClick?: any
  /** Set to catch focus events */
  onFocus?: any
  onBlur?: any
}

// Content editable component with cursor restoring
export default class ContentEditableComponent extends React.Component<ContentEditableComponentProps> {
  handleInput = (ev: any) => {
    if (!this.editor) {
      return
    }

    return this.props.onChange(this.editor)
  }

  handleBlur = (ev: any) => {
    this.props.onBlur?.(ev)

    // Cancel timer
    if (this.selSaver) {
      clearTimeout(this.selSaver)
      this.selSaver = null
    }

    if (!this.editor) {
      return
    }

    return this.props.onChange(this.editor)
  }

  handleFocus = (ev: any) => {
    this.props.onFocus?.(ev)

    // Start selection saver (blur is not reliable in Firefox)
    var saveRange = () => {
      this.range = selection.save(this.editor)
      this.selSaver = setTimeout(saveRange, 200)
    }

    if (!this.selSaver) {
      this.selSaver = setTimeout(saveRange, 200)
    }
  }
  editor: HTMLElement | null
  lastInnerHTML: string
  range: any
  selSaver: NodeJS.Timeout | null

  focus() {
    this.editor!.focus()
  }

  pasteHTML(html: any) {
    this.editor!.focus()

    // Restore caret
    if (this.range) {
      selection.restore(this.editor, this.range)
    }

    pasteHtmlAtCaret(html)

    return this.props.onChange(this.editor)
  }

  getSelectedHTML() {
    let container: HTMLElement
    let html = ""
    const sel = window.getSelection()!
    if (sel.rangeCount) {
      container = document.createElement("div")
      for (let i = 0, end = sel.rangeCount, asc = 0 <= end; asc ? i < end : i > end; asc ? i++ : i--) {
        container.appendChild(sel.getRangeAt(i).cloneContents())
      }
    }
    html = container!.innerHTML
    return html
  }

  shouldComponentUpdate(nextProps: any) {
    // Update if prop html has changed
    // Note: this used to check if inner html has changed (i.e. this.editor.innerHTML !== this.lastInnerHTML)
    // but that caused problems with delayed refreshes https://github.com/mWater/mwater-visualization/issues/460
    const changed = !this.editor || nextProps.html !== this.props.html
    // if changed
    //   console.log nextProps.html
    //   console.log @props.html
    //   console.log @editor.innerHTML
    //   console.log @lastInnerHTML
    return changed
  }

  componentWillUpdate() {
    // Save caret
    this.range = selection.save(this.editor)
  }

  componentDidMount() {
    if (this.editor) {
      // Set inner html
      this.editor.innerHTML = this.props.html
      this.lastInnerHTML = this.editor.innerHTML
    }
  }

  componentDidUpdate() {
    if (this.editor) {
      // Set inner html
      this.editor.innerHTML = this.props.html
      this.lastInnerHTML = this.editor.innerHTML
    }

    // Restore caret if still focused
    if (document.activeElement === this.editor && this.range) {
      selection.restore(this.editor, this.range)
    }
  }

  componentWillUnmount() {
    // Cancel timer
    if (this.selSaver) {
      clearTimeout(this.selSaver)
      this.selSaver = null
    }
  }

  render() {
    return R("div", {
      contentEditable: true,
      spellCheck: true,
      ref: (c) => {
        this.editor = c
      },
      onClick: this.props.onClick,
      style: this.props.style,
      onInput: this.handleInput,
      onFocus: this.handleFocus,
      onBlur: this.handleBlur
    })
  }
}

// http://stackoverflow.com/questions/6690752/insert-html-at-caret-in-a-contenteditable-div
// TODO selectPastedContent doesn't work
function pasteHtmlAtCaret(html: any) {
  let range = undefined
  const sel = window.getSelection()!

  if (sel.getRangeAt && sel.rangeCount) {
    range = sel.getRangeAt(0)
    range.deleteContents()

    // Create fragment to insert
    const el = document.createElement("div")
    el.innerHTML = html
    const frag = document.createDocumentFragment()
    let node = undefined
    let lastNode = undefined
    while ((node = el.firstChild)) {
      lastNode = frag.appendChild(node)
    }
    const firstNode = frag.firstChild

    range = range.cloneRange()
    range.insertNode(frag)
    range.collapse(true)
    sel.removeAllRanges()
    return sel.addRange(range)
  }
}

// if selectPastedContent
//       range.setStartBefore firstNode
//     else
//       range.collapse true
