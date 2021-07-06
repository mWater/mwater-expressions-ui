"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prop_types_1 = __importDefault(require("prop-types"));
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const ScalarExprTreeComponent_1 = __importDefault(require("./ScalarExprTreeComponent"));
const ScalarExprTreeBuilder_1 = __importDefault(require("./ScalarExprTreeBuilder"));
const mwater_expressions_1 = require("mwater-expressions");
class SelectFieldExprComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.handleSearchTextChange = (ev) => {
            return this.setState({ searchText: ev.target.value });
        };
        // Handle a selection in the scalar expression tree. Called with { table, joins, expr }
        this.handleTreeChange = (val) => {
            // Loses focus when selection made
            this.setState({ focused: false });
            let { expr } = val;
            const exprUtils = new mwater_expressions_1.ExprUtils(this.props.schema);
            // If expr is enum and enumValues specified, perform a mapping
            if (exprUtils.getExprType(val.expr) === "enum" && this.props.enumValues) {
                expr = {
                    type: "case",
                    table: expr.table,
                    cases: lodash_1.default.map(this.props.enumValues, (ev) => {
                        // Find matching name (english)
                        let literal;
                        const fromEnumValues = exprUtils.getExprEnumValues(expr);
                        const matchingEnumValue = lodash_1.default.find(fromEnumValues, (fev) => fev.name.en === ev.name.en);
                        if (matchingEnumValue) {
                            literal = { type: "literal", valueType: "enumset", value: [matchingEnumValue.id] };
                        }
                        else {
                            literal = null;
                        }
                        return {
                            when: { type: "op", table: expr.table, op: "= any", exprs: [expr, literal] },
                            then: { type: "literal", valueType: "enum", value: ev.id }
                        };
                    }),
                    else: null
                };
            }
            // If expr is enumset and enumValues specified, perform a mapping building an enumset
            if (exprUtils.getExprType(val.expr) === "enumset" && this.props.enumValues) {
                const buildExpr = {
                    type: "build enumset",
                    table: expr.table,
                    values: {}
                };
                for (var ev of this.props.enumValues) {
                    // Find matching name (english)
                    var literal;
                    const fromEnumValues = exprUtils.getExprEnumValues(expr);
                    const matchingEnumValue = lodash_1.default.find(fromEnumValues, (fev) => fev.name.en === ev.name.en);
                    if (matchingEnumValue) {
                        literal = { type: "literal", valueType: "enumset", value: [matchingEnumValue.id] };
                    }
                    else {
                        literal = null;
                    }
                    buildExpr.values[ev.id] = { type: "op", table: expr.table, op: "contains", exprs: [expr, literal] };
                }
                expr = buildExpr;
            }
            // Make into expression
            if (val.joins.length === 0) {
                // Simple field expression
                return this.props.onChange(expr);
            }
            else {
                return this.props.onChange({ type: "scalar", table: this.props.table, joins: val.joins, expr });
            }
        };
        this.state = {
            searchText: ""
        };
    }
    componentDidMount() {
        var _a;
        return (_a = this.searchComp) === null || _a === void 0 ? void 0 : _a.focus();
    }
    render() {
        // Create tree
        const treeBuilder = new ScalarExprTreeBuilder_1.default(this.props.schema, {
            locale: this.context.locale,
            isScalarExprTreeSectionMatch: this.context.isScalarExprTreeSectionMatch,
            isScalarExprTreeSectionInitiallyOpen: this.context.isScalarExprTreeSectionInitiallyOpen,
            variables: this.props.variables
        });
        const tree = treeBuilder.getTree({
            table: this.props.table,
            types: this.props.types,
            idTable: this.props.idTable,
            includeAggr: this.props.aggrStatuses.includes("aggregate"),
            filter: this.state.searchText
        });
        return R("div", null, R("input", {
            ref: (c) => {
                return (this.searchComp = c);
            },
            type: "text",
            placeholder: "Search Fields...",
            className: "form-control input-lg",
            value: this.state.searchText,
            onChange: this.handleSearchTextChange
        }), 
        // Create tree component with value of table and path
        R("div", { style: { paddingTop: 10, paddingBottom: 200 } }, R(ScalarExprTreeComponent_1.default, {
            tree,
            onChange: this.handleTreeChange,
            filter: this.state.searchText
        })));
    }
}
exports.default = SelectFieldExprComponent;
SelectFieldExprComponent.contextTypes = {
    locale: prop_types_1.default.string,
    // Function to override initial open state of a section. Passed { tableId: id of table, section: section object from schema, filter: optional string filter }
    // Should return true to set initially open
    isScalarExprTreeSectionInitiallyOpen: prop_types_1.default.func,
    // Function to override filtering of a section. Passed { tableId: id of table, section: section object from schema, filter: optional string filter }
    // Should return null for default, true to include, false to exclude
    isScalarExprTreeSectionMatch: prop_types_1.default.func
};
