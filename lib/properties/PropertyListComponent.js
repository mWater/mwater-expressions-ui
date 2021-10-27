"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
const prop_types_1 = __importDefault(require("prop-types"));
const lodash_1 = __importDefault(require("lodash"));
const ReorderableListComponent_1 = __importDefault(require("react-library/lib/reorderable/ReorderableListComponent"));
const LocalizedStringComponent_1 = __importDefault(require("../LocalizedStringComponent"));
const PropertyEditorComponent_1 = __importDefault(require("./PropertyEditorComponent"));
const SectionEditorComponent_1 = __importDefault(require("./SectionEditorComponent"));
const NestedListClipboardEnhancement_1 = __importDefault(require("./NestedListClipboardEnhancement"));
const ActionCancelModalComponent_1 = __importDefault(require("react-library/lib/ActionCancelModalComponent"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
class InnerPropertyListComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.handleChange = (index, property) => {
            const value = this.props.properties.slice();
            value[index] = property;
            this.props.onChange(value);
        };
        this.handleDelete = (index) => {
            const value = this.props.properties.slice();
            lodash_1.default.pullAt(value, index);
            this.props.onChange(value);
        };
        this.handleNewProperty = () => {
            const property = {
                type: "text"
            };
            if (this.props.propertyIdGenerator) {
                property["id"] = this.props.propertyIdGenerator();
            }
            this.setState({ addingItem: property });
        };
        this.handleNewSection = () => {
            const section = {
                type: "section",
                contents: []
            };
            this.setState({ addingItem: section });
        };
        this.renderProperty = (allPropertyIds, item, index, connectDragSource, connectDragPreview, connectDropTarget) => {
            const elem = R("div", { key: index }, R(PropertyComponent, {
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
            }));
            return connectDragPreview(connectDropTarget(connectDragSource(elem)));
        };
        this.state = {
            addingItem: null // Property being added
        };
    }
    renderControls(allPropertyIds) {
        return R("div", { className: "btn-group pl-controls" }, this.renderAddingModal(allPropertyIds), R("button", {
            key: "default_add",
            type: "button",
            className: "btn btn-sm btn-secondary dropdown-toggle",
            "data-bs-toggle": "dropdown"
        }, R("i", { className: "fa fa-plus" }), " ", "Add"), R("ul", { className: "dropdown-menu", role: "menu" }, R("li", { key: "property" }, R("a", { onClick: this.handleNewProperty }, "Property")), lodash_1.default.includes(this.props.features || [], "section")
            ? R("li", { key: "section" }, R("a", { className: "dropdown-item", onClick: this.handleNewSection }, "Section"))
            : undefined));
    }
    renderAddingModal(allPropertyIds) {
        if (!this.state.addingItem) {
            return null;
        }
        return R(ActionCancelModalComponent_1.default, {
            size: "large",
            title: this.state.addingItem.type === "section" ? "Add a section" : "Add a property",
            actionLabel: "Save",
            onAction: () => {
                if (this.state.addingItem) {
                    // Prevent duplicates
                    if (allPropertyIds.includes(this.state.addingItem.id)) {
                        return alert("Duplicate ids not allowed");
                    }
                    const value = this.props.properties.slice();
                    value.push(this.state.addingItem);
                    this.props.onChange(value);
                    return this.setState({ addingItem: null });
                }
            },
            onCancel: () => this.setState({ addingItem: null })
        }, this.state.addingItem.type === "section"
            ? R(SectionEditorComponent_1.default, {
                property: this.state.addingItem,
                onChange: (updatedProperty) => this.setState({ addingItem: updatedProperty }),
                features: this.props.features
            })
            : R(PropertyEditorComponent_1.default, {
                property: this.state.addingItem,
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                table: this.props.table,
                tableIds: this.props.tableIds,
                variables: this.props.variables,
                onChange: (updatedProperty) => this.setState({ addingItem: updatedProperty }),
                features: this.props.features,
                createRoleEditElem: this.props.createRoleEditElem,
                forbiddenPropertyIds: allPropertyIds
            }));
    }
    render() {
        // Compute list of all property ids, recursively
        const allPropertyIds = lodash_1.default.pluck(flattenProperties(this.props.properties), "id");
        return R("div", { className: "pl-editor-container" }, R(ReorderableListComponent_1.default, {
            items: this.props.properties,
            onReorder: (list) => this.props.onChange(list),
            renderItem: this.renderProperty.bind(this, allPropertyIds),
            getItemId: (item) => item.id,
            element: R("div", { className: "pl-container" })
        }), this.renderControls(allPropertyIds));
    }
}
InnerPropertyListComponent.contextTypes = { clipboard: prop_types_1.default.object };
class PropertyComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.handleEdit = () => {
            return this.setState({ editing: true, editorProperty: this.props.property });
        };
        this.renderEnumValues = (values) => {
            const names = lodash_1.default.map(values, (value) => value.name[value._base || "en"]);
            return R("span", null, `${names.join(" / ")}`);
        };
        this.state = { editing: false, editorProperty: null };
    }
    renderControls() {
        return R("div", { className: "pl-item-controls" }, R("a", { className: "pl-item-control", onClick: this.handleEdit }, "Edit"), R("a", { className: "pl-item-control", onClick: () => this.props.onCopy(this.props.listId, this.props.property.id) }, "Copy"), R("a", { className: "pl-item-control", onClick: () => this.props.onCut(this.props.listId, this.props.property.id) }, "Cut"), this.context.clipboard
            ? R("a", {
                className: "pl-item-control",
                onClick: () => this.props.onPaste(this.props.listId, this.props.property.id)
            }, "Paste")
            : undefined, this.context.clipboard && this.props.property.type === "section"
            ? R("a", {
                className: "pl-item-control",
                onClick: () => this.props.onPasteInto(this.props.listId, this.props.property.id)
            }, "Paste Into")
            : undefined, R("a", { className: "pl-item-control", onClick: () => this.props.onDelete() }, "Delete"));
    }
    renderTable(table) {
        var _a;
        return R(LocalizedStringComponent_1.default, { value: (_a = this.props.schema.getTable(table)) === null || _a === void 0 ? void 0 : _a.name });
    }
    render() {
        const classNames = ["pl-property"];
        if (this.props.property.deprecated) {
            classNames.push("deprecated");
        }
        return R("div", { className: `${classNames.join(" ")} pl-item-type-${this.props.property.type}` }, this.state.editing
            ? R(ActionCancelModalComponent_1.default, {
                size: "large",
                title: this.state.editorProperty.type === "section" ? "Edit section" : "Edit property",
                actionLabel: "Save",
                onAction: () => {
                    if (this.state.editorProperty) {
                        // Prevent duplicates
                        if (this.state.editorProperty.id !== this.props.property.id &&
                            this.props.allPropertyIds.includes(this.state.editorProperty.id)) {
                            return alert("Duplicate ids not allowed");
                        }
                        this.props.onChange(this.state.editorProperty);
                    }
                    return this.setState({ editing: false, editorProperty: null });
                },
                onCancel: () => this.setState({ editing: false, editorProperty: null })
            }, this.props.property.type === "section"
                ? R(SectionEditorComponent_1.default, {
                    property: this.state.editorProperty,
                    onChange: (updatedProperty) => this.setState({ editorProperty: updatedProperty }),
                    features: this.props.features
                })
                : R(PropertyEditorComponent_1.default, {
                    property: this.state.editorProperty,
                    schema: this.props.schema,
                    dataSource: this.props.dataSource,
                    table: this.props.table,
                    tableIds: this.props.tableIds,
                    variables: this.props.variables,
                    onChange: (updatedProperty) => this.setState({ editorProperty: updatedProperty }),
                    features: this.props.features,
                    createRoleEditElem: this.props.createRoleEditElem,
                    forbiddenPropertyIds: lodash_1.default.without(this.props.allPropertyIds, this.props.property.id)
                }))
            : undefined, this.renderControls(), this.props.property.deprecated ? R("div", { className: "pl-item-deprecated-overlay" }, "") : undefined, R("div", { className: "pl-item", onDoubleClick: this.handleEdit }, R("div", { className: "pl-item-detail" }, R("span", { className: "pl-item-detail-indicator" }, R("i", { className: `${PropertyComponent.iconMap[this.props.property.type]} fa-fw` })), R("div", null, R("div", { className: "pl-item-detail-name" }, lodash_1.default.includes(this.props.features, "idField") && this.props.property.id
            ? R("small", null, `[${this.props.property.id}] `)
            : undefined, R(LocalizedStringComponent_1.default, { value: this.props.property.name }), this.props.property.required ? R("span", { style: { color: "red" } }, "*") : undefined, this.props.property.expr
            ? R("span", { className: "text-muted" }, " ", R("span", { className: "fa fa-calculator" }))
            : undefined), this.props.property.desc
            ? R("div", { className: "pl-item-detail-description" }, R(LocalizedStringComponent_1.default, { value: this.props.property.desc }))
            : undefined, this.props.property.sql
            ? R("div", { className: "pl-item-detail-sql text-info" }, `SQL: ${this.props.property.sql}`)
            : undefined, this.props.property.reverseSql
            ? R("div", { className: "pl-item-detail-sql text-info" }, `Reverse SQL: ${this.props.property.reverseSql}`)
            : undefined, ["enum", "enumset"].includes(this.props.property.type) && this.props.property.enumValues.length > 0
            ? R("div", { className: "pl-item-detail-enum text-muted" }, this.renderEnumValues(this.props.property.enumValues))
            : undefined, lodash_1.default.includes(this.props.features, "table") && this.props.property.table
            ? R("div", { className: "pl-item-detail-table text-muted" }, this.renderTable(this.props.property.table))
            : undefined, this.props.property.roles && this.props.createRoleDisplayElem
            ? this.props.createRoleDisplayElem(this.props.property.roles)
            : undefined))), this.props.property.type === "section"
            ? R("div", { className: "pl-item-section" }, R(InnerPropertyListComponent, {
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
                onChange: (list) => {
                    const newProperty = lodash_1.default.cloneDeep(this.props.property);
                    newProperty.contents = list;
                    return this.props.onChange(newProperty);
                },
                allPropertyIds: this.props.allPropertyIds
            }))
            : undefined);
    }
}
PropertyComponent.propTypes = {
    property: prop_types_1.default.object.isRequired,
    onChange: prop_types_1.default.func.isRequired,
    schema: prop_types_1.default.object,
    dataSource: prop_types_1.default.object,
    table: prop_types_1.default.string,
    tableIds: prop_types_1.default.arrayOf(prop_types_1.default.string.isRequired),
    variables: prop_types_1.default.array,
    features: prop_types_1.default.array,
    createRoleDisplayElem: prop_types_1.default.func,
    createRoleEditElem: prop_types_1.default.func,
    onCut: prop_types_1.default.func.isRequired,
    onCopy: prop_types_1.default.func.isRequired,
    onPaste: prop_types_1.default.func.isRequired,
    onPasteInto: prop_types_1.default.func.isRequired,
    onDelete: prop_types_1.default.func.isRequired,
    listId: prop_types_1.default.string,
    allPropertyIds: prop_types_1.default.arrayOf(prop_types_1.default.string.isRequired) // List of all property ids to prevent duplicates
};
PropertyComponent.iconMap = {
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
};
PropertyComponent.contextTypes = { clipboard: prop_types_1.default.object };
const WrappedPropertyListComponent = (0, NestedListClipboardEnhancement_1.default)(InnerPropertyListComponent);
class PropertyListComponent extends react_1.default.Component {
    render() {
        return R(WrappedPropertyListComponent, this.props);
    }
}
exports.default = PropertyListComponent;
// Flatten a nested list of properties
function flattenProperties(properties) {
    let props = [];
    for (let prop of properties) {
        if (prop.contents) {
            props = props.concat(flattenProperties(prop.contents));
        }
        else {
            props.push(prop);
        }
    }
    return props;
}
