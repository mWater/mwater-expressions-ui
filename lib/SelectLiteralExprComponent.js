"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prop_types_1 = __importDefault(require("prop-types"));
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const moment_1 = __importDefault(require("moment"));
const mwater_expressions_1 = require("mwater-expressions");
const DateTimePickerComponent_1 = __importDefault(require("./DateTimePickerComponent"));
const IdLiteralComponent_1 = __importDefault(require("./IdLiteralComponent"));
const bootstrap_1 = require("react-library/lib/bootstrap");
const ListEditorComponent_1 = require("react-library/lib/ListEditorComponent");
const RefTextComponent_1 = __importDefault(require("./RefTextComponent"));
class SelectLiteralExprComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.handleChange = (value) => {
            return this.setState({ value, changed: true, inputText: null });
        };
        this.handleDateSelected = (date) => {
            if (date) {
                return this.setState({
                    value: { type: "literal", valueType: "date", value: date.format("YYYY-MM-DD") },
                    changed: true
                });
            }
            else {
                return this.setState({ value: null, changed: true });
            }
        };
        this.handleDateTimeSelected = (datetime) => {
            if (datetime) {
                return this.setState({
                    value: { type: "literal", valueType: "datetime", value: datetime.toISOString() },
                    changed: true
                });
            }
            else {
                return this.setState({ value: null, changed: true });
            }
        };
        this.handleAccept = () => {
            // Parse text value if text
            let value;
            if (this.state.inputText != null) {
                // Empty means no value
                if (this.state.inputText === "") {
                    this.props.onChange(null);
                    return;
                }
                // Prefer number over text if can be parsed as number
                if (((this.props.value && this.props.value.valueType === "number") ||
                    (this.props.types || ["number"]).includes("number")) &&
                    this.state.inputText.match(/^-?\d+(\.\d+)?$/)) {
                    value = parseFloat(this.state.inputText);
                    return this.props.onChange({ type: "literal", valueType: "number", value });
                    // If text
                }
                else if ((this.props.value && this.props.value.valueType === "text") ||
                    (this.props.types || ["text"]).includes("text")) {
                    return this.props.onChange({ type: "literal", valueType: "text", value: this.state.inputText });
                    // If id (only allow if idTable is explicit)
                }
                else if ((this.props.types || ["id"]).includes("id") && this.props.idTable) {
                    return this.props.onChange({
                        type: "literal",
                        valueType: "id",
                        idTable: this.props.idTable,
                        value: this.state.inputText
                    });
                }
                else {
                    // Set error condition
                    return this.setState({ inputTextError: true });
                }
            }
            else {
                return this.props.onChange(this.state.value);
            }
        };
        this.handleTextChange = (ev) => {
            return this.setState({ inputText: ev.target.value, changed: true });
        };
        this.state = {
            value: props.value,
            // Set input text to value if text/number
            inputText: (props.value && ["text", "number"].includes(props.value.valueType)) ? "" + props.value.value : null,
            changed: false,
            inputTextError: false
        };
    }
    // Render a text box for inputting text/number
    renderTextBox() {
        return R("div", { className: this.state.inputTextError ? "has-error" : undefined }, R("input", {
            type: "text",
            className: "form-control",
            value: this.state.inputText || "",
            onChange: this.handleTextChange,
            placeholder: "Enter value..."
        }));
    }
    renderInput() {
        let idTable;
        const expr = this.state.value;
        // Get current expression type
        const exprUtils = new mwater_expressions_1.ExprUtils(this.props.schema);
        const exprType = exprUtils.getExprType(expr);
        // If boolean, use Toggle
        if (exprType === "boolean" || lodash_1.default.isEqual(this.props.types, ["boolean"])) {
            return R(bootstrap_1.Toggle, {
                value: expr === null || expr === void 0 ? void 0 : expr.value,
                allowReset: true,
                options: [
                    { value: false, label: "False" },
                    { value: true, label: "True" }
                ],
                onChange: (value) => this.handleChange(value != null ? { type: "literal", valueType: "boolean", value } : null)
            });
        }
        // Simplify reference expression if it is a scalar, as they are more limited
        // in options and more difficult to compute.
        let refExpr = this.props.refExpr;
        if (refExpr && refExpr.type == "scalar") {
            refExpr = refExpr.expr;
        }
        // If reference expression is aggregate, null it, as it is not supported (https://github.com/mWater/mwater-portal/issues/1532)
        if (refExpr && exprUtils.getExprAggrStatus(refExpr) === "aggregate") {
            refExpr = null;
        }
        // If text and has a reference expression
        if ((exprType === "text" || lodash_1.default.isEqual(this.props.types, ["text"])) && refExpr) {
            return R(RefTextComponent_1.default, {
                value: expr,
                refExpr: refExpr,
                type: "text",
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                onChange: this.handleChange
            });
        }
        // If text[] and has reference expression, use special component
        if ((exprType === "text[]" || lodash_1.default.isEqual(this.props.types, ["text[]"])) && refExpr) {
            return R(RefTextComponent_1.default, {
                value: expr,
                refExpr: refExpr,
                type: "text[]",
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                onChange: this.handleChange
            });
        }
        // If text[], use special component
        if ((exprType === "text[]" || lodash_1.default.isEqual(this.props.types, ["text[]"]))) {
            return react_1.default.createElement(TextListComponent, { value: expr, onChange: this.handleChange });
        }
        if ((exprType === "enum" || lodash_1.default.isEqual(this.props.types, ["enum"])) && this.props.enumValues) {
            return R(EnumAsListComponent, {
                value: expr,
                enumValues: this.props.enumValues,
                onChange: this.handleChange
            });
        }
        if ((exprType === "enumset" || lodash_1.default.isEqual(this.props.types, ["enumset"])) && this.props.enumValues) {
            return R(EnumsetAsListComponent, {
                value: expr,
                enumValues: this.props.enumValues,
                onChange: this.handleChange
            });
        }
        if (exprType === "id" || (lodash_1.default.isEqual(this.props.types, ["id"]) && this.props.idTable)) {
            idTable = this.props.idTable || exprUtils.getExprIdTable(expr);
            return R(IdLiteralComponent_1.default, {
                value: expr === null || expr === void 0 ? void 0 : expr.value,
                idTable,
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                onChange: (value) => this.handleChange(value ? { type: "literal", valueType: "id", idTable, value } : null)
            });
        }
        if (exprType === "id[]" || (lodash_1.default.isEqual(this.props.types, ["id[]"]) && this.props.idTable)) {
            idTable = this.props.idTable || exprUtils.getExprIdTable(expr);
            return R(IdLiteralComponent_1.default, {
                value: expr === null || expr === void 0 ? void 0 : expr.value,
                idTable,
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                multi: true,
                onChange: (value) => this.handleChange(value && value.length > 0 ? { type: "literal", valueType: "id[]", idTable, value } : null)
            });
        }
        // If already text/number, or text/number accepted, render field
        if (exprType &&
            ["text", "number"].includes(exprType) ||
            !this.props.types ||
            this.props.types.includes("text") ||
            this.props.types.includes("number")) {
            return this.renderTextBox();
        }
        // If date type, display control
        if ((this.props.value && this.props.value.valueType === "date") || (this.props.types || []).includes("date")) {
            return R(DateTimePickerComponent_1.default, {
                date: this.state.value ? (0, moment_1.default)(this.state.value.value, moment_1.default.ISO_8601) : undefined,
                onChange: this.handleDateSelected
            });
        }
        // If datetime type, display control
        if ((this.props.value && this.props.value.valueType === "datetime") ||
            (this.props.types || []).includes("datetime")) {
            return R(DateTimePickerComponent_1.default, {
                date: this.state.value ? (0, moment_1.default)(this.state.value.value, moment_1.default.ISO_8601) : undefined,
                timepicker: true,
                onChange: this.handleDateTimeSelected
            });
        }
        return R("div", { className: "text-warning" }, "Literal input not supported for this type");
    }
    render() {
        return R("div", null, R("div", { style: { paddingBottom: 10 } }, R("button", { type: "button", className: "btn btn-primary", onClick: this.handleAccept, disabled: !this.state.changed }, R("i", { className: "fa fa-check" }), " OK"), " ", R("button", { type: "button", className: "btn btn-secondary", onClick: this.props.onCancel }, "Cancel")), this.renderInput());
    }
}
exports.default = SelectLiteralExprComponent;
// Component which displays an enum as a list
class EnumAsListComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleChange = (val) => {
            if (!val) {
                return this.props.onChange(null);
            }
            else {
                return this.props.onChange({ type: "literal", valueType: "enum", value: val });
            }
        };
    }
    render() {
        var _a;
        const value = (_a = this.props.value) === null || _a === void 0 ? void 0 : _a.value;
        const itemStyle = {
            padding: 4,
            marginLeft: 5,
            borderRadius: 4,
            cursor: "pointer"
        };
        return R("div", null, lodash_1.default.map(this.props.enumValues, (val) => {
            return R("div", {
                key: val.id,
                className: "hover-grey-background",
                style: itemStyle,
                onClick: this.handleChange.bind(null, val.id)
            }, val.id === value
                ? R("i", { className: "fa fa-fw fa-check", style: { color: "#2E6DA4" } })
                : R("i", { className: "fa fa-fw" }), " ", mwater_expressions_1.ExprUtils.localizeString(val.name, this.context.locale));
        }));
    }
}
EnumAsListComponent.contextTypes = { locale: prop_types_1.default.string };
// Component which displays an enumset as a list
class EnumsetAsListComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleToggle = (val) => {
            var _a;
            let items = ((_a = this.props.value) === null || _a === void 0 ? void 0 : _a.value) || [];
            if (items.includes(val)) {
                items = lodash_1.default.without(items, val);
            }
            else {
                items = items.concat([val]);
            }
            if (items.length === 0) {
                return this.props.onChange(null);
            }
            else {
                return this.props.onChange({ type: "literal", valueType: "enumset", value: items });
            }
        };
    }
    render() {
        var _a;
        const items = ((_a = this.props.value) === null || _a === void 0 ? void 0 : _a.value) || [];
        const itemStyle = {
            padding: 4,
            marginLeft: 5,
            borderRadius: 4,
            cursor: "pointer"
        };
        return R("div", null, lodash_1.default.map(this.props.enumValues, (val) => {
            return R("div", {
                key: val.id,
                className: "hover-grey-background",
                style: itemStyle,
                onClick: this.handleToggle.bind(null, val.id)
            }, items.includes(val.id)
                ? R("i", { className: "fa fa-fw fa-check-square", style: { color: "#2E6DA4" } })
                : R("i", { className: "fa fa-fw fa-square", style: { color: "#DDDDDD" } }), " ", mwater_expressions_1.ExprUtils.localizeString(val.name, this.context.locale));
        }));
    }
}
EnumsetAsListComponent.contextTypes = { locale: prop_types_1.default.string };
function TextListComponent(props) {
    var _a;
    const value = ((_a = props.value) === null || _a === void 0 ? void 0 : _a.value) || [];
    return react_1.default.createElement(ListEditorComponent_1.ListEditorComponent, { items: value, onItemsChange: (items) => props.onChange(items.length > 0 ? { type: "literal", valueType: "text[]", value: items } : null), renderItem: (item, index, onItemChange) => react_1.default.createElement(bootstrap_1.TextInput, { value: item, onChange: onItemChange }), addLabel: "Add item", createNew: () => "" });
}
