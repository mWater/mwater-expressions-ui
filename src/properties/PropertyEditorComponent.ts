// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let PropertyEditorComponent
import PropTypes from "prop-types"
import React from "react"
const R = React.createElement
import _ from "lodash"
import ui from "react-library/lib/bootstrap"
import LocalizedStringEditorComp from "../LocalizedStringEditorComp"
import ExprComponent from "../ExprComponent"
import { ExprUtils } from "mwater-expressions"
import IdFieldComponent from "./IdFieldComponent"
import { JoinEditorComponent } from "./JoinEditorComponent"

// Edit a single property
export default PropertyEditorComponent = (function () {
  PropertyEditorComponent = class PropertyEditorComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        property: PropTypes.object.isRequired, // The property being edited
        onChange: PropTypes.func.isRequired, // Function called when anything is changed in the editor
        features: PropTypes.array, // Features to be enabled apart from the default features
        schema: PropTypes.object, // schema of all data
        dataSource: PropTypes.object, // data source
        table: PropTypes.string, // Table that properties are of. Not required if table feature is on
        tableIds: PropTypes.arrayOf(PropTypes.string.isRequired), // Ids of tables to include when using table feature
        createRoleEditElem: PropTypes.func,
        forbiddenPropertyIds: PropTypes.arrayOf(PropTypes.string.isRequired), // Ids of properties that are not allowed as would be duplicates
        variables: PropTypes.array // Variables that may be used in expressions
      }

      this.defaultProps = { features: [] }
    }

    render() {
      return R(
        "div",
        null,
        _.includes(this.props.features, "table")
          ? R(
              ui.FormGroup,
              { label: "Table" },
              R(ui.Select, {
                nullLabel: "Select...",
                value: this.props.property.table,
                onChange: (table) => this.props.onChange(_.extend({}, this.props.property, { table })),
                options: _.map(this.props.tableIds, (tableId) => {
                  const table = this.props.schema.getTable(tableId)
                  return { value: table.id, label: ExprUtils.localizeString(table.name) }
                })
              })
            )
          : undefined,

        _.includes(this.props.features, "idField")
          ? [
              R(IdFieldComponent, {
                value: this.props.property.id,
                onChange: (value) => this.props.onChange(_.extend({}, this.props.property, { id: value }))
              }),
              this.props.forbiddenPropertyIds && this.props.forbiddenPropertyIds.includes(this.props.property.id)
                ? R("div", { className: "alert alert-danger" }, "Duplicate IDs not allowed")
                : undefined
            ]
          : undefined,

        _.includes(this.props.features, "code")
          ? R(
              ui.FormGroup,
              { label: "Code" },
              R("input", {
                type: "text",
                className: "form-control",
                value: this.props.property.code,
                onChange: (ev) => this.props.onChange(_.extend({}, this.props.property, { code: ev.target.value }))
              })
            )
          : undefined,
        R(
          ui.FormGroup,
          { label: "Name" },
          R(LocalizedStringEditorComp, {
            value: this.props.property.name,
            onChange: (value) => this.props.onChange(_.extend({}, this.props.property, { name: value }))
          })
        ),
        R(
          ui.FormGroup,
          { label: "Description" },
          R(LocalizedStringEditorComp, {
            value: this.props.property.desc,
            onChange: (value) => this.props.onChange(_.extend({}, this.props.property, { desc: value }))
          })
        ),
        R(
          ui.FormGroup,
          { label: "Type" },
          R(
            "select",
            {
              className: "form-control",
              value: this.props.property.type,
              onChange: (ev) => this.props.onChange(_.extend({}, this.props.property, { type: ev.target.value }))
            },
            R("option", { key: "", value: "" }, ""),
            R("option", { key: "text", value: "text" }, "Text"),
            R("option", { key: "number", value: "number" }, "Number"),
            R("option", { key: "boolean", value: "boolean" }, "Boolean"),
            R("option", { key: "geometry", value: "geometry" }, "Geometry"),
            R("option", { key: "enum", value: "enum" }, "Enum"),
            R("option", { key: "enumset", value: "enumset" }, "Enum Set"),
            R("option", { key: "date", value: "date" }, "Date"),
            R("option", { key: "datetime", value: "datetime" }, "Datetime"),
            R("option", { key: "text[]", value: "text[]" }, "Text Array"),
            R("option", { key: "image", value: "image" }, "Image"),
            R("option", { key: "imagelist", value: "imagelist" }, "Imagelist"),
            R("option", { key: "json", value: "json" }, "JSON"),
            _.includes(this.props.features, "idType") && this.props.schema
              ? R("option", { key: "id", value: "id" }, "Reference")
              : undefined,
            _.includes(this.props.features, "idType") && this.props.schema
              ? R("option", { key: "id[]", value: "id[]" }, "Reference List")
              : undefined,
            _.includes(this.props.features, "joinType")
              ? R("option", { key: "join", value: "join" }, "Join")
              : undefined,
            _.includes(this.props.features, "dataurlType")
              ? R("option", { key: "dataurl", value: "dataurl" }, "Data URL (inline file storage)")
              : undefined
          )
        ),
        ["enum", "enumset"].includes(this.props.property.type)
          ? R(
              ui.FormGroup,
              { label: "Values" },
              R(EnumValuesEditorComponent, {
                value: this.props.property.enumValues,
                onChange: (value) => this.props.onChange(_.extend({}, this.props.property, { enumValues: value }))
              })
            )
          : undefined,

        _.includes(this.props.features, "expr") &&
          this.props.property.type &&
          (this.props.property.table || this.props.table)
          ? R(
              ui.FormGroup,
              {
                label: "Expression",
                hint: !this.props.property.table ? "Leave blank unless this property is an expression" : undefined
              },
              R(ExprComponent, {
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                table: this.props.property.table || this.props.table,
                value: this.props.property.expr,
                types: [this.props.property.type],
                enumValues: this.props.property.enumValues,
                idTable: this.props.property.idTable,
                variables: this.props.variables,
                aggrStatuses: ["individual", "aggregate", "literal"],
                onChange: (expr) => this.props.onChange(_.extend({}, this.props.property, { expr }))
              })
            )
          : undefined,

        _.includes(this.props.features, "conditionExpr") && (this.props.property.table || this.props.table)
          ? R(
              ui.FormGroup,
              { label: "Condition", hint: "Set this if field should be conditionally displayed" },
              R(ExprComponent, {
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                table: this.props.property.table || this.props.table,
                value: this.props.property.conditionExpr,
                types: ["boolean"],
                variables: this.props.variables,
                onChange: (conditionExpr) => this.props.onChange(_.extend({}, this.props.property, { conditionExpr }))
              })
            )
          : undefined,

        this.props.property.type === "join"
          ? R(
              ui.FormGroup,
              { label: "Join" },
              R(JoinEditorComponent, {
                join: this.props.property.join,
                onChange: (join) => this.props.onChange(_.extend({}, this.props.property, { join })),
                schema: this.props.schema,
                fromTableId: this.props.property.table || this.props.table
              })
            )
          : undefined,

        ["id", "id[]"].includes(this.props.property.type)
          ? R(
              ui.FormGroup,
              { label: "ID Table" },
              R(TableSelectComponent, {
                value: this.props.property.idTable,
                schema: this.props.schema,
                onChange: (table) => this.props.onChange(_.extend({}, this.props.property, { idTable: table }))
              })
            )
          : undefined,

        _.includes(this.props.features, "required")
          ? R(
              ui.Checkbox,
              {
                value: this.props.property.required,
                onChange: (value) => this.props.onChange(_.extend({}, this.props.property, { required: value }))
              },
              "Required"
            )
          : undefined,

        R(
          ui.Checkbox,
          {
            value: this.props.property.deprecated,
            onChange: (deprecated) => this.props.onChange(_.extend({}, this.props.property, { deprecated }))
          },
          "Deprecated"
        ),

        _.includes(this.props.features, "uniqueCode") && this.props.property.type === "text"
          ? R(
              ui.Checkbox,
              {
                value: this.props.property.uniqueCode,
                onChange: (value) => this.props.onChange(_.extend({}, this.props.property, { uniqueCode: value }))
              },
              "Unique Code"
            )
          : undefined,

        _.includes(this.props.features, "unique") && ["text", "id"].includes(this.props.property.type)
          ? R(
              ui.Checkbox,
              {
                value: this.props.property.unique,
                onChange: (value) => this.props.onChange(_.extend({}, this.props.property, { unique: value }))
              },
              "Unique Value"
            )
          : undefined,

        _.includes(this.props.features, "indexed") &&
          ["text", "id", "number", "enum"].includes(this.props.property.type)
          ? R(
              ui.Checkbox,
              {
                value: this.props.property.indexed,
                onChange: (value) => this.props.onChange(_.extend({}, this.props.property, { indexed: value }))
              },
              "Indexed (improves query speed, but slows updates)"
            )
          : undefined,

        _.includes(this.props.features, "onDelete") && ["id"].includes(this.props.property.type)
          ? R(
              ui.FormGroup,
              { label: "On Delete" },
              R(ui.Select, {
                value: this.props.property.onDelete || null,
                nullLabel: "No Action",
                onChange: (value) =>
                  this.props.onChange(_.extend({}, this.props.property, { onDelete: value || undefined })),
                options: [
                  { label: "Cascade", value: "cascade" },
                  { label: "Set Null", value: "set_null" }
                ]
              })
            )
          : undefined,

        _.includes(this.props.features, "sql")
          ? R(
              ui.FormGroup,
              { label: "SQL", hint: "Use {alias} for the table alias" },
              R("input", {
                type: "text",
                className: "form-control",
                value: this.props.property.sql,
                onChange: (ev) => this.props.onChange(_.extend({}, this.props.property, { sql: ev.target.value }))
              })
            )
          : undefined,

        _.includes(this.props.features, "reverseSql")
          ? R(
              ui.FormGroup,
              { label: "Reverse SQL", hint: "Use {value} for the value to convert" },
              R("input", {
                type: "text",
                className: "form-control",
                value: this.props.property.reverseSql,
                onChange: (ev) =>
                  this.props.onChange(_.extend({}, this.props.property, { reverseSql: ev.target.value }))
              })
            )
          : undefined,

        this.props.createRoleEditElem
          ? R(
              ui.FormGroup,
              { label: "Roles" },
              this.props.createRoleEditElem(this.props.property.roles || [], (roles) =>
                this.props.onChange(_.extend({}, this.props.property, { roles }))
              )
            )
          : undefined
      )
    }
  }
  PropertyEditorComponent.initClass()
  return PropertyEditorComponent
})()

