// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
import PropTypes from "prop-types"
import _ from "lodash"
import ReorderableListComponent from "react-library/lib/reorderable/ReorderableListComponent"
import LocalizedStringComponent from "./LocalizedStringComponent"
import PropertyEditorComponent, { Property } from "./PropertyEditorComponent"
import SectionEditorComponent from "./SectionEditorComponent"
import NestedListClipboardEnhancement from "./NestedListClipboardEnhancement"
import ActionCancelModalComponent from "react-library/lib/ActionCancelModalComponent"
import { Column, Schema, DataSource, Section, Variable, EnumValue } from "mwater-expressions"
import React, { ReactNode } from "react"
const R = React.createElement

export interface PropertyListComponentProps {
  /** # array of properties */
  properties: (Column | Section)[]

  onChange: (properties: (Column | Section)[]) => void

  /** schema of all data. Needed for idType and expr features */
  schema?: Schema

  /** data source. Needed for expr feature */
  dataSource?: DataSource

  /** Table that properties are of. Not required if table feature is on */
  table?: string

  /** Ids of tables to include when using table feature */
  tableIds?: string[]

  /** Function to generate the ID of the property */
  propertyIdGenerator?: () => string

  /** Variables that may be used in expressions */
  variables?: Variable[]

  // /** List of all property ids to prevent duplicates. Do not set directly! */
  // allPropertyIds?: arrayOf(PropTypes.string.isRequired)

  /* Array of features to be enabled apart from the defaults. Features are:
   * sql: include raw SQL editor. Use {alias} for the table name
   * reverseSql: include reverse SQL editor. Use {value} for the value sql that will be replaced. e.g. {value}::text
   * idField: show id field for properties
   * uniqueCode: allow uniqueCode flag on properties
   * idType: allow id-type fields
   * unitType: allow unit-type fields (does not include unit details, just the type)
   * joinType: allow join-type fields
   * code: show code of properties
   * expr: allow fields with expr set
   * conditionExpr: allow fields to set a condition expression if they are conditionally displayed
   * section: allow adding sections
   * table: each property contains table
   * unique: allow unique flag on properties
   * onDelete: allow undefined, "cascade" or "restrict"
   * dataurlType: allow dataurl type fields
   * fileType: allow file type fields
   * filelistType: allow filelist type fields
   * indexed: allow indexed flag on properties
   * required: allow required flag on properties
   */
  features?: (
    | "sql"
    | "idField"
    | "uniqueCode"
    | "idType"
    | "unitType"
    | "joinType"
    | "code"
    | "expr"
    | "conditionExpr"
    | "section"
    | "table"
    | "unique"
    | "onDelete"
    | "dataurlType"
    | "fileType"
    | "filelistType"
    | "indexed"
    | "reverseSql"
    | "required"
  )[]

  /** Function that adds extra display to property list items */
  createExtraDisplayElem?: (property: Column | Section) => ReactNode

  /** Function that adds extra UI to editing properties */
  createExtraEditElem?: (property: Column | Section, onChange: (property: Column | Section) => void) => ReactNode

  /** supplied by NestedListClipboardEnhancement */
  onCut?: () => void
  /** supplied by NestedListClipboardEnhancement */
  onCopy?: () => void
  /** supplied by NestedListClipboardEnhancement */
  onPaste?: () => void
  /** supplied by NestedListClipboardEnhancement */
  onPasteInto?: () => void

  /** used internally */
  listId?: string
}

class InnerPropertyListComponent extends React.Component<PropertyListComponentProps, { addingItem: Partial<Property | Section> | null }> {
  static contextTypes = { clipboard: PropTypes.object }

  constructor(props: any) {
    super(props)
    this.state = {
      addingItem: null // Property being added
    }
  }

  handleChange = (index: any, property: any) => {
    const value = this.props.properties.slice()
    value[index] = property
    this.props.onChange(value)
  }

  handleDelete = (index: any) => {
    const value = this.props.properties.slice()
    _.pullAt(value, index)
    this.props.onChange(value)
  }

  handleNewProperty = () => {
    const property: Partial<Property> = {
      type: "text"
    }

    if (this.props.propertyIdGenerator) {
      property["id"] = this.props.propertyIdGenerator()
    }

    this.setState({ addingItem: property })
  }

