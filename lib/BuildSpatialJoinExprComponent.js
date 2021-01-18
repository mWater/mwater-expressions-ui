"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildSpatialJoinExprComponent = void 0;
var mwater_expressions_1 = require("mwater-expressions");
var react_1 = __importStar(require("react"));
var ActionCancelModalComponent_1 = __importDefault(require("react-library/lib/ActionCancelModalComponent"));
var bootstrap_1 = require("react-library/lib/bootstrap");
var TableSelectComponent_1 = require("./TableSelectComponent");
var ExprComponent_1 = __importDefault(require("./ExprComponent"));
var FilterExprComponent_1 = __importDefault(require("./FilterExprComponent"));
/** Expression builder for a spatial join. Uses a popup for editing */
exports.BuildSpatialJoinExprComponent = function (props) {
    var value = props.value;
    var fromTable = props.value.table ? props.schema.getTable(props.value.table) : null;
    var toTable = props.value.toTable ? props.schema.getTable(props.value.toTable) : null;
    var exprUtils = new mwater_expressions_1.ExprUtils(props.schema);
    var _a = react_1.useState(), editingValue = _a[0], setEditingValue = _a[1];
    function handleEdit() {
        setEditingValue(props.value);
    }
    function handleSave() {
        if (!editingValue.toTable) {
            alert("To Data Source required");
            return;
        }
        if (!editingValue.fromGeometryExpr) {
            alert("From Location required");
            return;
        }
        if (!editingValue.toGeometryExpr) {
            alert("To Location required");
            return;
        }
        if (!editingValue.valueExpr) {
            alert("Calculated value required");
            return;
        }
        if (!editingValue.radiusExpr) {
            alert("Distance value required");
            return;
        }
        props.onChange(editingValue);
        setEditingValue(undefined);
    }
    var configured = value.radiusExpr != null && value.toTable != null && value.toGeometryExpr != null && value.valueExpr != null && value.fromGeometryExpr != null;
    return react_1.default.createElement("div", null,
        editingValue ?
            react_1.default.createElement(ActionCancelModalComponent_1.default, { onAction: handleSave, onCancel: function () {
                    setEditingValue(undefined);
                } },
                react_1.default.createElement(SpatialJoinPopupContents, { schema: props.schema, dataSource: props.dataSource, value: editingValue, onChange: setEditingValue, types: props.types }))
            : null,
        react_1.default.createElement("div", null,
            react_1.default.createElement("b", null, "Spatial join"),
            "\u00A0",
            react_1.default.createElement("a", { onClick: handleEdit, style: { cursor: "pointer" } }, configured ?
                react_1.default.createElement("span", null,
                    react_1.default.createElement("i", { className: "fa fa-pencil" }),
                    " Edit")
                : react_1.default.createElement("span", null,
                    react_1.default.createElement("i", { className: "fa fa-pencil" }),
                    " Configure"))),
        configured ?
            react_1.default.createElement("div", { style: { marginLeft: 5 } },
                react_1.default.createElement("div", null,
                    react_1.default.createElement("span", { className: "text-muted" }, "Distance:"),
                    " ",
                    exprUtils.summarizeExpr(value.radiusExpr),
                    " meters"),
                react_1.default.createElement("div", { style: { paddingTop: 10 } },
                    react_1.default.createElement("b", null, "From Table")),
                react_1.default.createElement("div", null,
                    react_1.default.createElement("span", { className: "text-muted" }, "Data Source: "),
                    fromTable ? mwater_expressions_1.ExprUtils.localizeString(fromTable.name) : "Not defined"),
                react_1.default.createElement("div", null,
                    react_1.default.createElement("span", { className: "text-muted" }, "Location: "),
                    exprUtils.summarizeExpr(value.fromGeometryExpr)),
                react_1.default.createElement("div", { style: { paddingTop: 10 } },
                    react_1.default.createElement("b", null, "To Table")),
                react_1.default.createElement("div", null,
                    react_1.default.createElement("span", { className: "text-muted" }, "Data Source: "),
                    toTable ? mwater_expressions_1.ExprUtils.localizeString(toTable.name) : "Not defined"),
                react_1.default.createElement("div", null,
                    react_1.default.createElement("span", { className: "text-muted" }, "Location: "),
                    exprUtils.summarizeExpr(value.toGeometryExpr)),
                react_1.default.createElement("div", null,
                    react_1.default.createElement("span", { className: "text-muted" }, "Value:"),
                    " ",
                    exprUtils.summarizeExpr(value.valueExpr)),
                react_1.default.createElement("div", null,
                    react_1.default.createElement("span", { className: "text-muted" }, "Filters:"),
                    " ",
                    exprUtils.summarizeExpr(value.filterExpr)))
            : null);
};
/** Contents of popup to edit spatial join */
var SpatialJoinPopupContents = function (props) {
    var value = props.value;
    var exprUtils = new mwater_expressions_1.ExprUtils(props.schema);
    var fromTable = props.value.table ? props.schema.getTable(props.value.table) : null;
    return react_1.default.createElement("div", null,
        react_1.default.createElement("h4", null, "Spatial Join"),
        react_1.default.createElement("div", { className: "text-muted" }, "Join data from one table to another including only those rows that are within a certain distance"),
        react_1.default.createElement("div", { className: "panel panel-default" },
            react_1.default.createElement("div", { className: "panel-heading" },
                "From Table - ",
                react_1.default.createElement("span", { className: "text-muted" }, "Table from which join is made")),
            react_1.default.createElement("div", { className: "panel-body" },
                react_1.default.createElement(bootstrap_1.FormGroup, { label: "Data Source", hint: "Data source to start join from" }, fromTable ? mwater_expressions_1.localizeString(fromTable.name) : null),
                value.table ?
                    react_1.default.createElement(bootstrap_1.FormGroup, { label: "Location", hint: "GPS coordinates of from table" },
                        react_1.default.createElement(ExprComponent_1.default, { table: value.table, schema: props.schema, dataSource: props.dataSource, value: value.fromGeometryExpr, types: ["geometry"], onChange: function (v) { return props.onChange(__assign(__assign({}, value), { fromGeometryExpr: v })); } }))
                    : null)),
        react_1.default.createElement("div", { className: "panel panel-default" },
            react_1.default.createElement("div", { className: "panel-heading" },
                "To Table - ",
                react_1.default.createElement("span", { className: "text-muted" }, "Table to which join is made")),
            react_1.default.createElement("div", { className: "panel-body" },
                react_1.default.createElement(bootstrap_1.FormGroup, { label: "Data Source", hint: "Data source to join to based on distance" },
                    react_1.default.createElement(TableSelectComponent_1.TableSelectComponent, { schema: props.schema, value: value.toTable, onChange: function (v) { return props.onChange(__assign(__assign({}, value), { toTable: v })); } })),
                value.toTable ?
                    react_1.default.createElement(bootstrap_1.FormGroup, { label: "Location", hint: "GPS coordinates of to table" },
                        react_1.default.createElement(ExprComponent_1.default, { table: value.toTable, schema: props.schema, dataSource: props.dataSource, value: value.toGeometryExpr, types: ["geometry"], onChange: function (v) { return props.onChange(__assign(__assign({}, value), { toGeometryExpr: v })); } }))
                    : null,
                value.toTable ?
                    react_1.default.createElement(bootstrap_1.FormGroup, { label: "Calculated Value", help: "Value in the To table that will be aggregated" },
                        react_1.default.createElement(ExprComponent_1.default, { table: value.toTable, schema: props.schema, dataSource: props.dataSource, value: value.valueExpr, aggrStatuses: ["aggregate"], onChange: function (v) { return props.onChange(__assign(__assign({}, value), { valueExpr: v })); } }))
                    : null,
                value.toTable ?
                    react_1.default.createElement(bootstrap_1.FormGroup, { label: "Optional Filters", hint: "Limits which rows are included in To table" },
                        react_1.default.createElement(FilterExprComponent_1.default, { table: value.toTable, schema: props.schema, dataSource: props.dataSource, value: value.filterExpr, onChange: function (v) { return props.onChange(__assign(__assign({}, value), { filterExpr: v })); } }))
                    : null)),
        react_1.default.createElement(bootstrap_1.FormGroup, { label: "Within a distance of... (meters)" },
            react_1.default.createElement(ExprComponent_1.default, { table: value.table, schema: props.schema, dataSource: props.dataSource, value: value.radiusExpr, types: ["number"], preferLiteral: true, onChange: function (v) { return props.onChange(__assign(__assign({}, value), { radiusExpr: v })); } })));
};
