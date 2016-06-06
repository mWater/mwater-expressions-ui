React = require 'react'
H = React.DOM
R = React.createElement
ExprComponent = require './ExprComponent'
ExprUtils = require("mwater-expressions").ExprUtils
select = require('selection-range')
ActionCancelModalComponent = require("react-library/lib/ActionCancelModalComponent")

# Editor that is a text box with embeddable expressions
module.exports = class InlineExprsEditorComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired   # Schema to use
    dataSource: React.PropTypes.object.isRequired # Data source to use to get values
    table: React.PropTypes.string.isRequired    # Current table

    text: React.PropTypes.string                # Text with embedded expressions as {0}, {1}, etc.
    exprs: React.PropTypes.array                # Expressions that correspond to {0}, {1}, etc.
    onChange: React.PropTypes.func.isRequired   # Called with (text, exprs)
    multiline: React.PropTypes.bool             # Allow multiple lines

  @defaultProps:
    exprs: []

  handleInsertClick: => @refs.insertModal.open()

  handleInsert: (expr) =>
    if expr
      @refs.contentEditable.pasteHTML(@createExprHtml(expr), false)

  # Handle a change to the content editable element
  handleChange: (elem) => 
    # console.log "handleChange: #{elem.innerHTML}"
    # Walk DOM tree, adding strings and expressions
    text = ""
    exprs = []

    # Keep track of <br> as a div after a br is not a new cr
    wasBr = false

    # Which index of expression is current
    index = 0

    processNode = (node, isFirst) =>
      if node.nodeType == 1 # Element
        # If br, add enter
        if node.tagName in ['br', 'BR']
          text += '\n'
          wasBr = true
          return

        # If expression, handle specially
        if node.className and node.className.match(/inline-expr-block/)
          # Get expression decoded from comment which is first child
          commentNode = _.find(node.childNodes, (subnode) -> subnode.nodeType == 8)
          text += "{" + index + "}" 
          exprs.push(JSON.parse(decodeURIComponent(commentNode.nodeValue)))
          index += 1
          return

        # If div, add enter if not initial div
        if not isFirst and not wasBr and node.tagName in ['div', 'DIV']
          text += "\n"

        wasBr = false

        # Recurse to children
        for subnode in node.childNodes
          processNode(subnode)

      else if node.nodeType == 3
        wasBr = false

        # Append text, stripping \r\n if not multiline
        nodeText = node.nodeValue
        if not @props.multiline
          nodeText = nodeText.replace(/\r?\n/g, " ")

        text += nodeText
   
    processNode(elem, true)

    # Strip word joiner used to allow editing at end of string
    text = text.replace(/\u2060/g, '')

    # Enfore single line
    if not @props.multiline
      text = text.replace(/\r?\n/g, "")

    # console.log "onChange: #{text}"
    @props.onChange(text, exprs)

  # Create html for an expression
  createExprHtml: (expr) ->
    # Create expr utils
    exprUtils = new ExprUtils(@props.schema)

    summary = exprUtils.summarizeExpr(expr)

    # Limit length
    if summary.length > 50
      summary = summary.substr(0, 50) + "..."

    # Add as div with a comment field that encodes the content
    return '<div class="inline-expr-block" contentEditable="false"><!--' + encodeURIComponent(JSON.stringify(expr)) + '-->' + _.escape(summary) + '</div>&#x2060;'

  createContentEditableHtml: ->
    # Escape HTML
    html = _.escape(@props.text)

    # Replace {0}, {1}, etc with an inline div <div class="inline-expr"><!--encoded expression-->SUMMARY</div>
    html = html.replace(/\{(\d+)\}/g, (match, index) =>
      index = parseInt(index)
      expr = @props.exprs[index]
      if expr
        return @createExprHtml(expr)
      return ""
      )

    # Keep CR (<br>)
    if @props.multiline
      html = html.replace(/\r?\n/g, "<br>")

    # If empty, put placeholder
    if html.length == 0
      html = '&#x2060;'

    # console.log "createHtml: #{html}"
    return html

  renderInsertModal: ->
    R ExprInsertModalComponent, ref: "insertModal", schema: @props.schema, dataSource: @props.dataSource, table: @props.table, onInsert: @handleInsert

  render: ->
    H.div style: { position: "relative" },
      @renderInsertModal()
      H.div style: { paddingRight: 20 },
        R ContentEditableComponent, ref: "contentEditable", html: @createContentEditableHtml(), onChange: @handleChange
      H.a onClick: @handleInsertClick, style: { cursor: "pointer", position: "absolute", right: 5, top: 8, fontStyle: "italic", color: "#337ab7" },
        "f"
        H.sub null, "x"

