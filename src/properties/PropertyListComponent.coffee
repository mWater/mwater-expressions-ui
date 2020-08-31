PropTypes = require('prop-types')
React = require 'react'
R = React.createElement
_ = require 'lodash'
uuid = require 'uuid'

ReorderableListComponent = require("react-library/lib/reorderable/ReorderableListComponent")
LocalizedStringComponent = require '../LocalizedStringComponent'
PropertyEditorComponent = require './PropertyEditorComponent'
SectionEditorComponent = require './SectionEditorComponent'
NestedListClipboardEnhancement = require './NestedListClipboardEnhancement'
ActionCancelModalComponent = require('react-library/lib/ActionCancelModalComponent')

# List/add/edit properties
class PropertyListComponent extends React.Component
  @propTypes:
    properties: PropTypes.array.isRequired # array of properties
    onChange: PropTypes.func.isRequired 
    schema: PropTypes.object # schema of all data. Needed for idType and expr features
    dataSource: PropTypes.object # data source. Needed for expr feature
    table: PropTypes.string    # Table that properties are of. Not required if table feature is on
    tableIds: PropTypes.arrayOf(PropTypes.string.isRequired)   # Ids of tables to include when using table feature
    propertyIdGenerator: PropTypes.func # Function to generate the ID of the property
    allPropertyIds: PropTypes.arrayOf(PropTypes.string.isRequired)  # List of all property ids to prevent duplicates. Do not set directly!
    
    # Array of features to be enabled apart from the defaults. Features are:
    # sql: include raw SQL editor
    # idField: show id field for properties
    # uniqueCode: allow uniqueCode flag on properties
    # idType: allow id-type fields
    # joinType: allow join-type fields
    # code: show code of properties
    # expr: allow fields with expr set
    # conditionExpr: allow fields to set a condition expression if they are conditionally displayed
    # section: allow adding sections
    # table: each property contains table
    # unique: allow unique flag on properties
    # onDelete: allow undefined, "cascade" or "set_null"
    # indexed: allow indexed flag on properties
    # dataurlType: allow dataurl type
    features: PropTypes.array
    
    # function that returns the UI of the roles, called with a single argument, the array containing roles
    createRoleDisplayElem: PropTypes.func 
    
    # function that returns the UI of the roles for editing, gets passed two arguments
    # 1. the array containing roles
    # 2. The callback function that should be called when the roles change
    createRoleEditElem: PropTypes.func
    
    onCut: PropTypes.func # supplied by NestedListClipboardEnhancement
    onCopy: PropTypes.func # supplied by NestedListClipboardEnhancement
    onPaste: PropTypes.func # supplied by NestedListClipboardEnhancement
    onPasteInto: PropTypes.func # supplied by NestedListClipboardEnhancement
    listId: PropTypes.string # used internally
    
  @contextTypes:
    clipboard: PropTypes.object
  
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
    
  renderControls: (allPropertyIds) ->
    R 'div', className: "btn-group pl-controls",
      @renderAddingModal(allPropertyIds)

      R 'button', key: "default_add", type: "button", className: "btn btn-xs btn-default dropdown-toggle", "data-toggle": "dropdown", 
        R 'span', className: "glyphicon glyphicon-plus"
        " "          
        "Add"
        " "
        R 'span', className: "caret"

      R 'ul', className: "dropdown-menu text-left", role: "menu",
        R('li', key: "property", R('a', onClick: @handleNewProperty, "Property"))
        if _.includes(@props.features, "section")
          R('li', key: "section", R('a', onClick: @handleNewSection, "Section"))
    
  renderAddingModal: (allPropertyIds) ->
    if not @state.addingItem
      return null
    
    R ActionCancelModalComponent, { 
      size: "large"
      title: if @state.addingItem.type == "section" then "Add a section" else "Add a property"
      actionLabel: "Save"
      onAction: () => 
        if @state.addingItem
          # Prevent duplicates
          if @state.addingItem.id in allPropertyIds
            return alert("Duplicate ids not allowed")
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
          R PropertyEditorComponent,
            property: @state.addingItem
            schema: @props.schema
            dataSource: @props.dataSource
            table: @props.table
            tableIds: @props.tableIds
            onChange: (updatedProperty) => @setState(addingItem: updatedProperty)
            features: @props.features
            createRoleEditElem: @props.createRoleEditElem
            forbiddenPropertyIds: allPropertyIds
    
  renderProperty: (allPropertyIds, item, index, connectDragSource, connectDragPreview, connectDropTarget) =>
    elem = R 'div', key: index,
      R PropertyComponent, 
        property: item
        schema: @props.schema
        dataSource: @props.dataSource
        table: @props.table
        tableIds: @props.tableIds
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
        allPropertyIds: allPropertyIds
    return connectDragPreview(connectDropTarget(connectDragSource(elem)))
    
  render: ->
    # Compute list of all property ids, recursively
    allPropertyIds = _.pluck(flattenProperties(@props.properties), "id")

    R 'div', className: 'pl-editor-container',
      R ReorderableListComponent,
        items: @props.properties
        onReorder: (list) => @props.onChange(list)
        renderItem: @renderProperty.bind(this, allPropertyIds)
        getItemId: (item) => item.id
        element: R 'div', className: 'pl-container'
      @renderControls(allPropertyIds)

class PropertyComponent extends React.Component
  @propTypes:
    property: PropTypes.object.isRequired # The property
    onChange: PropTypes.func.isRequired
    schema: PropTypes.object # schema of all data. Needed for idType and expr features
    dataSource: PropTypes.object # data source. Needed for expr feature
    table: PropTypes.string    # Table that properties are of. Not required if table feature is on
    tableIds: PropTypes.arrayOf(PropTypes.string.isRequired)   # Ids of tables to include when using table feature
    features: PropTypes.array # Features to be enabled apart from the default features
    createRoleDisplayElem: PropTypes.func
    createRoleEditElem: PropTypes.func
    onCut: PropTypes.func.isRequired
    onCopy: PropTypes.func.isRequired
    onPaste: PropTypes.func.isRequired
    onPasteInto: PropTypes.func.isRequired
    onDelete: PropTypes.func.isRequired
    listId: PropTypes.string
    allPropertyIds: PropTypes.arrayOf(PropTypes.string.isRequired)  # List of all property ids to prevent duplicates
  
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
    dataurl: "fa fa-file"
    
  @contextTypes:
    clipboard: PropTypes.object
  
  constructor: (props) ->
    super(props)
    @state = { editing: false , editorProperty: null}
  
  handleEdit: =>
    @setState(editing: true, editorProperty: @props.property)
  
  renderControls: ->
    R 'div', className: "pl-item-controls",
      R 'a', className: "pl-item-control", onClick: @handleEdit, "Edit"
      R 'a', className: "pl-item-control", onClick: (() => @props.onCopy(@props.listId, @props.property.id)), "Copy"
      R 'a', className: "pl-item-control", onClick: (() => @props.onCut(@props.listId, @props.property.id)), "Cut"
      if @context.clipboard
        R 'a', className: "pl-item-control", onClick: (() => @props.onPaste(@props.listId, @props.property.id)), "Paste"
      
      if @context.clipboard and @props.property.type == "section"  
        R 'a', className: "pl-item-control", onClick: (() => @props.onPasteInto(@props.listId, @props.property.id)), "Paste Into"
      
      R 'a', className: "pl-item-control", onClick: (() => @props.onDelete()), "Delete"
  
  renderEnumValues: (values) =>
    names = _.map values, (value) ->
      value.name[value._base or "en"]
      
    R 'span', null, "#{names.join(" / ")}"

  renderTable: (table) ->
    return R LocalizedStringComponent, value: @props.schema.getTable(table)?.name
  
  render: ->
    classNames = ["pl-property"]
    if @props.property.deprecated 
      classNames.push("deprecated")
    R 'div', className: "#{ classNames.join(" ")} pl-item-type-#{@props.property.type}",
      if @state.editing
        R ActionCancelModalComponent, { 
          size: "large"
          title: if @state.editorProperty.type == "section" then "Edit section" else "Edit property"
          actionLabel: "Save"
          onAction: () =>
            if @state.editorProperty
              # Prevent duplicates
              if @state.editorProperty.id != @props.property.id and @state.editorProperty.id in @props.allPropertyIds
                return alert("Duplicate ids not allowed")
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
              R PropertyEditorComponent,
                property: @state.editorProperty
                schema: @props.schema
                dataSource: @props.dataSource
                table: @props.table
                tableIds: @props.tableIds
                onChange: (updatedProperty) => @setState(editorProperty: updatedProperty)
                features: @props.features
                createRoleEditElem: @props.createRoleEditElem
                forbiddenPropertyIds: _.without(@props.allPropertyIds, @props.property.id)
      @renderControls()  
      if @props.property.deprecated
          R 'div', className: "pl-item-deprecated-overlay", ""
      R 'div', className: "pl-item", onDoubleClick: @handleEdit, 
        R 'div', className: "pl-item-detail",
          R 'span', className: "pl-item-detail-indicator",
            R 'i', className: "#{PropertyComponent.iconMap[@props.property.type]} fa-fw"
          R 'div', null,
            R 'div', className: "pl-item-detail-name",
              if _.includes(@props.features, "idField") and @props.property.id
                R 'small', null, "[#{@props.property.id}] "
              R LocalizedStringComponent, value: @props.property.name
              if @props.property.expr
                R 'span', className: "text-muted",
                  " "
                  R('span', className: "fa fa-calculator")
            if @props.property.desc
              R 'div', className: "pl-item-detail-description",
                R LocalizedStringComponent, value: @props.property.desc
            if @props.property.sql
              R 'div', className: "pl-item-detail-sql text-muted", @props.property.sql
            if @props.property.type in ["enum", "enumset"] and @props.property.enumValues.length > 0
              R 'div', className: "pl-item-detail-enum text-muted", @renderEnumValues(@props.property.enumValues)
            if _.includes(@props.features, "table") and @props.property.table
              R 'div', className: "pl-item-detail-table text-muted", 
                @renderTable(@props.property.table)
            if @props.property.roles and @props.createRoleDisplayElem
              @props.createRoleDisplayElem(@props.property.roles)

      if @props.property.type == "section"
        R 'div', className: "pl-item-section",
          R PropertyListComponent, 
            properties: @props.property.contents or []
            features: @props.features
            schema: @props.schema
            dataSource: @props.dataSource
            table: @props.table
            tableIds: @props.tableIds
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
            allPropertyIds: @props.allPropertyIds
        
module.exports = NestedListClipboardEnhancement(PropertyListComponent)

# Flatten a nested list of properties
flattenProperties = (properties) ->
  props = []

  for prop in properties
    if prop.contents
      props = props.concat(flattenProperties(prop.contents))
    else
      props.push(prop)

  return props
