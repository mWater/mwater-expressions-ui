React = require 'react'
H = React.DOM
R = React.createElement
selection = require './saveSelection'

# Content editable component with cursor restoring
module.exports = class ContentEditableComponent extends React.Component
  @propTypes:
    html: React.PropTypes.string.isRequired
    onChange: React.PropTypes.func.isRequired  # Called with element
    style: React.PropTypes.object # Style to add to div
    onClick: React.PropTypes.func  # Set to catch click events
    onFocus: React.PropTypes.func  # Set to catch focus events
    onBlur: React.PropTypes.func  # Set to catch blur events

  handleInput: (ev) => 
    if not @refs.editor
      return 

    @props.onChange(@refs.editor)

  # Save selection for refocusing
  handleBlur: (ev) =>
    @props.onBlur?(ev)

    if not @refs.editor
      return 

    @range = selection.save(@refs.editor)
    @props.onChange(@refs.editor)

  handleFocus: (ev) =>
    @props.onFocus?(ev)

  focus: ->
    @refs.editor.focus()

  pasteHTML: (html, selectPastedContent) ->
    @refs.editor.focus()

    # Restore caret
    if @range
      selection.restore(@refs.editor, @range)

    pasteHtmlAtCaret(html, selectPastedContent)
    @props.onChange(@refs.editor)

  shouldComponentUpdate: (nextProps) ->
    # Update if prop html has changed, or if inner html has changed
    changed = not @refs.editor or nextProps.html != @props.html or @refs.editor.innerHTML != @lastInnerHTML
    if changed
      console.log nextProps.html
      console.log @props.html 
      console.log @refs.editor.innerHTML 
      console.log @lastInnerHTML
    return changed
 
  componentWillUpdate: ->
    # Save caret
    @range = selection.save(@refs.editor)

    console.log "willUpdate"
    console.log @range
    
  componentDidMount: ->
    if @refs.editor
      # Set inner html
      @refs.editor.innerHTML = @props.html
      @lastInnerHTML = @refs.editor.innerHTML

  componentDidUpdate: ->
    if @refs.editor
      # Set inner html
      @refs.editor.innerHTML = @props.html
      @lastInnerHTML = @refs.editor.innerHTML

    console.log "didUpdate"
    console.log @range

    # Restore caret if still focused
    if document.activeElement == @refs.editor and @range
      selection.restore(@refs.editor, @range)

  render: ->
    H.div 
      contentEditable: true
      spellCheck: false
      ref: "editor"
      onClick: @props.onClick
      style: @props.style
      onInput: @handleInput
      onFocus: @handleFocus
      onBlur: @handleBlur


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