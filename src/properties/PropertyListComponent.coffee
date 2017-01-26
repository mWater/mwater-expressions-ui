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
    schema: React.PropTypes.object # schema of all data. Needed for idType and exprType features
    dataSource: React.PropTypes.object # data source. Needed for exprType feature
    table: React.PropTypes.string.isRequired    # Table that properties are of
    propertyIdGenerator: React.PropTypes.func # Function to generate the ID of the property
    
    # Array of features to be enabled apart from the defaults. Features are:
    # sql: include raw SQL editor
    # idField: show id field for properties
    # uniqueCode: allow uniqueCode flag on properties
    # idType: allow id-type fields
    # joinType: allow join-type fields
    # code: show code of properties
    # exprType: allow expr=type fields
    features: React.PropTypes.array
    
    # function that returns the UI of the roles, called with a single argument, the array containing roles
    createRoleDisplayElem: React.PropTypes.func 
    
    # function that returns the UI of the roles for editing, gets passed two arguments
    # 1. the array containing roles
    # 2. The callback function that should be called when the roles change
    createRoleEditElem: React.PropTypes.func
    
    onCut: React.PropTypes.func # supplied by NestedListClipboardEnhancement
    onCopy: React.PropTypes.func # supplied by NestedListClipboardEnhancement
    onPaste: React.PropTypes.func # supplied by NestedListClipboardEnhancement
    onPasteInto: React.PropTypes.func # supplied by NestedListClipboardEnhancement
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
    
    if @props.propertyIdGenerator
      property["id"] = @props.propertyIdGenerator()

    @setState(addingItem: property)
    
  handleNewSection: () =>
    section = {
      type: "section"
      contents: []
    }
    
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
        onPasteInto: @props.onPasteInto
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
        getItemId: (item) => item.id
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
    onPasteInto: React.PropTypes.func.isRequired
    onDelete: React.PropTypes.func.isRequired
    listId: React.PropTypes.string
  
  @iconMap:
    text: "fa fa-font"
    number: "fa fa-calculator"
    enum: "fa fa-check-circle-o"
    enumset: "fa fa-check-square-o"
    date: "fa fa-calendar-check-o"
    datetime: "fa fa-calendar-check-o"
    image: "fa fa-file-image-o"
    imagelist: "fa fa-file-image-o"
    section: "fa fa-folder"
    geometry: "fa fa-map-marker"
    boolean: "fa fa-toggle-on"
    id: "fa fa-arrow-right"
    join: "fa fa-link"
    
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
      H.a className: "pl-item-control", onClick: (() => @props.onCopy(@props.listId, @props.property.id)), "Copy"
      H.a className: "pl-item-control", onClick: (() => @props.onCut(@props.listId, @props.property.id)), "Cut"
      if @context.clipboard
        H.a className: "pl-item-control", onClick: (() => @props.onPaste(@props.listId, @props.property.id)), "Paste"
      
      if @context.clipboard and @props.property.type == "section"  
        H.a className: "pl-item-control", onClick: (() => @props.onPasteInto(@props.listId, @props.property.id)), "Paste Into"
      
      H.a className: "pl-item-control", onClick: (() => @props.onDelete()), "Delete"
  
  renderEnumValues: (values) =>
    names = _.map values, (value) ->
      value.name[value._base or "en"]
      
    H.span null, "#{names.join(" / ")}"
  
  render: ->
    classNames = ["pl-property"]
    if @props.property.deprecated 
      classNames.push("deprecated")
    H.div className: "#{ classNames.join(" ")} pl-item-type-#{@props.property.type}",
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
      if @props.property.deprecated
          H.div className: "pl-item-deprecated-overlay", ""
      H.div className: "pl-item", onDoubleClick: @handleEdit, 
        H.div className: "pl-item-detail",
          H.span className: "pl-item-detail-indicator",
            H.i className: "#{PropertyComponent.iconMap[@props.property.type]} fa-fw"
          H.div null,
            H.div className: "pl-item-detail-name",
              if _.includes(@props.features, "idField") and @props.property.id
                H.small null, "[#{@props.property.id}] "
              R LocalizedStringComponent, value: @props.property.name
            if @props.property.desc
              H.div className: "pl-item-detail-description",
                R LocalizedStringComponent, value: @props.property.desc
            if @props.property.sql
              H.div className: "pl-item-detail-sql text-muted", @props.property.sql
            if @props.property.type in ["enum", "enumset"] and @props.property.enumValues.length > 0
              H.div className: "pl-item-detail-enum text-muted", @renderEnumValues(@props.property.enumValues)
            if @props.property.roles and @props.createRoleDisplayElem
              @props.createRoleDisplayElem(@props.property.roles)

      if @props.property.type == "section"
        H.div className: "pl-item-section",
          R PropertyListComponent, 
            properties: @props.property.contents or []
            features: @props.features
            schema: @props.schema
            dataSource: @props.dataSource
            table: @props.table
            createRoleEditElem: @props.createRoleEditElem
            createRoleDisplayElem: @props.createRoleDisplayElem
            onCut: @props.onCut
            onCopy: @props.onCopy
            onPaste: @props.onPaste
            onPasteInto: @props.onPasteInto
            listId: @props.property.id
            onChange: (list) => 
              newProperty = _.cloneDeep(@props.property)
              newProperty.contents = list
              @props.onChange(newProperty)
        
module.exports = NestedListClipboardEnhancement(PropertyListComponent)
