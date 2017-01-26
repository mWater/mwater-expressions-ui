React = require 'react'
R = React.createElement
uuid = require 'uuid'

PropertyListEditorComponent = require './PropertyListEditorComponent'

module.exports = (WrappedComponent) ->
  return class NestedListClipboardEnhancement extends React.Component
    @childContextTypes:
      clipboard: React.PropTypes.object
    
    constructor: (props) ->
      super(props)
      @state = {
        clipboard: null
      }
      
    handleCut: (listId, itemId) =>
      @handleCopy(listId, itemId, true)
      
    findItemById: (listId, itemId) =>
      value = _.cloneDeep @props.properties
      list = _.find value, { id: itemId }
      
      if list # check in the root array first
        return list
      
      found = null  
      find = (listId, itemId, items) ->  
        for property in items
          if property.id == listId
            return _.find property.contents, { id: itemId }
          else
            found = find(listId, itemId, (_.filter property.contents, {type: "section"})) 
            if found 
              return found
            
      # if not root then only iterate through section type properties
      return find(listId, itemId, (_.filter value, {type: "section"}))
    
    handleCopy: (listId, itemId, cut = false) =>
      property = @findItemById(listId, itemId)

      # TODO this mutates the original property!
      # TODO maybe add a number on to end instead of UUIDing for copying?      
      if @props.propertyIdGenerator
        property.id = @props.propertyIdGenerator()
      # TODO I removed uuid as we don't need it for anything right now and I'd rather force specifying id generator
      
      @setState(clipboard: {
        listId: listId
        itemId: itemId
        property: property
        cut: cut
      })
      
    handlePasteInto: (listId, itemId) =>
      if not @state.clipboard
        return
        
      value = _.cloneDeep @props.properties
      didPaste = false
      didCut = false
      
      if @state.clipboard.cut
        cutIndex = _.findIndex value, { id: @state.clipboard.itemId }
        
        if cutIndex > -1
          _.pullAt value, cutIndex
          didCut = true
        else 
          didCut = @cut(@state.clipboard.listId, @state.clipboard.itemId, (_.filter value, {type: "section"}))
          
      pasteIndex = _.findIndex value, { id: itemId } # check in the root array first
      if pasteIndex > -1
        if not value[pasteIndex].contents
          value[pasteIndex].contents = []
        value[pasteIndex].contents.push(@state.clipboard.property)
        didPaste = true
      else
        pasteInto = (listId, itemId, items) =>
          for property in items
            if property.id == listId
              pasteIndex = _.findIndex property.contents, { id: itemId }
              if not property.contents[pasteIndex].contents
                property.contents[pasteIndex].contents = []
              property.contents[pasteIndex].contents.push(@state.clipboard.property)
              didPaste = true
            else 
              didPaste = paste(listId, itemId, (_.filter property.contents, {type: "section"}))
        pasteInto(listId, itemId, (_.filter value, {type: "section"}))
      
      if didPaste
        if @state.clipboard.cut and not didCut
          return
          
        @setState(clipboard: null)
        @props.onChange(value)
        
        
    cut: (listId, itemId, items) =>
      didCut = false
      for property in items
        if property.id == listId
          cutIndex = _.findIndex property.contents, { id: @state.clipboard.itemId }
          _.pullAt property.contents, cutIndex
          didCut = true
        else 
          didCut = @cut(listId, itemId, (_.filter property.contents, {type: "section"}))
      return didCut
          
    paste: (listId, itemId, items) =>
      didPaste = false
      for property in items
        if property.id == listId
          pasteIndex = _.findIndex property.contents, { id: itemId }
          property.contents.splice(pasteIndex, 0, @state.clipboard.property)
          didPaste = true
        else 
          didPaste = @paste(listId, itemId, (_.filter property.contents, {type: "section"}))
      return didPaste
          
    handlePaste: (listId, itemId) =>
      if not @state.clipboard
        return
        
      value = _.cloneDeep @props.properties
      
      didPaste = false
      didCut = false
      
      if @state.clipboard.cut
        cutIndex = _.findIndex value, { id: @state.clipboard.itemId }
        if cutIndex > -1
          _.pullAt value, cutIndex
          didCut = true
        else 
          didCut = @cut(@state.clipboard.listId, @state.clipboard.itemId, (_.filter value, {type: "section"}))
      
      pasteIndex = _.findIndex value, { id: itemId } # check in the root array first
      if pasteIndex > -1
        value.splice(pasteIndex, 0, @state.clipboard.property)
        didPaste = true
      else
        didPaste = @paste(listId, itemId, (_.filter value, {type: "section"}))
      
      if didPaste
        if @state.clipboard.cut and not didCut
          return
          
        @setState(clipboard: null)
        @props.onChange(value)
    
    getChildContext: =>
      return {
        clipboard: @state.clipboard
      }
    
    render: ->
      newProps = 
        onCut: @handleCut
        onCopy: @handleCopy
        onPaste: @handlePaste
        onPasteInto: @handlePasteInto
      R WrappedComponent, _.assign({}, @props, newProps)
