React = require 'react'
R = React.createElement
H = React.DOM
_ = require 'lodash'
uuid = require 'uuid'

ReorderableListComponent = require("react-library/lib/reorderable/ReorderableListComponent")
LocalizedStringComponent = require '../LocalizedStringComponent'
PropertyListEditorComponent = require './PropertyListEditorComponent'
SectionEditorComponent = require './SectionEditorComponent'
NestedListClipboardEnhancement = require './NestedListClipboardEnhancement'
ActionCancelModalComponent = require('react-library/lib/ActionCancelModalComponent')

# List/add/edit properties
class PropertyListComponent extends React.Component
  @propTypes:
    properties: React.PropTypes.array.isRequired # array of properties
    onChange: React.PropTypes.func.isRequired 
    schema: React.PropTypes.object.isRequired # schema of all data
    dataSource: React.PropTypes.object.isRequired # data source
    table: React.PropTypes.string.isRequired    # Table that properties are of
    propertyIdGenerator: React.PropTypes.func # Function to generate the ID of the property
    
    # Array of features to be enabled apart from the defaults
    # see PropertyListEditorComponent.features for available features
    features: React.PropTypes.array
    
    # function that returns the UI of the roles, called with a single argument, the array containing roles
    createRoleDisplayElem: React.PropTypes.func 
    
    # function that returns the UI of the roles for editing, gets passed two arguments
    # 1. the array containing roles
    # 2. The callback function that should be called when the roles chang
    createRoleEditElem: React.PropTypes.func
    
    onCut: React.PropTypes.func # supplied by NestedListClipboardEnhancement
    onCopy: React.PropTypes.func # supplied by NestedListClipboardEnhancement
    onPaste: React.PropTypes.func # supplied by NestedListClipboardEnhancement
    listId: React.PropTypes.string # used internally
    
  @contextTypes:
    clipboard: React.PropTypes.object
    
  constructor: (props) ->
    super(props)
    @state = {
      addingItem: null  # Property being added
    }
    
  handleChange: (index, property) =>
    value = @props.properties.slice()
    value[index] = property
    @props.onChange(value)
    
  handleDelete: (index) =>
    value = @props.properties.slice()
    _.pullAt value, index
    @props.onChange(value)
    
  handleNewProperty: () =>
    property = {
      type: "text"
    }
    
    if _.includes @props.features, PropertyListEditorComponent.features.idField and @props.propertyIdGenerator
      property["_id"] = @props.propertyIdGenerator()
    else
      property["_id"] = uuid.v4()
    @setState(addingItem: property)
    
  handleNewSection: () =>
    section = {
      type: "section"
    }
    
    if _.includes @props.features, PropertyListEditorComponent.features.idField and @props.propertyIdGenerator
      section["_id"] = @props.propertyIdGenerator()
    else
      section["_id"] = uuid.v4()
    
    @setState(addingItem: section)
    
  renderControls: ->
    H.div className: "btn-group pl-controls",
      @renderAddingModal()

      H.button key: "default_add", type: "button", className: "btn btn-xs btn-default dropdown-toggle", "data-toggle": "dropdown", 
        H.span className: "glyphicon glyphicon-plus"
        " "          
        "Add"
        " "
        H.span className: "caret"

      H.ul className: "dropdown-menu text-left", role: "menu",
        H.li(key: "property", H.a(onClick: @handleNewProperty, "Property"))
        H.li(key: "section", H.a(onClick: @handleNewSection, "Section"))
    
  renderAddingModal:  ->
    if not @state.addingItem
      return null
    
    R ActionCancelModalComponent, { 
      size: "large"
      title: if @state.addingItem.type == "section" then "Add a section" else "Add a property"
      actionLabel: "Save"
      onAction: () => 
        if @state.addingItem
          value = @props.properties.slice()
          value.push(@state.addingItem)
          @props.onChange(value)
          @setState(addingItem: null)
      onCancel: () => @setState(addingItem: null)
      },
        if @state.addingItem.type == "section"
          R SectionEditorComponent, 
            property: @state.addingItem
            onChange: (updatedProperty) => @setState(addingItem: updatedProperty)
            features: @props.features
          # H.pre null, JSON.stringify(@state.addingItem, null, 2)
        else
          R PropertyListEditorComponent,
          property: @state.addingItem
          schema: @props.schema
          dataSource: @props.dataSource
          table: @props.table
          onChange: (updatedProperty) => @setState(addingItem: updatedProperty)
          features: @props.features
          createRoleEditElem: @props.createRoleEditElem
    
  renderProperty: (item, index, connectDragSource, connectDragPreview, connectDropTarget) =>
    elem = H.div key: index,
      R PropertyComponent, 
        property: item
        schema: @props.schema
        dataSource: @props.dataSource
        table: @props.table
        features: @props.features
        onChange: @handleChange.bind(null, index)
        onDelete: @handleDelete.bind(null, index)
        onCut: @props.onCut
        onCopy: @props.onCopy
        onPaste: @props.onPaste
        createRoleEditElem: @props.createRoleEditElem
        createRoleDisplayElem: @props.createRoleDisplayElem
        listId: @props.listId
    return connectDragPreview(connectDropTarget(connectDragSource(elem)))
    
  render: ->
    H.div className: 'pl-editor-container',
      R ReorderableListComponent,
        items: @props.properties
        onReorder: (list) => @props.onChange(list)
        renderItem: @renderProperty
        getItemId: (item) => item._id
        element: H.div className: 'pl-container'
      @renderControls()

