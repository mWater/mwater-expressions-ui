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
class SelectVariableExprComponent extends react_1.default.Component {
    render() {
        const variables = lodash_1.default.filter(this.props.variables, (variable) => {
            // Filter types
            if (this.props.types && !this.props.types.includes(variable.type)) {
                return false;
            }
            // Filter by idTable
            if (this.props.idTable && variable.idTable && variable.idTable !== this.props.idTable) {
                return false;
            }
            // Filter by enumValues
            if (this.props.enumValues && variable.enumValues) {
                if (lodash_1.default.difference(lodash_1.default.pluck(variable.enumValues, "id"), lodash_1.default.pluck(this.props.enumValues, "id")).length > 0) {
                    return false;
                }
            }
            return true;
        });
        const items = lodash_1.default.map(variables, (variable) => {
            return {
                id: variable.id,
                name: mwater_expressions_1.ExprUtils.localizeString(variable.name, this.context.locale) || "(unnamed)",
                desc: mwater_expressions_1.ExprUtils.localizeString(variable.desc, this.context.locale),
                onClick: () => this.props.onChange({ type: "variable", variableId: variable.id })
            };
        });
        // Create list
        return R("div", { style: { paddingTop: 10 } }, lodash_1.default.map(items, (item) => {
            return R("div", {
                key: item.id,
                style: {
                    padding: 4,
                    borderRadius: 4,
                    cursor: "pointer",
                    color: "var(--bs-primary)"
                },
                className: "hover-grey-background",
                onClick: item.onClick
            }, item.name, item.desc
                ? R("span", { className: "text-muted", style: { fontSize: 12, paddingLeft: 3 } }, " - " + item.desc)
                : undefined);
        }));
    }
}
exports.default = SelectVariableExprComponent;
SelectVariableExprComponent.contextTypes = { locale: prop_types_1.default.string };