// Reusable table select Component
class TableSelectComponent extends React.Component {
  static initClass() {
    this.propTypes = {
      value: PropTypes.string, // The selected table
      schema: PropTypes.object.isRequired, // schema of all data
      onChange: PropTypes.func.isRequired
    }
    // Called with new value
  }

  render() {
    const options = _.sortBy(
      _.map(this.props.schema.tables, (table) => ({
        value: table.id,
        label: table.name[table.name._base || "en"] + " - " + table.id
      })),
      "value"
    )
    return R(ui.Select, {
      value: this.props.value,
      onChange: this.props.onChange,
      nullLabel: "Select table",
      options
    })
  }
}
TableSelectComponent.initClass()

// Edits a list of enum values
class EnumValuesEditorComponent extends React.Component {
  static initClass() {
    this.propTypes = {
      value: PropTypes.array, // Array of enum values to edit
      onChange: PropTypes.func.isRequired
    }
    // Called with new value
  }

  handleChange = (i, item) => {
    const value = (this.props.value || []).slice()
    value[i] = item
    return this.props.onChange(value)
  }

  handleAdd = () => {
    const value = (this.props.value || []).slice()
    value.push({ id: "", name: {} })
    return this.props.onChange(value)
  }

  handleRemove = (i) => {
    const value = (this.props.value || []).slice()
    value.splice(i, 1)
    return this.props.onChange(value)
  }

