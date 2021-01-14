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
var ModalPopupComponent_1 = __importDefault(require("react-library/lib/ModalPopupComponent"));
var bootstrap_1 = require("react-library/lib/bootstrap");
var TableSelectComponent_1 = require("./TableSelectComponent");
var ExprComponent_1 = __importDefault(require("./ExprComponent"));
var FilterExprComponent_1 = __importDefault(require("./FilterExprComponent"));
/** Expression builder for a spatial join. Uses a popup for editing */
exports.BuildSpatialJoinExprComponent = function (props) {
    var value = props.value;
    var toTable = props.value.toTable ? props.schema.getTable(props.value.toTable) : null;
    var exprUtils = new mwater_expressions_1.ExprUtils(props.schema);
    var _a = react_1.useState(false), editing = _a[0], setEditing = _a[1];
    function handleEdit() {
        setEditing(true);
    }
    return react_1.default.createElement("div", null,
        editing ?
            react_1.default.createElement(ModalPopupComponent_1.default, { onClose: function () { return setEditing(false); }, showCloseX: true },
                react_1.default.createElement(SpatialJoinPopupContents, { schema: props.schema, dataSource: props.dataSource, value: props.value, onChange: props.onChange, types: props.types }))
            : null,
        react_1.default.createElement("div", null,
            react_1.default.createElement("span", { className: "text-muted" }, "Spation join to:"),
            " ",
            toTable ? mwater_expressions_1.ExprUtils.localizeString(toTable.name) : "Not defined",
            "\u00A0",
            react_1.default.createElement("a", { onClick: handleEdit, style: { cursor: "pointer" } },
                react_1.default.createElement("i", { className: "fa fa-pencil" }),
                " Edit")),
        react_1.default.createElement("div", null,
            react_1.default.createElement("span", { className: "text-muted" }, "On: "),
            exprUtils.summarizeExpr(value.fromGeometryExpr),
            react_1.default.createElement("span", { className: "text-muted" }, " : "),
            exprUtils.summarizeExpr(value.toGeometryExpr)),
        react_1.default.createElement("div", null,
            react_1.default.createElement("span", { className: "text-muted" }, "Radius:"),
            " ",
            value.radius || "",
            " meters"),
        react_1.default.createElement("div", null,
            react_1.default.createElement("span", { className: "text-muted" }, "Value:"),
            " ",
            exprUtils.summarizeExpr(value.valueExpr)),
        react_1.default.createElement("div", null,
            react_1.default.createElement("span", { className: "text-muted" }, "Filters:"),
            " ",
            exprUtils.summarizeExpr(value.filterExpr)));
};
/** Contents of popup to edit spatial join */
var SpatialJoinPopupContents = function (props) {
    var value = props.value;
    var exprUtils = new mwater_expressions_1.ExprUtils(props.schema);
    return react_1.default.createElement("div", null,
        react_1.default.createElement(bootstrap_1.FormGroup, { label: "Join to table" },
            react_1.default.createElement(TableSelectComponent_1.TableSelectComponent, { schema: props.schema, value: value.toTable, onChange: function (v) { return props.onChange(__assign(__assign({}, value), { toTable: v })); } })),
        value.toTable ?
            react_1.default.createElement(bootstrap_1.FormGroup, { label: "From Location" },
                react_1.default.createElement(ExprComponent_1.default, { table: value.table, schema: props.schema, dataSource: props.dataSource, value: value.fromGeometryExpr, types: ["geometry"], onChange: function (v) { return props.onChange(__assign(__assign({}, value), { fromGeometryExpr: v })); } }))
            : null,
        value.toTable ?
            react_1.default.createElement(bootstrap_1.FormGroup, { label: "To Location" },
                react_1.default.createElement(ExprComponent_1.default, { table: value.toTable, schema: props.schema, dataSource: props.dataSource, value: value.toGeometryExpr, types: ["geometry"], onChange: function (v) { return props.onChange(__assign(__assign({}, value), { toGeometryExpr: v })); } }))
            : null,
        value.toTable ?
            react_1.default.createElement(bootstrap_1.FormGroup, { label: "Calculated Value", help: "Popup may close when setting this value. Re-open to complete" },
                react_1.default.createElement(ExprComponent_1.default, { table: value.toTable, schema: props.schema, dataSource: props.dataSource, value: value.valueExpr, aggrStatuses: ["aggregate"], onChange: function (v) { return props.onChange(__assign(__assign({}, value), { valueExpr: v })); } }))
            : null,
        value.toTable ?
            react_1.default.createElement(bootstrap_1.FormGroup, { label: "Optional Filters" },
                react_1.default.createElement(FilterExprComponent_1.default, { table: value.toTable, schema: props.schema, dataSource: props.dataSource, value: value.filterExpr, onChange: function (v) { return props.onChange(__assign(__assign({}, value), { filterExpr: v })); } }))
            : null);
};