  handleNewSection = () => {
    const section: Partial<Property | Section> = {
      type: "section",
      contents: []
    }

    this.setState({ addingItem: section })
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
          className: "btn btn-sm btn-secondary dropdown-toggle",
          "data-bs-toggle": "dropdown"
        },
        R("i", { className: "fa fa-plus" }),
        " ",
        "Add"
      ),

      R(
        "ul",
        { className: "dropdown-menu", role: "menu" },
        R("li", { key: "property" }, R("a", { className: "dropdown-item", onClick: this.handleNewProperty }, "Property")),
        _.includes(this.props.features || [], "section")
          ? R("li", { key: "section" }, R("a", { className: "dropdown-item", onClick: this.handleNewSection }, "Section"))
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
          // Require id and name
          if (!this.state.addingItem!.id && this.state.addingItem!.type !== "section") {
            return alert("Id required")
          }
          if (!this.state.addingItem!.name) {
            return alert("Name required")
          }

          if (this.state.addingItem) {
            // Prevent duplicates
            if (allPropertyIds.includes(this.state.addingItem.id)) {
              return alert("Duplicate ids not allowed")
            }
            const value = this.props.properties.slice()
            value.push(this.state.addingItem as Property)
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
            property: this.state.addingItem as Property,
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            table: this.props.table,
            tableIds: this.props.tableIds,
            variables: this.props.variables,
            onChange: (updatedProperty: any) => this.setState({ addingItem: updatedProperty }),
            features: this.props.features,
            createExtraEditElem: this.props.createExtraEditElem,
            forbiddenPropertyIds: allPropertyIds
          })
    )
  }

  renderProperty = (
    allPropertyIds: any,
    item: any,
    index: any,
    connectDragSource: any,
    connectDragPreview: any,
    connectDropTarget: any
  ) => {
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
        createExtraEditElem: this.props.createExtraEditElem,
        createExtraDisplayElem: this.props.createExtraDisplayElem,
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
        onReorder: (list: Property[]) => this.props.onChange(list),
        renderItem: this.renderProperty.bind(this, allPropertyIds),
        getItemId: (item: Property) => item.id,
        element: R("div", { className: "pl-container" })
      }),
      this.renderControls(allPropertyIds)
    )
  }
}

class PropertyComponent extends React.Component<{
  property: Property | Section
  onChange: (property: Property | Section) => void
  /** schema of all data. Needed for idType and expr features */
  schema?: Schema
  
  /** data source. Needed for expr feature */
  dataSource?: DataSource
  
  /** Table that properties are of. Not required if table feature is on */
  table?: string
  
  /** Ids of tables to include when using table feature */
  tableIds?: string[]
  
  /** Variables that may be used in expressions */
  variables?: Variable[]
  
  /** Features to be enabled apart from the default features */
  features: string[]
  
  /** Function that adds extra UI to editing properties */
  createExtraEditElem?: (property: Column | Section, onChange: (property: Column | Section) => void) => ReactNode

  /** Function that adds extra display to property list items */
  createExtraDisplayElem?: (property: Column | Section) => ReactNode

  onCut: (listId: string, propertyId: string) => void
  onCopy: (listId: string, propertyId: string) => void
  onPaste: (listId: string, propertyId: string) => void
  onPasteInto: (listId: string, propertyId: string) => void
  onDelete: () => void
  listId: string

