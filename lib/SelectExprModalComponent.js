"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prop_types_1 = __importDefault(require("prop-types"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const mwater_expressions_1 = require("mwater-expressions");
const ModalWindowComponent_1 = __importDefault(require("react-library/lib/ModalWindowComponent"));
const TabbedComponent_1 = __importDefault(require("react-library/lib/TabbedComponent"));
const SelectFieldExprComponent_1 = __importDefault(require("./SelectFieldExprComponent"));
const SelectFormulaExprComponent_1 = __importDefault(require("./SelectFormulaExprComponent"));
const SelectLiteralExprComponent_1 = __importDefault(require("./SelectLiteralExprComponent"));
const SelectVariableExprComponent_1 = __importDefault(require("./SelectVariableExprComponent"));
class SelectExprModalComponent extends react_1.default.Component {
    renderContents() {
        const table = this.props.table ? this.props.schema.getTable(this.props.table) : undefined;
        const tabs = [];
        if (table) {
            tabs.push({
                id: "field",
                label: [
                    R("i", { className: "fa fa-table" }),
                    ` ${mwater_expressions_1.ExprUtils.localizeString(table.name, this.context.locale)} Field`
                ],
                elem: R(SelectFieldExprComponent_1.default, {
                    schema: this.props.schema,
                    dataSource: this.props.dataSource,
                    variables: this.props.variables,
                    onChange: this.props.onSelect,
                    table: this.props.table,
                    types: this.props.types,
                    allowCase: this.props.allowCase,
                    enumValues: this.props.enumValues,
                    idTable: this.props.idTable,
                    aggrStatuses: this.props.aggrStatuses
                })
            });
        }
        if (table || this.props.aggrStatuses.includes("literal")) {
            tabs.push({
                id: "formula",
                label: [R("i", { className: "fa fa-calculator" }), " Formula"],
                elem: R(SelectFormulaExprComponent_1.default, {
                    table: this.props.table,
                    onChange: this.props.onSelect,
                    types: this.props.types,
                    allowCase: this.props.allowCase,
                    aggrStatuses: this.props.aggrStatuses,
                    enumValues: this.props.enumValues,
                    locale: this.context.locale
                })
            });
        }
        if (this.props.aggrStatuses.includes("literal")) {
            tabs.push({
                id: "literal",
                label: [R("i", { className: "fa fa-pencil" }), " Value"],
                elem: R(SelectLiteralExprComponent_1.default, {
                    value: this.props.value,
                    onChange: this.props.onSelect,
                    onCancel: this.props.onCancel,
                    schema: this.props.schema,
                    dataSource: this.props.dataSource,
                    types: this.props.booleanOnly ? ["boolean"] : this.props.types,
                    enumValues: this.props.enumValues,
                    idTable: this.props.idTable,
                    refExpr: this.props.refExpr
                })
            });
        }
        if ((this.props.variables || []).length > 0) {
            tabs.push({
                id: "variables",
                label: ["Variables"],
                elem: R(SelectVariableExprComponent_1.default, {
                    value: this.props.value,
                    variables: this.props.variables,
                    onChange: this.props.onSelect,
                    types: this.props.types,
                    enumValues: this.props.enumValues,
                    idTable: this.props.idTable
                })
            });
        }
        return R("div", null, R("h5", null, "Select Field, Formula or Value"), R(TabbedComponent_1.default, {
            tabs,
            initialTabId: table ? this.props.initialMode : "literal"
        }));
    }
    render() {
        return R(ModalWindowComponent_1.default, {
            isOpen: true,
            onRequestClose: this.props.onCancel
        }, this.renderContents());
    }
}
exports.default = SelectExprModalComponent;
SelectExprModalComponent.contextTypes = { locale: prop_types_1.default.string };
SelectExprModalComponent.defaultProps = {
    placeholder: "Select...",
    initialMode: "field",
    aggrStatuses: ["individual", "literal"]
};
