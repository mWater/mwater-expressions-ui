"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const extensions_1 = require("./extensions");
const mwater_expressions_1 = require("mwater-expressions");
class SelectFormulaExprComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.handleSearchTextChange = (ev) => {
            return this.setState({ searchText: ev.target.value });
        };
        this.handleIfSelected = () => {
            const ifExpr = {
                type: "case",
                cases: [{ when: null, then: null }],
                else: null
            };
            if (this.props.table) {
                ifExpr.table = this.props.table;
            }
            return this.props.onChange(ifExpr);
        };
        this.handleScoreSelected = () => {
            const scoreExpr = {
                type: "score",
                input: null,
                scores: {}
            };
            if (this.props.table) {
                scoreExpr.table = this.props.table;
            }
            return this.props.onChange(scoreExpr);
        };
        this.handleBuildEnumsetSelected = () => {
            const expr = {
                type: "build enumset",
                values: {}
            };
            if (this.props.table) {
                expr.table = this.props.table;
            }
            return this.props.onChange(expr);
        };
        this.handleOpSelected = (op) => {
            const expr = {
                type: "op",
                op,
                exprs: []
            };
            if (this.props.table) {
                expr.table = this.props.table;
            }
            return this.props.onChange(expr);
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
        let filter;
        if (this.state.searchText) {
            filter = new RegExp(lodash_1.default.escapeRegExp(this.state.searchText), "i");
        }
        // Create list of formula
        let items = [];
        // Add if statement (unless boolean only, in which case if/thens cause problems by returning null)
        if (this.props.allowCase) {
            items.push({
                name: "If/then",
                desc: "Choose different values based on a condition",
                onClick: this.handleIfSelected
            });
        }
        // Add score if has number possible
        if (!this.props.types || this.props.types.includes("number")) {
            items.push({
                name: "Score",
                desc: "Assign scores to different choices of a field and find total.",
                onClick: this.handleScoreSelected
            });
        }
        // Only allow aggregate expressions if relevant
        let aggr = null;
        if (!this.props.aggrStatuses.includes("aggregate")) {
            aggr = false;
        }
        // Add ops that are prefix ones (like "latitude of")
        const exprUtils = new mwater_expressions_1.ExprUtils(this.props.schema);
        const opItems = exprUtils.findMatchingOpItems({ resultTypes: this.props.types, prefix: true, aggr });
        for (let opItem of lodash_1.default.uniq(opItems, "op")) {
            items.push({ name: opItem.name, desc: opItem.desc, onClick: this.handleOpSelected.bind(null, opItem.op) });
        }
        // Add build enumset if has enumset possible and has values
        if ((!this.props.types || this.props.types.includes("enumset")) &&
            this.props.enumValues &&
            this.props.enumValues.length > 0) {
            items.push({
                name: "Build enumset",
                desc: "Advanced: Create a multi-choice answer based on conditions",
                onClick: this.handleBuildEnumsetSelected
            });
        }
        // Add extensions
        for (let exprUIExtension of extensions_1.getExprUIExtensions()) {
            ;
            ((exprUIExtension) => {
                // Filter types
                if (exprUIExtension.types &&
                    this.props.types &&
                    lodash_1.default.intersection(exprUIExtension.types, this.props.types).length === 0) {
                    return;
                }
                // Filter aggr
                if (lodash_1.default.intersection(exprUIExtension.aggrStatuses, this.props.aggrStatuses || ["individual", "literal"]).length ===
                    0) {
                    return;
                }
                if (exprUIExtension.table && exprUIExtension.table !== this.props.table) {
                    return;
                }
                return items.push({
                    name: mwater_expressions_1.ExprUtils.localizeString(exprUIExtension.name, this.props.locale),
                    desc: mwater_expressions_1.ExprUtils.localizeString(exprUIExtension.desc, this.props.locale),
                    onClick: () => this.props.onChange(exprUIExtension.createDefaultExpr(this.props.table))
                });
            })(exprUIExtension);
        }
        if (this.state.searchText) {
            filter = new RegExp(lodash_1.default.escapeRegExp(this.state.searchText), "i");
            items = lodash_1.default.filter(items, (item) => item.name.match(filter) || item.desc.match(filter));
        }
        return R("div", null, R("input", {
            ref: (c) => {
                return (this.searchComp = c);
            },
            type: "text",
            placeholder: "Search Formulas...",
            className: "form-control input-lg",
            value: this.state.searchText,
            onChange: this.handleSearchTextChange
        }), 
        // Create list
        R("div", { style: { paddingTop: 10 } }, lodash_1.default.map(items, (item) => {
            return R("div", {
                key: item.name,
                style: {
                    padding: 4,
                    borderRadius: 4,
                    cursor: "pointer",
                    color: "#478"
                },
                className: "hover-grey-background",
                onClick: item.onClick
            }, item.name, item.desc
                ? R("span", { className: "text-muted", style: { fontSize: 12, paddingLeft: 3 } }, " - " + item.desc)
                : undefined);
        })));
    }
}
exports.default = SelectFormulaExprComponent;