# Modal that displays an expression builder
class ExprInsertModalComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired   # Schema to use
    dataSource: React.PropTypes.object.isRequired # Data source to use to get values
    table: React.PropTypes.string.isRequired    # Current table
    onInsert: React.PropTypes.func.isRequired   # Called with expr to insert

  constructor: ->
    super

    @state = {
      open: false
      expr: null
    }

  open: ->
    @setState(open: true, expr: null)

  render: ->
    if not @state.open
      return null

    R ActionCancelModalComponent, 
      size: "large"
      actionLabel: "Insert"
      onAction: => 
        # Close first to avoid strange effects when mixed with pojoviews
        @setState(open: false, =>
          @props.onInsert(@state.expr)
        )
      onCancel: => @setState(open: false)
      title: "Insert Expression",
        R ExprComponent, 
          schema: @props.schema
          dataSource: @props.dataSource
          table: @props.table
          types: ['text', 'number']
          value: @state.expr
          onChange: (expr) => @setState(expr: expr)
  
# class TextWithExpressionsHtmlConverter

# Content editable component with cursor restoring
class ContentEditableComponent extends React.Component
  @propTypes:
    html: React.PropTypes.string.isRequired

  handleInput: (ev) => 
    if not @refs.editor
      return 

    @props.onChange(@refs.editor)

  # Save selection for refocusing
  handleBlur: =>
    if not @refs.editor
      return 

    @range = select(@refs.editor)
    @props.onChange(@refs.editor)

  pasteHTML: (html, selectPastedContent) ->
    @refs.editor.focus()

    # Restore caret
    if @range
      select(@refs.editor, @range)

    pasteHtmlAtCaret(html, selectPastedContent)
    @props.onChange(@refs.editor)

  shouldComponentUpdate: (nextProps) ->
    return not @refs.editor or nextProps.html != @refs.editor.innerHTML
 
  componentWillUpdate: ->
    # Save caret
    @range = select(@refs.editor)
    
  componentDidUpdate: ->
    # Sometimes update fails, so be sure it is updated
    if @refs.editor and @props.html != @refs.editor.innerHTML
      @refs.editor.innerHTML = @props.html

    # Restore caret if still focused
    if document.activeElement == @refs.editor
      select(@refs.editor, @range)

  render: ->
    H.div 
      contentEditable: true
      spellCheck: false
      ref: "editor"
      style: { padding: "6px 12px", border: "1px solid #ccc", borderRadius: 4 }
      onInput: @handleInput
      onBlur: @handleBlur
      dangerouslySetInnerHTML: { __html: @props.html }

# http://stackoverflow.com/questions/6690752/insert-html-at-caret-in-a-contenteditable-div
pasteHtmlAtCaret = (html, selectPastedContent) ->
  sel = undefined
  range = undefined
  if window.getSelection
    # IE9 and non-IE
    sel = window.getSelection()
    if sel.getRangeAt and sel.rangeCount
      range = sel.getRangeAt(0)
      range.deleteContents()
      # Range.createContextualFragment() would be useful here but is
      # only relatively recently standardized and is not supported in
      # some browsers (IE9, for one)
      el = document.createElement('div')
      el.innerHTML = html
      frag = document.createDocumentFragment()
      node = undefined
      lastNode = undefined
      while node = el.firstChild
        lastNode = frag.appendChild(node)
      firstNode = frag.firstChild
      range.insertNode frag
      # Preserve the selection
      if lastNode
        range = range.cloneRange()
        range.setStartAfter lastNode
        if selectPastedContent
          range.setStartBefore firstNode
        else
          range.collapse true
        sel.removeAllRanges()
        sel.addRange range
  else if (sel = document.selection) and sel.type != 'Control'
    # IE < 9
    originalRange = sel.createRange()
    originalRange.collapse true
    sel.createRange().pasteHTML html
    if selectPastedContent
      range = sel.createRange()
      range.setEndPoint 'StartToStart', originalRange
      range.select()
  return