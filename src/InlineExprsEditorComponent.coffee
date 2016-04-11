React = require 'react'
H = React.DOM
ExprComponent = require './ExprComponent'
ExprUtils = require("mwater-expressions").ExprUtils
select = require('selection-range')

# Editor that is a text box with embeddable expressions
module.exports = class InlineExprsEditorComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired   # Schema to use
    text: React.PropTypes.string                # Text with embedded expressions as {0}, {1}, etc.
    exprs: React.PropTypes.array                # Expressions that correspond to {0}, {1}, etc.
    onChange: React.PropTypes.func.isRequired   # Called with (text, exprs)

  constructor: ->
    super

    @state = {
      insertingExpr: null
    }

  handleInsert: =>
    @refs.contentEditable.pasteHTML(@createExprHtml({ type: "field", table: "t1", column: "number" }), false)

  handleChange: (elem) => 
    console.log "handleChange: #{elem.innerHTML}"

    # Walk DOM tree, adding strings and expressions
    text = ""
    exprs = []

    # Keep track of <br> as a div after a br is not a new cr
    wasBr = false

    # Which index of expression is current
    index = 0

    processNode = (node, isFirst) ->
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

        # Append text
        text += node.nodeValue
   
    processNode(elem, true)

    # Strip word joiner used to allow editing at end of string
    text = text.replace(/\u2060/g, '')

    console.log "onChange: #{text}"
    @props.onChange(text, exprs)

  # Create html for an expression
  createExprHtml: (expr) ->
    # Create expr utils
    exprUtils = new ExprUtils(@props.schema)

    # Add as div with a comment field that encodes the content
    return '<div class="inline-expr-block" contentEditable="false"><!--' + encodeURIComponent(JSON.stringify(expr)) + '-->' + _.escape(exprUtils.summarizeExpr(expr)) + '</div>&#x2060;'

  createHtml: ->
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
    html = html.replace(/\r?\n/g, "<br>")

    console.log "createHtml: #{html}"
    return html

  render: ->
    H.div null,
      React.createElement ContentEditableComponent, ref: "contentEditable", html: @createHtml(), onChange: @handleChange
      H.button type: "button", className: "btn btn-link btn-xs", onClick: @handleInsert, 
        "Insert Expression"

# class TextWithExpressionsHtmlConverter

# Content editable component with cursor restoring
class ContentEditableComponent extends React.Component
  @propTypes:
    html: React.PropTypes.string.isRequired

  handleChange: (ev) => 
    if not @refs.editor
      return 

    @props.onChange(@refs.editor)

  pasteHTML: (html, selectPastedContent) ->
    @refs.editor.focus()
    pasteHtmlAtCaret(html, selectPastedContent)

  shouldComponentUpdate: (nextProps) ->
    return not @refs.editor or nextProps.html != @refs.editor.innerHTML
 
  componentWillUpdate: ->
    # Save caret
    @range = select(@refs.editor)
    
  componentDidUpdate: ->
    # Sometimes update fails, so be sure it is updated
    if @refs.editor and @props.html != @refs.editor.innerHTML
      @refs.editor.innerHTML = @props.html

    # Restore caret
    select(@refs.editor, @range)

  render: ->
    H.div 
      contentEditable: true
      spellcheck: "false" 
      ref: "editor"
      style: { padding: "6px 12px", border: "1px solid #ccc", borderRadius: 4 }
      onInput: @handleChange
      onBlur: @handleChange
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