class PropertyComponent extends React.Component
  @propTypes:
    property: React.PropTypes.object.isRequired # The property
    onChange: React.PropTypes.func.isRequired
    features: React.PropTypes.array # Features to be enabled apart from the default features
    createRoleDisplayElem: React.PropTypes.func
    createRoleEditElem: React.PropTypes.func
    onCut: React.PropTypes.func.isRequired
    onCopy: React.PropTypes.func.isRequired
    onPaste: React.PropTypes.func.isRequired
    onDelete: React.PropTypes.func.isRequired
    listId: React.PropTypes.string
  
  @iconMap:
    text: "glyphicon-property-type-text"
    number: "glyphicon-property-type-number"
    enum: "glyphicon-menu-hamburger"
    
  @contextTypes:
    clipboard: React.PropTypes.object
  
  constructor: (props) ->
    super
    @state = { editing: false , editorProperty: null}
  
  handleEdit: =>
    @setState(editing: true, editorProperty: @props.property)
  
  renderControls: ->
    H.div className: "pl-item-controls",
      H.a className: "pl-item-control", onClick: @handleEdit, "Edit"
      H.a className: "pl-item-control", onClick: (() => @props.onCopy(@props.listId, @props.property._id)), "Copy"
      H.a className: "pl-item-control", onClick: (() => @props.onCut(@props.listId, @props.property._id)), "Cut"
      if @context.clipboard
        H.a className: "pl-item-control", onClick: (() => @props.onPaste(@props.listId, @props.property._id)), "Paste"
      H.a className: "pl-item-control", onClick: (() => @props.onDelete()), "Delete"
  
  render:->
    H.div className: "pl-property",
      if @state.editing
        R ActionCancelModalComponent, { 
          size: "large"
          title: if @state.editorProperty.type == "section" then "Edit section" else "Edit property"
          actionLabel: "Save"
          onAction: () =>
            if @state.editorProperty
              @props.onChange(@state.editorProperty)
            @setState(editing: false, editorProperty: null)
              
          onCancel: () => @setState(editing: false, editorProperty: null)
          },
            if @props.property.type == "section"
              R SectionEditorComponent, 
                property: @state.editorProperty
                onChange: (updatedProperty) => @setState(editorProperty: updatedProperty)
                features: @props.features
            else
              R PropertyListEditorComponent,
                property: @state.editorProperty
                schema: @props.schema
                dataSource: @props.dataSource
                table: @props.table
                onChange: (updatedProperty) => @setState(editorProperty: updatedProperty)
                features: @props.features
                createRoleEditElem: @props.createRoleEditElem
      @renderControls()  
      H.div className: "pl-item", 
        H.div className: "pl-item-detail",
          H.div className: "indicator",
            H.span className: "glyphicon #{PropertyComponent.iconMap[@props.property.type] or "glyphicon-property-type-number"} pull-left", ""
          H.div className: "name",
            R LocalizedStringComponent, value: @props.property.name, className: ""
            # if @props.createRoleDisplayElem and @props.property._roles
            #   H.div className: "roles", @props.createRoleDisplayElem(@props.property._roles)
        if @props.property.type == "section"
          H.div className: "pl-item-section",
            R PropertyListComponent, 
              properties: @props.property.contents
              features: @props.features
              schema: @props.schema
              dataSource: @props.dataSource
              table: @props.table
              createRoleEditElem: @props.createRoleEditElem
              createRoleDisplayElem: @props.createRoleDisplayElem
              onCut: @props.onCut
              onCopy: @props.onCopy
              onPaste: @props.onPaste
              listId: @props.property._id
              onChange: (list) => 
                # list has been modified
                # update the list and call onChange
                newProperty = _.cloneDeep(@props.property)
                newProperty.contents = list
                @props.onChange(newProperty)
        
module.exports = NestedListClipboardEnhancement(PropertyListComponent)