  handleMoveUp = (i) => {
    const value = (this.props.value || []).slice()
    const temp = value[i - 1]
    value[i - 1] = value[i]
    value[i] = temp
    return this.props.onChange(value)
  }

  handleMoveDown = (i) => {
    const value = (this.props.value || []).slice()
    const temp = value[i + 1]
    value[i + 1] = value[i]
    value[i] = temp
    return this.props.onChange(value)
  }

  render() {
    const items = this.props.value || []
    return R(
      "div",
      null,
      _.map(items, (value, i) => {
        return R(EnumValueEditorComponent, {
          key: i,
          value,
          onChange: this.handleChange.bind(null, i),
          onRemove: this.handleRemove.bind(null, i),
          onMoveUp: i > 0 ? this.handleMoveUp.bind(null, i) : undefined,
          onMoveDown: i < items.length - 1 ? this.handleMoveDown.bind(null, i) : undefined
        })
      }),

      R("button", { type: "button", className: "btn btn-link", onClick: this.handleAdd }, "+ Add Value")
    )
  }
}
EnumValuesEditorComponent.initClass()

// Edits an enum value (id, name)
class EnumValueEditorComponent extends React.Component {
  static initClass() {
    this.propTypes = {
      value: PropTypes.object,
      onChange: PropTypes.func.isRequired, // Called with new value
      onRemove: PropTypes.func,
      onMoveUp: PropTypes.func,
      onMoveDown: PropTypes.func
    }
  }

