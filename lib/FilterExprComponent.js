"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prop_types_1 = __importDefault(require("prop-types"));
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const update_object_1 = __importDefault(require("update-object"));
const mwater_expressions_1 = require("mwater-expressions");
const ExprElementBuilder_1 = __importDefault(require("./ExprElementBuilder"));
const StackedComponent_1 = __importDefault(require("./StackedComponent"));
const RemovableComponent_1 = __importDefault(require("./RemovableComponent"));
const ExprLinkComponent_1 = __importDefault(require("./ExprLinkComponent"));
/** Displays a boolean filter expression. Just shows "+ Add filter" (or other add label) when empty */
class FilterExprComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        // Handle add filter clicked by wrapping in "and" if existing, otherwise adding a null
        this.handleAddFilter = () => {
            // If already "and", add null
            if (this.props.value && this.props.value.type == "op" && this.props.value.op === "and") {
                this.props.onChange((0, update_object_1.default)(this.props.value, { exprs: { $push: [null] } }));
                return;
            }
            // If already has value, wrap in and
            if (this.props.value) {
                this.props.onChange({ type: "op", op: "and", table: this.props.table, exprs: [this.props.value, null] });
                return;
            }
            return this.setState({ displayNull: true }, () => { var _a; return (_a = this.newExpr) === null || _a === void 0 ? void 0 : _a.showModal(); });
        };
        // Clean expression and pass up
        this.handleChange = (expr) => {
            return this.props.onChange(this.cleanExpr(expr));
        };
        // Handle change to a single item
        this.handleAndChange = (i, expr) => {
            return this.handleChange((0, update_object_1.default)(this.props.value, { exprs: { $splice: [[i, 1, expr]] } }));
        };
        this.handleAndRemove = (i) => {
            return this.handleChange((0, update_object_1.default)(this.props.value, { exprs: { $splice: [[i, 1]] } }));
        };
        this.handleRemove = () => {
            this.setState({ displayNull: false });
            return this.handleChange(null);
        };
        this.state = { displayNull: false }; // Set true when initial null value should be displayed
    }
    // Cleans an expression
    cleanExpr(expr) {
        return new mwater_expressions_1.ExprCleaner(this.props.schema, this.props.variables).cleanExpr(expr, {
            table: this.props.table,
            types: ["boolean"]
        });
    }
    renderAddFilter() {
        return R("div", null, R("a", { onClick: this.handleAddFilter, style: { color: "#337ab7" } }, this.props.addLabel));
    }
    render() {
        const expr = this.cleanExpr(this.props.value);
        // Render each item of and
        if (expr && expr.type == "op" && expr.op === "and") {
            return R("div", null, R(StackedComponent_1.default, {
                joinLabel: "and",
                items: lodash_1.default.map(expr.exprs, (subexpr, i) => {
                    return {
                        elem: new ExprElementBuilder_1.default(this.props.schema, this.props.dataSource, this.context.locale, this.props.variables).build(subexpr, this.props.table, this.props.onChange ? this.handleAndChange.bind(null, i) : undefined, {
                            types: ["boolean"],
                            preferLiteral: false,
                            suppressWrapOps: ["and"] // Don't allow wrapping in and since this is an and control
                        }),
                        onRemove: this.props.onChange ? this.handleAndRemove.bind(null, i) : undefined
                    };
                })
            }), 
            // Only display add if last item is not null
            lodash_1.default.last(expr.exprs) !== null && this.props.onChange ? this.renderAddFilter() : undefined);
        }
        else if (expr) {
            return R("div", null, R(RemovableComponent_1.default, { onRemove: this.props.onChange ? this.handleRemove : undefined }, new ExprElementBuilder_1.default(this.props.schema, this.props.dataSource, this.context.locale, this.props.variables).build(expr, this.props.table, this.props.onChange ? this.handleChange : undefined, {
                types: ["boolean"],
                preferLiteral: false,
                suppressWrapOps: ["and"] // Don't allow wrapping in and since this is an and control
            })), 
            // Only display add if has a value
            this.renderAddFilter());
        }
        else if (this.state.displayNull) {
            return R(ExprLinkComponent_1.default, {
                ref: (c) => {
                    return (this.newExpr = c);
                },
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                variables: this.props.variables,
                table: this.props.table,
                onChange: this.props.onChange ? this.handleChange : undefined
            });
        }
        else {
            return this.renderAddFilter();
        }
    }
}
exports.default = FilterExprComponent;
FilterExprComponent.contextTypes = { locale: prop_types_1.default.string };
FilterExprComponent.defaultProps = {
    addLabel: "+ Add Filter",
    variables: []
};
