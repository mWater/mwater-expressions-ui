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
// Build enumset
class BuildEnumsetExprComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleValueChange = (id, value) => {
            const values = lodash_1.default.clone(this.props.value.values);
            values[id] = value;
            return this.props.onChange(lodash_1.default.extend({}, this.props.value, { values }));
        };
    }
    renderValues() {
        const exprUtils = new mwater_expressions_1.ExprUtils(this.props.schema);
        return R("table", { className: "table table-bordered" }, R("thead", null, R("tr", null, R("th", { key: "name" }, "Choice"), 
        // R 'th', key: "arrow"
        R("th", { key: "include" }, "Include if"))), R("tbody", null, lodash_1.default.map(this.props.enumValues, (enumValue) => {
            return R("tr", { key: enumValue.id }, 
            // Name of value
            R("td", { key: "name" }, exprUtils.localizeString(enumValue.name, this.context.locale)), 
            // R 'td', key: "arrow",
            //   R 'span', className: "glyphicon glyphicon-arrow-right"
            // Boolean condition
            R("td", { key: "value", style: { maxWidth: "30em" } }, R(ExprComponent_1.default, {
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                table: this.props.value.table,
                value: this.props.value.values[enumValue.id],
                onChange: this.handleValueChange.bind(null, enumValue.id),
                types: ["boolean"]
            })));
        })));
    }
    render() {
        return R(RemovableComponent_1.default, { onRemove: this.props.onChange.bind(null, null) }, this.props.enumValues ? this.renderValues() : R("i", null, "Cannot display build enumset without known values"));
    }
}
exports.default = BuildEnumsetExprComponent;
BuildEnumsetExprComponent.contextTypes = { locale: prop_types_1.default.string };