  /** List of all property ids to prevent duplicates */
  allPropertyIds: string[]

}, {
  editing: boolean
  editorProperty: Property | Section | null
}> {
  static iconMap = {
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
    dataurl: "fa fa-file",
    file: "fa fa-file",
    filelist: "fa fa-file"
  }

  static contextTypes = { clipboard: PropTypes.object }

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
        { className: "pl-item-control", onClick: () => this.props.onCopy(this.props.listId, this.props.property.id!) },
        "Copy"
      ),
      R(
        "a",
        { className: "pl-item-control", onClick: () => this.props.onCut(this.props.listId, this.props.property.id!) },
        "Cut"
      ),
      this.context.clipboard
        ? R(
            "a",
            {
              className: "pl-item-control",
              onClick: () => this.props.onPaste(this.props.listId, this.props.property.id!)
            },
            "Paste"
          )
        : undefined,

      this.context.clipboard && this.props.property.type === "section"
        ? R(
            "a",
            {
              className: "pl-item-control",
              onClick: () => this.props.onPasteInto(this.props.listId, this.props.property.id!)
            },
            "Paste Into"
          )
        : undefined,

      R("a", { className: "pl-item-control", onClick: () => this.props.onDelete() }, "Delete")
    )
  }

  renderEnumValues = (values: EnumValue[]) => {
    const names = _.map(values, (value) => value.name[value.name._base || "en"])

    return R("span", null, `${names.join(" / ")}`)
  }

  renderTable(table: any) {
    return R(LocalizedStringComponent, { value: this.props.schema!.getTable(table)?.name })
  }

  render() {
    const classNames = ["pl-property"]
    if ((this.props.property as Property).deprecated) {
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
              title: this.state.editorProperty!.type === "section" ? "Edit section" : "Edit property",
              actionLabel: "Save",
              onAction: () => {
                // Require id and name
                if (!this.state.editorProperty!.id && this.state.editorProperty!.type !== "section") {
                  return alert("Id required")
                }
                if (!this.state.editorProperty!.name) {
                  return alert("Name required")
                }
                if (this.state.editorProperty) {
                  // Prevent duplicates
                  if (
                    this.state.editorProperty.id !== this.props.property.id &&
                    this.props.allPropertyIds.includes(this.state.editorProperty.id!)
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
                  property: this.state.editorProperty as Property,
                  schema: this.props.schema,
                  dataSource: this.props.dataSource,
                  table: this.props.table,
                  tableIds: this.props.tableIds,
                  variables: this.props.variables,
                  onChange: (updatedProperty: any) => this.setState({ editorProperty: updatedProperty }),
                  features: this.props.features,
                  createExtraEditElem: this.props.createExtraEditElem,
                  forbiddenPropertyIds: _.without(this.props.allPropertyIds, this.props.property.id)
                })
          )
        : undefined,
      this.renderControls(),
      (this.props.property as Property).deprecated ? R("div", { className: "pl-item-deprecated-overlay" }, "") : undefined,
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
              (this.props.property as Property).required ? R("span", { style: { color: "red" } }, "*") : undefined,
              (this.props.property as Property).expr
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
            (this.props.property as Property).sql
              ? R("div", { className: "pl-item-detail-sql text-info" }, `SQL: ${(this.props.property as Property).sql}`)
              : undefined,
            (this.props.property as Property).reverseSql
              ? R(
                  "div",
                  { className: "pl-item-detail-sql text-info" },
                  `Reverse SQL: ${(this.props.property as Property).reverseSql}`
                )
              : undefined,
            ["enum", "enumset"].includes(this.props.property.type) && (this.props.property as Property).enumValues!.length > 0
              ? R(
                  "div",
                  { className: "pl-item-detail-enum text-muted" },
                  this.renderEnumValues((this.props.property as Property).enumValues!)
                )
              : undefined,
            _.includes(this.props.features, "table") && (this.props.property as Property).table
              ? R("div", { className: "pl-item-detail-table text-muted" }, this.renderTable((this.props.property as Property).table))
              : undefined,
            (this.props.property as Property).roles && this.props.createExtraDisplayElem
              ? this.props.createExtraDisplayElem(this.props.property)
              : undefined
          )
        )
      ),

      this.props.property.type === "section"
        ? R(
            "div",
            { className: "pl-item-section" },
            R(InnerPropertyListComponent, {
              properties: this.props.property.contents || [],
              features: this.props.features,
              schema: this.props.schema,
              dataSource: this.props.dataSource,
              table: this.props.table,
              tableIds: this.props.tableIds,
              variables: this.props.variables,
              createExtraDisplayElem: this.props.createExtraDisplayElem,
              createExtraEditElem: this.props.createExtraEditElem,
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
    )
  }
}

const WrappedPropertyListComponent = NestedListClipboardEnhancement(InnerPropertyListComponent)

export default class PropertyListComponent extends React.Component<PropertyListComponentProps> {
  render() {
    return R(WrappedPropertyListComponent, this.props) as any
  }
}

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
