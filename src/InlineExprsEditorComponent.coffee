_ = require 'lodash'
PropTypes = require('prop-types')
React = require 'react'
R = React.createElement
ExprComponent = require './ExprComponent'
ExprUtils = require("mwater-expressions").ExprUtils
ActionCancelModalComponent = require("react-library/lib/ActionCancelModalComponent")
ContentEditableComponent = require './ContentEditableComponent'

# TODO perhaps use http://wadmiraal.net/lore/2012/06/14/contenteditable-hacks-returning-like-a-pro/

# Editor that is a text box with embeddable expressions
module.exports = class InlineExprsEditorComponent extends React.Component
  @propTypes:
    schema: PropTypes.object.isRequired   # Schema to use
    dataSource: PropTypes.object.isRequired # Data source to use to get values
    table: PropTypes.string.isRequired    # Current table

    text: PropTypes.string                # Text with embedded expressions as {0}, {1}, etc.
    exprs: PropTypes.array                # Expressions that correspond to {0}, {1}, etc.
    onChange: PropTypes.func.isRequired   # Called with (text, exprs)
    multiline: PropTypes.bool             # Allow multiple lines
    rows: PropTypes.number                # Optional number of lines

  @defaultProps:
    exprs: []

  handleInsertClick: => @insertModal.open()

  handleInsert: (expr) =>
    if expr
      @contentEditable.pasteHTML(@createExprHtml(expr))

  handleUpdate: (expr, index) =>
    exprs = @props.exprs.slice()
    exprs[index] = expr
    @props.onChange(@props.text, exprs)

  handleClick: (ev) =>
    # Get index of expression
    index = ev.target.dataset["index"]
    if index and index.match(/^\d+$/)
      index = parseInt(index)
      @updateModal.open(@props.exprs[index], index)

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
          if commentNode
            text += "{" + index + "}" 
            exprs.push(JSON.parse(decodeURIComponent(commentNode.nodeValue)))
            index += 1
          return

        # <div><br><div> is just simple \n
        if node.tagName.toLowerCase() == "div" and node.innerHTML.toLowerCase() == "<br>"
          text += "\n"
          wasBr = false
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
  createExprHtml: (expr, index) ->
    # Create expr utils
    exprUtils = new ExprUtils(@props.schema)

    summary = exprUtils.summarizeExpr(expr) or ""

    # Limit length
    if summary.length > 50
      summary = summary.substr(0, 50) + "..."

    # Add as div with a comment field that encodes the content
    return '<div class="inline-expr-block" contentEditable="false" data-index="' + index + '"><!--' + encodeURIComponent(JSON.stringify(expr)) + '-->' + _.escape(summary) + '</div>&#x2060;'

  createContentEditableHtml: ->
    # Escape HTML
    html = _.escape(@props.text)

    # Replace {0}, {1}, etc with an inline div <div class="inline-expr"><!--encoded expression-->SUMMARY</div>
    html = html.replace(/\{(\d+)\}/g, (match, index) =>
      index = parseInt(index)
      expr = @props.exprs[index]
      if expr
        return @createExprHtml(expr, index)
      return ""
      )

    # Keep CR 
    if @props.multiline
      html = html.replace(/\r?\n/g, "<br>")

    # Special case of trailing br (Chrome behaviour won't render)
    html = html.replace(/<br>$/, "<div><br></div>")
    # html = html.replace(/^<br>/, "<div><br></div>")

    # If empty, put placeholder
    if html.length == 0
      html = '&#x2060;'

    # console.log "createHtml: #{html}"
    return html

  renderInsertModal: ->
    R ExprInsertModalComponent, ref: ((c) => @insertModal = c), schema: @props.schema, dataSource: @props.dataSource, table: @props.table, onInsert: @handleInsert

  renderUpdateModal: ->
    R ExprUpdateModalComponent, ref: ((c) => @updateModal = c), schema: @props.schema, dataSource: @props.dataSource, table: @props.table, onUpdate: @handleUpdate

  render: ->
    R 'div', style: { position: "relative" },
      @renderInsertModal()
      @renderUpdateModal()
      R 'div', style: { paddingRight: 20 },
        R ContentEditableComponent, 
          ref: (c) => @contentEditable = c 
          html: @createContentEditableHtml(), 
          style: { whiteSpace: 'pre-wrap', padding: "6px 12px", border: "1px solid #ccc", borderRadius: 4, minHeight: (if @props.multiline and @props.rows then "#{@props.rows * 2.5}ex") }
          onChange: @handleChange
          onClick: @handleClick
      R 'a', onClick: @handleInsertClick, style: { cursor: "pointer", position: "absolute", right: 5, top: 8, fontStyle: "italic", color: "#337ab7" },
        "f"
        R 'sub', null, "x"

# Modal that displays an expression builder
class ExprInsertModalComponent extends React.Component
  @propTypes:
    schema: PropTypes.object.isRequired   # Schema to use
    dataSource: PropTypes.object.isRequired # Data source to use to get values
    table: PropTypes.string.isRequired    # Current table
    onInsert: PropTypes.func.isRequired   # Called with expr to insert

  constructor: (props) ->
    super(props)

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
        R 'div', style: { paddingBottom: 200 },
          R ExprComponent, 
            schema: @props.schema
            dataSource: @props.dataSource
            table: @props.table
            types: ['text', 'number', 'enum', 'date', 'datetime']
            value: @state.expr
            onChange: (expr) => @setState(expr: expr)
  
# Modal that displays an expression builder
class ExprUpdateModalComponent extends React.Component
  @propTypes:
    schema: PropTypes.object.isRequired   # Schema to use
    dataSource: PropTypes.object.isRequired # Data source to use to get values
    table: PropTypes.string.isRequired    # Current table
    onUpdate: PropTypes.func.isRequired   # Called with expr to update

  constructor: (props) ->
    super(props)

    @state = {
      open: false
      expr: null
      index: null
    }

  open: (expr, index) ->
    @setState(open: true, expr: expr, index: index)

  render: ->
    if not @state.open
      return null

    R ActionCancelModalComponent, 
      size: "large"
      actionLabel: "Update"
      onAction: => 
        # Close first to avoid strange effects when mixed with pojoviews
        @setState(open: false, =>
          @props.onUpdate(@state.expr, @state.index)
        )
      onCancel: => @setState(open: false)
      title: "Update Expression",
        R 'div', style: { paddingBottom: 200 },
          R ExprComponent, 
            schema: @props.schema
            dataSource: @props.dataSource
            table: @props.table
            types: ['text', 'number', 'enum', 'date', 'datetime']
            value: @state.expr
            onChange: (expr) => @setState(expr: expr)
  
