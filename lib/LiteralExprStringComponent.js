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
const AsyncLoadComponent_1 = __importDefault(require("react-library/lib/AsyncLoadComponent"));
// Displays a literal expression as a string. Simple for non-id types. For id types, loads using a query
class LiteralExprStringComponent extends AsyncLoadComponent_1.default {
    // Override to determine if a load is needed. Not called on mounting
    isLoadNeeded(newProps, oldProps) {
        return !lodash_1.default.isEqual(newProps.value, oldProps.value);
    }
    // Call callback with state changes
    load(props, prevProps, callback) {
        // If no value or not id, id[]
        let labelColumn;
        if (!props.value || !["id", "id[]"].includes(props.value.valueType)) {
            callback({ label: null });
            return;
        }
        // Create query to get current value
        const table = props.schema.getTable(props.value.idTable);
        // Primary key column
        const idColumn = { type: "field", tableAlias: "main", column: table.primaryKey };
        if (table.label) {
            labelColumn = { type: "field", tableAlias: "main", column: table.label };
        }
        else {
            // Use primary key. Ugly, but what else to do?
            labelColumn = idColumn;
        }
        const query = {
            type: "query",
            selects: [{ type: "select", expr: labelColumn, alias: "label" }],
            from: { type: "table", table: table.id, alias: "main" },
            where: {
                type: "op",
                op: "=",
                modifier: "any",
                exprs: [
                    idColumn,
                    { type: "literal", value: props.value.valueType === "id[]" ? props.value.value : [props.value.value] }
                ]
            }
        };
        // Execute query
        return props.dataSource.performQuery(query, (err, rows) => {
            if (err || !rows[0]) {
                callback({ label: "(error)" });
                return;
            }
            if (props.value.valueType === "id") {
                return callback({ label: rows[0].label });
            }
            else {
                return callback({ label: lodash_1.default.pluck(rows, "label").join(", ") || "None" });
            }
        });
    }
    render() {
        var _a, _b;
        let str;
        const exprUtils = new mwater_expressions_1.ExprUtils(this.props.schema);
        const type = (_a = this.props.value) === null || _a === void 0 ? void 0 : _a.valueType;
        // Handle simple case
        if (!["id", "id[]"].includes(type)) {
            str = exprUtils.stringifyLiteralValue(type, (_b = this.props.value) === null || _b === void 0 ? void 0 : _b.value, this.props.locale || this.context.locale, this.props.enumValues);
            // Quote text
            if (type === "text") {
                str = '"' + str + '"';
            }
        }
        else {
            if (this.state.loading) {
                str = "...";
            }
            else {
                str = this.state.label;
            }
        }
        return R("span", null, str);
    }
}
exports.default = LiteralExprStringComponent;
LiteralExprStringComponent.contextTypes = { locale: prop_types_1.default.string };
