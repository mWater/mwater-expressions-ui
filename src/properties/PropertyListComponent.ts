// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
import PropTypes from "prop-types"
import React from "react"
const R = React.createElement
import _ from "lodash"
import uuid from "uuid"
import ReorderableListComponent from "react-library/lib/reorderable/ReorderableListComponent"
import LocalizedStringComponent from "../LocalizedStringComponent"
import PropertyEditorComponent from "./PropertyEditorComponent"
import SectionEditorComponent from "./SectionEditorComponent"
import NestedListClipboardEnhancement from "./NestedListClipboardEnhancement"
import ActionCancelModalComponent from "react-library/lib/ActionCancelModalComponent"

// List/add/edit properties
class PropertyListComponent extends React.Component {
  static initClass() {
    this.propTypes = {
      properties: PropTypes.array.isRequired, // array of properties
      onChange: PropTypes.func.isRequired,
      schema: PropTypes.object, // schema of all data. Needed for idType and expr features
      dataSource: PropTypes.object, // data source. Needed for expr feature
      table: PropTypes.string, // Table that properties are of. Not required if table feature is on
      tableIds: PropTypes.arrayOf(PropTypes.string.isRequired), // Ids of tables to include when using table feature
      propertyIdGenerator: PropTypes.func, // Function to generate the ID of the property
      allPropertyIds: PropTypes.arrayOf(PropTypes.string.isRequired), // List of all property ids to prevent duplicates. Do not set directly!
      variables: PropTypes.array, // Variables that may be used in expressions

      // Array of features to be enabled apart from the defaults. Features are:
      // sql: include raw SQL editor
      // reverseSql: include reverse SQL editor. Use {value} for the value sql that will be replaced. e.g. {value}::text
      // idField: show id field for properties
      // uniqueCode: allow uniqueCode flag on properties
      // idType: allow id-type fields
      // joinType: allow join-type fields
      // code: show code of properties
      // expr: allow fields with expr set
      // conditionExpr: allow fields to set a condition expression if they are conditionally displayed
      // section: allow adding sections
      // table: each property contains table
      // unique: allow unique flag on properties
      // onDelete: allow undefined, "cascade" or "set_null"
      // indexed: allow indexed flag on properties
      // dataurlType: allow dataurl type
      // required: allow required flag on properties
      features: PropTypes.array,

      // function that returns the UI of the roles, called with a single argument, the array containing roles
      createRoleDisplayElem: PropTypes.func,

      // function that returns the UI of the roles for editing, gets passed two arguments
      // 1. the array containing roles
      // 2. The callback function that should be called when the roles change
      createRoleEditElem: PropTypes.func,

      onCut: PropTypes.func, // supplied by NestedListClipboardEnhancement
      onCopy: PropTypes.func, // supplied by NestedListClipboardEnhancement
      onPaste: PropTypes.func, // supplied by NestedListClipboardEnhancement
      onPasteInto: PropTypes.func, // supplied by NestedListClipboardEnhancement
      listId: PropTypes.string // used internally
    }

    this.contextTypes = { clipboard: PropTypes.object }
  }

  constructor(props: any) {
    super(props)
    this.state = {
      addingItem: null // Property being added
    }
  }

  handleChange = (index: any, property: any) => {
    const value = this.props.properties.slice()
    value[index] = property
    return this.props.onChange(value)
  }

  handleDelete = (index: any) => {
    const value = this.props.properties.slice()
    _.pullAt(value, index)
    return this.props.onChange(value)
  }

  handleNewProperty = () => {
    const property = {
      type: "text"
    }

    if (this.props.propertyIdGenerator) {
      property["id"] = this.props.propertyIdGenerator()
    }

    return this.setState({ addingItem: property })
  }

  handleNewSection = () => {
    const section = {
      type: "section",
      contents: []
    }

    return this.setState({ addingItem: section })
  }

