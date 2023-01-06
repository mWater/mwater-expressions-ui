"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const lodash_1 = __importDefault(require("lodash"));
const ui = __importStar(require("react-library/lib/bootstrap"));
const LocalizedStringEditorComp_1 = __importDefault(require("./LocalizedStringEditorComp"));
const ExprComponent_1 = __importDefault(require("../ExprComponent"));
const mwater_expressions_1 = require("mwater-expressions");
const IdFieldComponent_1 = __importDefault(require("./IdFieldComponent"));
const JoinEditorComponent_1 = require("./JoinEditorComponent");
// Edit a single property
class PropertyEditorComponent extends react_1.default.Component {
    render() {
        var _a, _b;
        const features = this.props.features || [];
        return R("div", null, lodash_1.default.includes(features, "table")
            ? R(ui.FormGroup, { label: "Table" }, R(ui.Select, {
                nullLabel: "Select...",
                value: this.props.property.table,
                onChange: (table) => this.props.onChange(lodash_1.default.extend({}, this.props.property, { table })),
                options: lodash_1.default.map(this.props.tableIds, (tableId) => {
                    const table = this.props.schema.getTable(tableId);
                    return { value: table.id, label: mwater_expressions_1.ExprUtils.localizeString(table.name) };
                })
            }))
            : undefined, lodash_1.default.includes(features, "idField")
            ? [
                R(IdFieldComponent_1.default, {
                    value: this.props.property.id,
                    onChange: (value) => this.props.onChange(lodash_1.default.extend({}, this.props.property, { id: value }))
                }),
                this.props.forbiddenPropertyIds && this.props.forbiddenPropertyIds.includes(this.props.property.id)
                    ? R("div", { className: "alert alert-danger" }, "Duplicate IDs not allowed")
                    : undefined
            ]
            : undefined, lodash_1.default.includes(features, "code")
            ? R(ui.FormGroup, { label: "Code" }, R("input", {
                type: "text",
                className: "form-control",
                value: this.props.property.code,
                onChange: (ev) => this.props.onChange(lodash_1.default.extend({}, this.props.property, { code: ev.target.value }))
            }))
            : undefined, R(ui.FormGroup, { label: "Name" }, R(LocalizedStringEditorComp_1.default, {
            value: this.props.property.name,
            onChange: (value) => this.props.onChange(lodash_1.default.extend({}, this.props.property, { name: value }))
        })), R(ui.FormGroup, { label: "Description" }, R(LocalizedStringEditorComp_1.default, {
            value: this.props.property.desc,
            onChange: (value) => this.props.onChange(lodash_1.default.extend({}, this.props.property, { desc: value }))
        })), R(ui.FormGroup, { label: "Type" }, R("select", {
            className: "form-select",
            value: this.props.property.type,
            onChange: (ev) => this.props.onChange(lodash_1.default.extend({}, this.props.property, { type: ev.target.value }))
        }, R("option", { key: "", value: "" }, ""), R("option", { key: "text", value: "text" }, "Text"), R("option", { key: "number", value: "number" }, "Number"), R("option", { key: "boolean", value: "boolean" }, "Boolean"), R("option", { key: "geometry", value: "geometry" }, "Geometry"), R("option", { key: "enum", value: "enum" }, "Enum"), R("option", { key: "enumset", value: "enumset" }, "Enum Set"), R("option", { key: "date", value: "date" }, "Date"), R("option", { key: "datetime", value: "datetime" }, "Datetime"), R("option", { key: "text[]", value: "text[]" }, "Text Array"), R("option", { key: "image", value: "image" }, "Image"), R("option", { key: "imagelist", value: "imagelist" }, "Imagelist"), R("option", { key: "json", value: "json" }, "JSON"), lodash_1.default.includes(features, "idType") && this.props.schema
            ? R("option", { key: "id", value: "id" }, "Reference")
            : undefined, lodash_1.default.includes(features, "idType") && this.props.schema
            ? R("option", { key: "id[]", value: "id[]" }, "Reference List")
            : undefined, lodash_1.default.includes(features, "joinType") ? R("option", { key: "join", value: "join" }, "Join") : undefined, lodash_1.default.includes(features, "dataurlType")
            ? R("option", { key: "dataurl", value: "dataurl" }, "Data URL (inline file storage)")
            : undefined, lodash_1.default.includes(features, "fileType")
            ? R("option", { key: "file", value: "file" }, "File")
            : undefined, lodash_1.default.includes(features, "filelistType")
            ? R("option", { key: "filelist", value: "filelist" }, "File list")
            : undefined)), ["enum", "enumset"].includes(this.props.property.type)
            ? R(ui.FormGroup, { label: "Values" }, R(EnumValuesEditorComponent, {
                value: this.props.property.enumValues || [],
                onChange: (value) => this.props.onChange(lodash_1.default.extend({}, this.props.property, { enumValues: value }))
            }))
            : undefined, lodash_1.default.includes(features, "expr") &&
            this.props.property.type &&
            (this.props.property.table || this.props.table)
            ? R(ui.FormGroup, {
                label: "Expression",
                hint: !this.props.property.table ? "Leave blank unless this property is an expression" : undefined
            }, R(ExprComponent_1.default, {
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                table: this.props.property.table || this.props.table,
                value: (_a = this.props.property.expr) !== null && _a !== void 0 ? _a : null,
                types: [this.props.property.type],
                enumValues: this.props.property.enumValues,
                idTable: this.props.property.idTable,
                variables: this.props.variables,
                aggrStatuses: ["individual", "aggregate", "literal"],
                onChange: (expr) => this.props.onChange(lodash_1.default.extend({}, this.props.property, { expr }))
            }))
            : undefined, lodash_1.default.includes(features, "conditionExpr") && (this.props.property.table || this.props.table)
            ? R(ui.FormGroup, { label: "Condition", hint: "Set this if field should be conditionally displayed" }, R(ExprComponent_1.default, {
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                table: this.props.property.table || this.props.table,
                value: (_b = this.props.property.conditionExpr) !== null && _b !== void 0 ? _b : null,
                types: ["boolean"],
                variables: this.props.variables,
                onChange: (conditionExpr) => this.props.onChange(lodash_1.default.extend({}, this.props.property, { conditionExpr }))
            }))
            : undefined, this.props.property.type === "join" && (this.props.property.table || this.props.table)
            ? R(ui.FormGroup, { label: "Join" }, R(JoinEditorComponent_1.JoinEditorComponent, {
                join: this.props.property.join,
                onChange: (join) => this.props.onChange(lodash_1.default.extend({}, this.props.property, { join })),
                schema: this.props.schema,
                fromTableId: this.props.property.table || this.props.table
            }))
            : undefined, ["id", "id[]"].includes(this.props.property.type)
            ? R(ui.FormGroup, { label: "ID Table" }, R(TableSelectComponent, {
                value: this.props.property.idTable,
                schema: this.props.schema,
                onChange: (table) => this.props.onChange(lodash_1.default.extend({}, this.props.property, { idTable: table }))
            }))
            : undefined, lodash_1.default.includes(features, "required")
            ? R(ui.Checkbox, {
                value: this.props.property.required,
                onChange: (value) => this.props.onChange(lodash_1.default.extend({}, this.props.property, { required: value }))
            }, "Required")
            : undefined, R(ui.Checkbox, {
            value: this.props.property.deprecated,
            onChange: (deprecated) => this.props.onChange(lodash_1.default.extend({}, this.props.property, { deprecated }))
        }, "Deprecated"), lodash_1.default.includes(features, "uniqueCode") && this.props.property.type === "text"
            ? R(ui.Checkbox, {
                value: this.props.property.uniqueCode,
                onChange: (value) => this.props.onChange(lodash_1.default.extend({}, this.props.property, { uniqueCode: value }))
            }, "Unique Code")
            : undefined, lodash_1.default.includes(features, "unique") && ["text", "id"].includes(this.props.property.type)
            ? R(ui.Checkbox, {
                value: this.props.property.unique,
                onChange: (value) => this.props.onChange(lodash_1.default.extend({}, this.props.property, { unique: value }))
            }, "Unique Value")
            : undefined, lodash_1.default.includes(features, "indexed") && ["text", "id", "number", "enum"].includes(this.props.property.type)
            ? R(ui.Checkbox, {
                value: this.props.property.indexed,
                onChange: (value) => this.props.onChange(lodash_1.default.extend({}, this.props.property, { indexed: value }))
            }, "Indexed (improves query speed, but slows updates)")
            : undefined, lodash_1.default.includes(features, "onDelete") && ["id"].includes(this.props.property.type)
            ? R(ui.FormGroup, { label: "On Delete" }, R(ui.Select, {
                value: this.props.property.onDelete || null,
                nullLabel: "No Action",
                onChange: (value) => this.props.onChange(lodash_1.default.extend({}, this.props.property, { onDelete: value || undefined })),
                options: [
                    { label: "Cascade", value: "cascade" },
                    { label: "Restrict", value: "restrict" }
                ]
            }))
            : undefined, lodash_1.default.includes(features, "sql")
            ? R(ui.FormGroup, { label: "SQL", hint: "Use {alias} for the table alias" }, R("input", {
                type: "text",
                className: "form-control",
                value: this.props.property.sql,
                onChange: (ev) => this.props.onChange(lodash_1.default.extend({}, this.props.property, { sql: ev.target.value }))
            }))
            : undefined, lodash_1.default.includes(features, "reverseSql")
            ? R(ui.FormGroup, { label: "Reverse SQL", hint: "Use {value} for the value to convert" }, R("input", {
                type: "text",
                className: "form-control",
                value: this.props.property.reverseSql,
                onChange: (ev) => this.props.onChange(lodash_1.default.extend({}, this.props.property, { reverseSql: ev.target.value }))
            }))
            : undefined, this.props.createRoleEditElem
            ? R(ui.FormGroup, { label: "Roles" }, this.props.createRoleEditElem(this.props.property.roles || [], (roles) => this.props.onChange(lodash_1.default.extend({}, this.props.property, { roles }))))
            : undefined);
    }
}
exports.default = PropertyEditorComponent;
PropertyEditorComponent.defaultProps = { features: [] };
// Reusable table select Component
class TableSelectComponent extends react_1.default.Component {
    render() {
        const options = lodash_1.default.sortBy(lodash_1.default.map(this.props.schema.tables, (table) => ({
            value: table.id,
            label: table.name[table.name._base || "en"] + " - " + table.id
        })), "value");
        return R(ui.Select, {
            value: this.props.value,
            onChange: this.props.onChange,
            nullLabel: "Select table",
            options
        });
    }
}
// Edits a list of enum values
class EnumValuesEditorComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleChange = (i, item) => {
            const value = (this.props.value || []).slice();
            value[i] = item;
            return this.props.onChange(value);
        };
        this.handleAdd = () => {
            const value = (this.props.value || []).slice();
            value.push({ id: "", name: { _base: "en", en: "" } });
            return this.props.onChange(value);
        };
        this.handleRemove = (i) => {
            const value = (this.props.value || []).slice();
            value.splice(i, 1);
            return this.props.onChange(value);
        };
        this.handleMoveUp = (i) => {
            const value = (this.props.value || []).slice();
            const temp = value[i - 1];
            value[i - 1] = value[i];
            value[i] = temp;
            return this.props.onChange(value);
        };
        this.handleMoveDown = (i) => {
            const value = (this.props.value || []).slice();
            const temp = value[i + 1];
            value[i + 1] = value[i];
            value[i] = temp;
            return this.props.onChange(value);
        };
    }
    render() {
        const items = this.props.value || [];
        return R("div", null, lodash_1.default.map(items, (value, i) => {
            return R(EnumValueEditorComponent, {
                key: i,
                value,
                onChange: this.handleChange.bind(null, i),
                onRemove: this.handleRemove.bind(null, i),
                onMoveUp: i > 0 ? this.handleMoveUp.bind(null, i) : undefined,
                onMoveDown: i < items.length - 1 ? this.handleMoveDown.bind(null, i) : undefined
            });
        }), R("button", { type: "button", className: "btn btn-link", onClick: this.handleAdd }, "+ Add Value"));
    }
}
// Edits an enum value (id, name)
class EnumValueEditorComponent extends react_1.default.Component {
    render() {
        return R("div", { className: "card" }, R("div", { className: "card-body" }, R("div", { className: "row" }, R("div", { className: "col-md-6" }, R(IdFieldComponent_1.default, {
            value: this.props.value.id,
            onChange: (value) => this.props.onChange(lodash_1.default.extend({}, this.props.value, { id: value }))
        })), R("div", { className: "col-md-6" }, R(ui.FormGroup, { label: "Code" }, R("input", {
            type: "text",
            className: "form-control",
            placeholder: "Code",
            style: { width: "10em" },
            value: this.props.value.code,
            onChange: (ev) => this.props.onChange(lodash_1.default.extend({}, this.props.value, { code: ev.target.value }))
        })))), R("div", { className: "row" }, R("div", { className: "col-md-12" }, R(ui.FormGroup, { label: "Name" }, R(LocalizedStringEditorComp_1.default, {
            value: this.props.value.name,
            onChange: (value) => this.props.onChange(lodash_1.default.extend({}, this.props.value, { name: value }))
        })))), R("div", { className: "row" }, R("div", { className: "col-md-12" }, R(ui.FormGroup, { label: "Description" }, R(LocalizedStringEditorComp_1.default, {
            value: this.props.value.desc,
            onChange: (value) => this.props.onChange(lodash_1.default.extend({}, this.props.value, { desc: value }))
        })))), R("div", { className: "row", style: { float: "right" } }, this.props.onMoveUp
            ? R("button", { className: "btn btn-link btn-sm", onClick: this.props.onMoveUp }, "Move Up")
            : undefined, this.props.onMoveDown
            ? R("button", { className: "btn btn-link btn-sm", onClick: this.props.onMoveDown }, "Move Down")
            : undefined, this.props.onRemove
            ? R("button", { className: "btn btn-link btn-sm", onClick: this.props.onRemove }, "Remove")
            : undefined)));
    }
}
