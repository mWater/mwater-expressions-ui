"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const async_1 = __importDefault(require("react-select/async"));
const mwater_expressions_1 = require("mwater-expressions");
// Displays a combo box that allows selecting multiple text values from an expression
class TextArrayComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleChange = (value) => {
            if (value && value.length > 0) {
                return this.props.onChange({ type: "literal", valueType: "text[]", value: lodash_1.default.pluck(value, "label") });
            }
            else {
                return this.props.onChange(null);
            }
        };
        this.loadOptions = (input, cb) => {
            // Create query to get matches ordered by most frequent to least
            const exprCompiler = new mwater_expressions_1.ExprCompiler(this.props.schema);
            // select <compiled expr> as value, count(*) as number from <table> where <compiled expr> like 'input%' group by value order by number desc limit 50
            const query = {
                type: "query",
                selects: [
                    {
                        type: "select",
                        expr: exprCompiler.compileExpr({ expr: this.props.refExpr, tableAlias: "main" }),
                        alias: "value"
                    },
                    { type: "select", expr: { type: "op", op: "count", exprs: [] }, alias: "number" }
                ],
                from: exprCompiler.compileTable(this.props.refExpr.table, "main"),
                where: {
                    type: "op",
                    op: "~*",
                    exprs: [
                        exprCompiler.compileExpr({ expr: this.props.refExpr, tableAlias: "main" }),
                        "^" + this.escapeRegex(input)
                    ]
                },
                groupBy: [1],
                orderBy: [
                    { ordinal: 2, direction: "desc" },
                    { ordinal: 1, direction: "asc" }
                ],
                limit: 50
            };
            // Execute query
            this.props.dataSource.performQuery(query, (err, rows) => {
                if (err) {
                    return;
                }
                // Filter null and blank
                rows = lodash_1.default.filter(rows, (r) => r.value);
                return cb(lodash_1.default.map(rows, (r) => ({
                    value: r.value,
                    label: r.value
                })));
            });
        };
    }
    focus() {
        return this.select.focus();
    }
    escapeRegex(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    }
    render() {
        var _a;
        const value = lodash_1.default.map((_a = this.props.value) === null || _a === void 0 ? void 0 : _a.value, (v) => ({ label: v, value: v }));
        return R("div", { style: { width: "100%" } }, R(async_1.default, {
            ref: (c) => {
                return (this.select = c);
            },
            value,
            isMulti: true,
            placeholder: "Select...",
            defaultOptions: true,
            loadOptions: this.loadOptions,
            onChange: this.handleChange
        }));
    }
}
exports.default = TextArrayComponent;