  renderControls(allPropertyIds: any) {
    return R(
      "div",
      { className: "btn-group pl-controls" },
      this.renderAddingModal(allPropertyIds),

      R(
        "button",
        {
          key: "default_add",
          type: "button",
          className: "btn btn-xs btn-default dropdown-toggle",
          "data-toggle": "dropdown"
        },
        R("i", { className: "fa fa-plus" }),
        " ",
        "Add",
        " ",
        R("span", { className: "caret" })
      ),

      R(
        "ul",
        { className: "dropdown-menu text-left", role: "menu" },
        R("li", { key: "property" }, R("a", { onClick: this.handleNewProperty }, "Property")),
        _.includes(this.props.features, "section")
          ? R("li", { key: "section" }, R("a", { onClick: this.handleNewSection }, "Section"))
          : undefined
      )
    )
  }

  renderAddingModal(allPropertyIds: any) {
    if (!this.state.addingItem) {
      return null
    }

    return R(
      ActionCancelModalComponent,
      {
        size: "large",
        title: this.state.addingItem.type === "section" ? "Add a section" : "Add a property",
        actionLabel: "Save",
        onAction: () => {
          if (this.state.addingItem) {
            // Prevent duplicates
            if (allPropertyIds.includes(this.state.addingItem.id)) {
              return alert("Duplicate ids not allowed")
            }
            const value = this.props.properties.slice()
            value.push(this.state.addingItem)
            this.props.onChange(value)
            return this.setState({ addingItem: null })
          }
        },
        onCancel: () => this.setState({ addingItem: null })
      },
      this.state.addingItem.type === "section"
        ? R(SectionEditorComponent, {
            property: this.state.addingItem,
            onChange: (updatedProperty: any) => this.setState({ addingItem: updatedProperty }),
            features: this.props.features
          })
        : R(PropertyEditorComponent, {
            property: this.state.addingItem,
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            table: this.props.table,
            tableIds: this.props.tableIds,
            variables: this.props.variables,
            onChange: (updatedProperty: any) => this.setState({ addingItem: updatedProperty }),
            features: this.props.features,
            createRoleEditElem: this.props.createRoleEditElem,
            forbiddenPropertyIds: allPropertyIds
          })
    );
  }

  renderProperty = (allPropertyIds: any, item: any, index: any, connectDragSource: any, connectDragPreview: any, connectDropTarget: any) => {
    const elem = R(
      "div",
      { key: index },
      R(PropertyComponent, {
        property: item,
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        table: this.props.table,
        tableIds: this.props.tableIds,
        variables: this.props.variables,
        features: this.props.features,
        onChange: this.handleChange.bind(null, index),
        onDelete: this.handleDelete.bind(null, index),
        onCut: this.props.onCut,
        onCopy: this.props.onCopy,
        onPaste: this.props.onPaste,
        onPasteInto: this.props.onPasteInto,
        createRoleEditElem: this.props.createRoleEditElem,
        createRoleDisplayElem: this.props.createRoleDisplayElem,
        listId: this.props.listId,
        allPropertyIds
      })
    )
    return connectDragPreview(connectDropTarget(connectDragSource(elem)))
  }

  render() {
    // Compute list of all property ids, recursively
    const allPropertyIds = _.pluck(flattenProperties(this.props.properties), "id")

    return R(
      "div",
      { className: "pl-editor-container" },
      R(ReorderableListComponent, {
        items: this.props.properties,
        onReorder: (list) => this.props.onChange(list),
        renderItem: this.renderProperty.bind(this, allPropertyIds),
        getItemId: (item) => item.id,
        element: R("div", { className: "pl-container" })
      }),
      this.renderControls(allPropertyIds)
    )
  }
}
PropertyListComponent.initClass()

