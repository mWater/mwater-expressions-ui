"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prop_types_1 = __importDefault(require("prop-types"));
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const mwater_expressions_1 = require("mwater-expressions");
const ExprElementBuilder_1 = __importDefault(require("./ExprElementBuilder"));
// Display/editor component for an expression
// Uses ExprElementBuilder to create the tree of components
// Cleans expression as a convenience
class ExprComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        // Opens the editor popup. Only works if expression is blank
        this.openEditor = () => {
            var _a;
            return (_a = this.exprLink) === null || _a === void 0 ? void 0 : _a.showModal();
        };
        // Clean expression and pass up
        this.handleChange = (expr) => {
            return this.props.onChange(this.cleanExpr(expr));
        };
    }
    // Cleans an expression
    cleanExpr(expr) {
        return new mwater_expressions_1.ExprCleaner(this.props.schema, this.props.variables).cleanExpr(expr, {
            table: this.props.table,
            types: this.props.types,
            enumValueIds: this.props.enumValues ? lodash_1.default.pluck(this.props.enumValues, "id") : undefined,
            idTable: this.props.idTable,
            aggrStatuses: !this.props.table ? ["literal"] : this.props.aggrStatuses || ["individual", "literal"]
        });
    }
    render() {
        const expr = this.cleanExpr(this.props.value);
        return new ExprElementBuilder_1.default(this.props.schema, this.props.dataSource, this.context.locale, this.props.variables).build(expr, this.props.table, this.props.onChange ? this.handleChange : undefined, {
            types: this.props.types,
            enumValues: this.props.enumValues,
            preferLiteral: this.props.preferLiteral,
            idTable: this.props.idTable,
            includeAggr: (this.props.aggrStatuses || ["individual", "literal"]).includes("aggregate"),
            aggrStatuses: !this.props.table ? ["literal"] : this.props.aggrStatuses || ["individual", "literal"],
            placeholder: this.props.placeholder,
            refExpr: this.props.refExpr,
            // If no expression, pass a ref to use so that the expression editor can be opened
            exprLinkRef: !expr
                ? (c) => {
                    return (this.exprLink = c);
                }
                : undefined
        });
    }
}
exports.default = ExprComponent;
ExprComponent.contextTypes = { locale: prop_types_1.default.string };
