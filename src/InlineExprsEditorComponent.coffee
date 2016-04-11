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

    # Strip zwsp used to allow editing at end of string
    text = text.replace(/\u200b/g, '')

    console.log "onChange: #{text}"
    @props.onChange(text, exprs)

  createHtml: ->
    # Escape HTML
    html = _.escape(@props.text)

    # Create expr utils
    exprUtils = new ExprUtils(@props.schema)

    # Replace {0}, {1}, etc with an inline div <div class="inline-expr"><!--encoded expression-->SUMMARY</div>
    html = html.replace(/\{(\d+)\}/g, (match, index) =>
      index = parseInt(index)
      expr = @props.exprs[index]
      if expr
        return '<div class="inline-expr-block" contentEditable="false"><!--' + encodeURIComponent(JSON.stringify(expr)) + '-->' + _.escape(exprUtils.summarizeExpr(expr)) + '</div>&#x200b;'
      return ""
      )

    # Keep CR (<br>)
    html = html.replace(/\r?\n/g, "<br>")

    console.log "createHtml: #{html}"
    return html

  render: ->
    React.createElement ContentEditableComponent, html: @createHtml(), onChange: @handleChange

# class TextWithExpressionsHtmlConverter

# Content editable component with cursor restoring
class ContentEditableComponent extends React.Component
  @propTypes:
    html: React.PropTypes.string.isRequired

  handleChange: (ev) => 
    if not @refs.editor
      return 

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

    # Restore caret
    select(@refs.editor, @range)

  render: ->
    H.div 
      contentEditable: true
      ref: "editor"
      style: { padding: "6px 12px", border: "1px solid #ccc", borderRadius: 4 }
      onInput: @handleChange
      onBlur: @handleChange
      dangerouslySetInnerHTML: { __html: @props.html }