class PropertyComponent extends React.Component {
  static initClass() {
    this.propTypes = {
      property: PropTypes.object.isRequired, // The property
      onChange: PropTypes.func.isRequired,
      schema: PropTypes.object, // schema of all data. Needed for idType and expr features
      dataSource: PropTypes.object, // data source. Needed for expr feature
      table: PropTypes.string, // Table that properties are of. Not required if table feature is on
      tableIds: PropTypes.arrayOf(PropTypes.string.isRequired), // Ids of tables to include when using table feature
      variables: PropTypes.array, // Variables that may be used in expressions
      features: PropTypes.array, // Features to be enabled apart from the default features
      createRoleDisplayElem: PropTypes.func,
      createRoleEditElem: PropTypes.func,
      onCut: PropTypes.func.isRequired,
      onCopy: PropTypes.func.isRequired,
      onPaste: PropTypes.func.isRequired,
      onPasteInto: PropTypes.func.isRequired,
      onDelete: PropTypes.func.isRequired,
      listId: PropTypes.string,
      allPropertyIds: PropTypes.arrayOf(PropTypes.string.isRequired) // List of all property ids to prevent duplicates
    }

    this.iconMap = {
      text: "fa fa-font",
      number: "fa fa-calculator",
      enum: "fa fa-check-circle-o",
      enumset: "fa fa-check-square-o",
      date: "fa fa-calendar-check-o",
      datetime: "fa fa-calendar-check-o",
      image: "fa fa-file-image-o",
      imagelist: "fa fa-file-image-o",
      section: "fa fa-folder",
      geometry: "fa fa-map-marker",
      boolean: "fa fa-toggle-on",
      id: "fa fa-arrow-right",
      join: "fa fa-link",
      dataurl: "fa fa-file"
    }

    this.contextTypes = { clipboard: PropTypes.object }
  }

  constructor(props: any) {
    super(props)
    this.state = { editing: false, editorProperty: null }
  }

  handleEdit = () => {
    return this.setState({ editing: true, editorProperty: this.props.property })
  }

  renderControls() {
    return R(
      "div",
      { className: "pl-item-controls" },
      R("a", { className: "pl-item-control", onClick: this.handleEdit }, "Edit"),
      R(
        "a",
        { className: "pl-item-control", onClick: () => this.props.onCopy(this.props.listId, this.props.property.id) },
        "Copy"
      ),
      R(
        "a",
        { className: "pl-item-control", onClick: () => this.props.onCut(this.props.listId, this.props.property.id) },
        "Cut"
      ),
      this.context.clipboard
        ? R(
            "a",
            {
              className: "pl-item-control",
              onClick: () => this.props.onPaste(this.props.listId, this.props.property.id)
            },
            "Paste"
          )
        : undefined,

      this.context.clipboard && this.props.property.type === "section"
        ? R(
            "a",
            {
              className: "pl-item-control",
              onClick: () => this.props.onPasteInto(this.props.listId, this.props.property.id)
            },
            "Paste Into"
          )
        : undefined,

      R("a", { className: "pl-item-control", onClick: () => this.props.onDelete() }, "Delete")
    )
  }

  renderEnumValues = (values: any) => {
    const names = _.map(values, (value) => value.name[value._base || "en"])

    return R("span", null, `${names.join(" / ")}`)
  }

  renderTable(table: any) {
    return R(LocalizedStringComponent, { value: this.props.schema.getTable(table)?.name })
  }

