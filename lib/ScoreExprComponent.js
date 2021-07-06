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
const RemovableComponent_1 = __importDefault(require("./RemovableComponent"));
const ExprComponent_1 = __importDefault(require("./ExprComponent"));
// Score
class ScoreExprComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleInputChange = (expr) => {
            return this.props.onChange(lodash_1.default.extend({}, this.props.value, { input: expr }));
        };
        this.handleScoreChange = (id, value) => {
            const scores = lodash_1.default.clone(this.props.value.scores);
            scores[id] = value;
            return this.props.onChange(lodash_1.default.extend({}, this.props.value, { scores }));
        };
    }
    renderScores() {
        const exprUtils = new mwater_expressions_1.ExprUtils(this.props.schema);
        // Get enum values
        const enumValues = exprUtils.getExprEnumValues(this.props.value.input);
        if (!enumValues) {
            return null;
        }
        return R("table", { className: "table table-bordered" }, R("thead", null, R("tr", null, R("th", { key: "name" }, "Choice"), 
        // R 'th', key: "arrow"
        R("th", { key: "score" }, "Score"))), R("tbody", null, lodash_1.default.map(enumValues, (enumValue) => {
            return R("tr", { key: enumValue.id }, 
            // Name of value
            R("td", { key: "name" }, exprUtils.localizeString(enumValue.name, this.context.locale)), 
            // R 'td', key: "arrow",
            //   R 'span', className: "glyphicon glyphicon-arrow-right"
            // Score
            R("td", { key: "score", style: { maxWidth: "20em" } }, R(ExprComponent_1.default, {
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                table: this.props.value.table,
                value: this.props.value.scores[enumValue.id],
                onChange: this.props.onChange ? this.handleScoreChange.bind(null, enumValue.id) : undefined,
                types: ["number"],
                preferLiteral: true
            })));
        })));
    }
    render() {
        return R(RemovableComponent_1.default, { onRemove: this.props.onChange ? this.props.onChange.bind(null, null) : undefined }, R("div", null, "Score choices of: ", R("div", { style: { display: "inline-block", maxWidth: "50em" } }, R(ExprComponent_1.default, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            table: this.props.value.table,
            value: this.props.value.input,
            onChange: this.props.onChange ? this.handleInputChange : undefined,
            types: ["enum", "enumset"]
        }))), this.renderScores());
    }
}
exports.default = ScoreExprComponent;
ScoreExprComponent.contextTypes = { locale: prop_types_1.default.string };
