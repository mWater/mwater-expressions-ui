PropTypes = require('prop-types')
React = require 'react'
R = React.createElement
selection = require './saveSelection'

# Content editable component with cursor restoring
module.exports = class ContentEditableComponent extends React.Component
  @propTypes:
    html: PropTypes.string.isRequired
    onChange: PropTypes.func.isRequired  # Called with element
    style: PropTypes.object # Style to add to div
    onClick: PropTypes.func  # Set to catch click events
    onFocus: PropTypes.func  # Set to catch focus events
    onBlur: PropTypes.func  # Set to catch blur events

  handleInput: (ev) => 
    if not @editor
      return 

    @props.onChange(@editor)

  handleBlur: (ev) =>
    @props.onBlur?(ev)

    # Cancel timer
    if @selSaver
      clearTimeout(@selSaver)
      @selSaver = null

    if not @editor
      return 

    @props.onChange(@editor)

  handleFocus: (ev) =>
    @props.onFocus?(ev)

    # Start selection saver (blur is not reliable in Firefox)
    saveRange = =>
      @range = selection.save(@editor)
      @selSaver = setTimeout(saveRange, 200)

    if not @selSaver
      @selSaver = setTimeout(saveRange, 200)

  focus: ->
    @editor.focus()

  pasteHTML: (html) ->
    @editor.focus()

    # Restore caret
    if @range
      selection.restore(@editor, @range)

    pasteHtmlAtCaret(html)

    @props.onChange(@editor)

  getSelectedHTML: ->
    html = ''
    sel = window.getSelection()
    if sel.rangeCount
      container = document.createElement("div")
      for i in [0...sel.rangeCount]
        container.appendChild(sel.getRangeAt(i).cloneContents())
    html = container.innerHTML
    return html

  shouldComponentUpdate: (nextProps) ->
    # Update if prop html has changed, or if inner html has changed
    changed = not @editor or nextProps.html != @props.html or @editor.innerHTML != @lastInnerHTML
    # if changed
    #   console.log nextProps.html
    #   console.log @props.html 
    #   console.log @editor.innerHTML 
    #   console.log @lastInnerHTML
    return changed
 
  componentWillUpdate: ->
    # Save caret
    @range = selection.save(@editor)
    
  componentDidMount: ->
    if @editor
      # Set inner html
      @editor.innerHTML = @props.html
      @lastInnerHTML = @editor.innerHTML

  componentDidUpdate: ->
    if @editor
      # Set inner html
      @editor.innerHTML = @props.html
      @lastInnerHTML = @editor.innerHTML

    # Restore caret if still focused
    if document.activeElement == @editor and @range
      selection.restore(@editor, @range)

  componentWillUnmount: ->
    # Cancel timer
    if @selSaver
      clearTimeout @selSaver
      @selSaver = null

  render: ->
    R 'div', 
      contentEditable: true
      spellCheck: true
      ref: (c) => @editor = c
      onClick: @props.onClick
      style: @props.style
      onInput: @handleInput
      onFocus: @handleFocus
      onBlur: @handleBlur


# http://stackoverflow.com/questions/6690752/insert-html-at-caret-in-a-contenteditable-div
# TODO selectPastedContent doesn't work
pasteHtmlAtCaret = (html) ->
  range = undefined
  sel = window.getSelection()

  if sel.getRangeAt and sel.rangeCount
    range = sel.getRangeAt(0)
    range.deleteContents()

    # Create fragment to insert  
    el = document.createElement('div')
    el.innerHTML = html
    frag = document.createDocumentFragment()
    node = undefined
    lastNode = undefined
    while node = el.firstChild
      lastNode = frag.appendChild(node)
    firstNode = frag.firstChild

    range = range.cloneRange()
    range.insertNode(frag)
    range.collapse(true)
    sel.removeAllRanges()
    sel.addRange(range)

    # if selectPastedContent
    #       range.setStartBefore firstNode
    #     else
    #       range.collapse true