  render() {
    const classNames = ["pl-property"]
    if (this.props.property.deprecated) {
      classNames.push("deprecated")
    }
    return R(
      "div",
      { className: `${classNames.join(" ")} pl-item-type-${this.props.property.type}` },
      this.state.editing
        ? R(
            ActionCancelModalComponent,
            {
              size: "large",
              title: this.state.editorProperty.type === "section" ? "Edit section" : "Edit property",
              actionLabel: "Save",
              onAction: () => {
                if (this.state.editorProperty) {
                  // Prevent duplicates
                  if (
                    this.state.editorProperty.id !== this.props.property.id &&
                    this.props.allPropertyIds.includes(this.state.editorProperty.id)
                  ) {
                    return alert("Duplicate ids not allowed")
                  }
                  this.props.onChange(this.state.editorProperty)
                }
                return this.setState({ editing: false, editorProperty: null })
              },

              onCancel: () => this.setState({ editing: false, editorProperty: null })
            },
            this.props.property.type === "section"
              ? R(SectionEditorComponent, {
                  property: this.state.editorProperty,
                  onChange: (updatedProperty: any) => this.setState({ editorProperty: updatedProperty }),
                  features: this.props.features
                })
              : R(PropertyEditorComponent, {
                  property: this.state.editorProperty,
                  schema: this.props.schema,
                  dataSource: this.props.dataSource,
                  table: this.props.table,
                  tableIds: this.props.tableIds,
                  variables: this.props.variables,
                  onChange: (updatedProperty: any) => this.setState({ editorProperty: updatedProperty }),
                  features: this.props.features,
                  createRoleEditElem: this.props.createRoleEditElem,
                  forbiddenPropertyIds: _.without(this.props.allPropertyIds, this.props.property.id)
                })
          )
        : undefined,
      this.renderControls(),
      this.props.property.deprecated ? R("div", { className: "pl-item-deprecated-overlay" }, "") : undefined,
      R(
        "div",
        { className: "pl-item", onDoubleClick: this.handleEdit },
        R(
          "div",
          { className: "pl-item-detail" },
          R(
            "span",
            { className: "pl-item-detail-indicator" },
            R("i", { className: `${PropertyComponent.iconMap[this.props.property.type]} fa-fw` })
          ),
          R(
            "div",
            null,
            R(
              "div",
              { className: "pl-item-detail-name" },
              _.includes(this.props.features, "idField") && this.props.property.id
                ? R("small", null, `[${this.props.property.id}] `)
                : undefined,
              R(LocalizedStringComponent, { value: this.props.property.name }),
              this.props.property.required ? R("span", { style: { color: "red" } }, "*") : undefined,
              this.props.property.expr
                ? R("span", { className: "text-muted" }, " ", R("span", { className: "fa fa-calculator" }))
                : undefined
            ),
            this.props.property.desc
              ? R(
                  "div",
                  { className: "pl-item-detail-description" },
                  R(LocalizedStringComponent, { value: this.props.property.desc })
                )
              : undefined,
            this.props.property.sql
              ? R("div", { className: "pl-item-detail-sql text-info" }, `SQL: ${this.props.property.sql}`)
              : undefined,
            this.props.property.reverseSql
              ? R(
                  "div",
                  { className: "pl-item-detail-sql text-info" },
                  `Reverse SQL: ${this.props.property.reverseSql}`
                )
              : undefined,
            ["enum", "enumset"].includes(this.props.property.type) && this.props.property.enumValues.length > 0
              ? R(
                  "div",
                  { className: "pl-item-detail-enum text-muted" },
                  this.renderEnumValues(this.props.property.enumValues)
                )
              : undefined,
            _.includes(this.props.features, "table") && this.props.property.table
              ? R("div", { className: "pl-item-detail-table text-muted" }, this.renderTable(this.props.property.table))
              : undefined,
            this.props.property.roles && this.props.createRoleDisplayElem
              ? this.props.createRoleDisplayElem(this.props.property.roles)
              : undefined
          )
        )
      ),

      this.props.property.type === "section"
        ? R(
            "div",
            { className: "pl-item-section" },
            R(PropertyListComponent, {
              properties: this.props.property.contents || [],
              features: this.props.features,
              schema: this.props.schema,
              dataSource: this.props.dataSource,
              table: this.props.table,
              tableIds: this.props.tableIds,
              variables: this.props.variables,
              createRoleEditElem: this.props.createRoleEditElem,
              createRoleDisplayElem: this.props.createRoleDisplayElem,
              onCut: this.props.onCut,
              onCopy: this.props.onCopy,
              onPaste: this.props.onPaste,
              onPasteInto: this.props.onPasteInto,
              listId: this.props.property.id,
              onChange: (list: any) => {
                const newProperty = _.cloneDeep(this.props.property)
                newProperty.contents = list
                return this.props.onChange(newProperty)
              },
              allPropertyIds: this.props.allPropertyIds
            })
          )
        : undefined
    );
  }
}
PropertyComponent.initClass()

export default NestedListClipboardEnhancement(PropertyListComponent)

// Flatten a nested list of properties
function flattenProperties(properties: any) {
  let props: any = []

  for (let prop of properties) {
    if (prop.contents) {
      props = props.concat(flattenProperties(prop.contents))
    } else {
      props.push(prop)
    }
  }

  return props
}