  render() {
    return R(
      "div",
      { className: "panel panel-default" },
      R(
        "div",
        { className: "panel-body" },
        R(
          "div",
          { className: "row" },
          R(
            "div",
            { className: "col-md-6" },
            R(IdFieldComponent, {
              value: this.props.value.id,
              onChange: (value) => this.props.onChange(_.extend({}, this.props.value, { id: value }))
            })
          ),

          R(
            "div",
            { className: "col-md-6" },
            R(
              ui.FormGroup,
              { label: "Code" },
              R("input", {
                type: "text",
                className: "form-control",
                placeholder: "Code",
                style: { width: "10em" },
                value: this.props.value.code,
                onChange: (ev) => this.props.onChange(_.extend({}, this.props.value, { code: ev.target.value }))
              })
            )
          )
        ),
        R(
          "div",
          { className: "row" },
          R(
            "div",
            { className: "col-md-12" },
            R(
              ui.FormGroup,
              { label: "Name" },
              R(LocalizedStringEditorComp, {
                value: this.props.value.name,
                onChange: (value) => this.props.onChange(_.extend({}, this.props.value, { name: value }))
              })
            )
          )
        ),
        R(
          "div",
          { className: "row" },
          R(
            "div",
            { className: "col-md-12" },
            R(
              ui.FormGroup,
              { label: "Description" },
              R(LocalizedStringEditorComp, {
                value: this.props.value.desc,
                onChange: (value) => this.props.onChange(_.extend({}, this.props.value, { desc: value }))
              })
            )
          )
        ),
        R(
          "div",
          { className: "row", style: { float: "right" } },
          this.props.onMoveUp
            ? R("button", { className: "btn btn-link btn-xs", onClick: this.props.onMoveUp }, "Move Up")
            : undefined,
          this.props.onMoveDown
            ? R("button", { className: "btn btn-link btn-xs", onClick: this.props.onMoveDown }, "Move Down")
            : undefined,
          this.props.onRemove
            ? R("button", { className: "btn btn-link btn-xs", onClick: this.props.onRemove }, "Remove")
            : undefined
        )
      )
    )
  }
}
EnumValueEditorComponent.initClass()
