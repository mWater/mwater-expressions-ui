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
        
      find = (listId, itemId, items) ->  
        for property in items
          if property.id == listId
            return _.find property.contents, { id: itemId }
          else 
            return find(listId, itemId, (_.filter property.contents, {type: "section"}))
      
      # if not root then only iterate through section type properties
      return find(listId, itemId, (_.filter value, {type: "section"}))
    
    handleCopy: (listId, itemId, cut = false) =>
      
      value = _.cloneDeep @props.properties
      property = @findItemById(listId, itemId)
      
      if _.includes(@props.features, "idField") and @props.propertyIdGenerator
        property.id = @props.propertyIdGenerator()
      else
        property.id = uuid.v4()
      
      @setState(clipboard: {
          listId: listId
          itemId: itemId
          property: property
          cut: cut
        })
        
    handlePaste: (listId, itemId) =>
      if not @state.clipboard
        return
        
      value = _.cloneDeep @props.properties
      pasteIndex = _.findIndex value, { id: itemId } # check in the root array first
      
      if pasteIndex > -1
        value.splice(pasteIndex, 0, @state.clipboard.property)
        
      else
        paste = (listId, itemId, items) =>
          for property in items
            if property.id == listId
              pasteIndex = _.findIndex property.contents, { id: itemId }
              property.contents.splice(pasteIndex, 0, @state.clipboard.property)
            else 
              paste(listId, itemId, (_.filter property.contents, {type: "section"}))
        paste(listId, itemId, (_.filter value, {type: "section"}))
        
      if @state.clipboard.cut
        cutIndex = _.findIndex value, { id: @state.clipboard.itemId }
        
        if cutIndex > -1
          _.pullAt value, cutIndex
        
        else 
          cut = (listId, itemId, items) => 
            for property in items
              if property.id == listId
                cutIndex = _.findIndex property.contents, { id: @state.clipboard.itemId }
                _.pullAt property.contents, cutIndex
              else 
                cut(listId, itemId, (_.filter property.contents, {type: "section"}))
          cut(@state.clipboard.listId, @state.clipboard.itemId, (_.filter value, {type: "section"}))
      
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
      R WrappedComponent, _.assign({}, @props, newProps)
