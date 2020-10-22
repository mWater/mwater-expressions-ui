"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JoinEditorComponent = void 0;
var lodash_1 = __importDefault(require("lodash"));
var mwater_expressions_1 = require("mwater-expressions");
var react_1 = require("react");
var react_2 = __importDefault(require("react"));
var bootstrap_1 = require("react-library/lib/bootstrap");
/** Edits a join, preferring a simple inverse select dropdown, but allowing advanced mode */
exports.JoinEditorComponent = function (props) {
    var join = props.join, onChange = props.onChange, schema = props.schema, fromTableId = props.fromTableId;
    // Always present
    var partialJoin = join || {};
    // Determine if standard 1-n join (all fields exactly as 1-n to an existing id)
    var inverse = join && (join.type == "1-n") && join.toTable && join.inverse ? schema.getColumn(join.toTable, join.inverse) : null;
    var fromTable = schema.getTable(fromTableId);
    var isStandard1toN = join && inverse && fromTable && inverse.type == "id" && !inverse.jsonql && inverse.idTable == fromTableId
        && join.toColumn == inverse.id && join.fromColumn == fromTable.primaryKey && !join.jsonql;
    /** Manual toggle to advanced mode */
    var _a = react_1.useState(false), forceAdvanced = _a[0], setForceAdvanced = _a[1];
    /** Manual toggle for JsonQL mode (very advanced joins) */
    var _b = react_1.useState(false), forceJsonQLMode = _b[0], setForceJsonQLMode = _b[1];
    var handleReset = function () {
        setForceAdvanced(false);
        onChange(undefined);
    };
    // Determine if in JsonQL mode
    var jsonQLMode = forceJsonQLMode || (join && join.jsonql);
    // Advanced mode if forced, or exists and is non-standard, or no from table
    if (forceAdvanced || !fromTable || (join && !isStandard1toN)) {
        return react_2.default.createElement("div", null,
            react_2.default.createElement("button", { type: "button", className: "btn btn-xs btn-link", style: { float: "right" }, onClick: handleReset }, "Reset"),
            react_2.default.createElement(bootstrap_1.FormGroup, { key: "type", label: "Type" },
                react_2.default.createElement(bootstrap_1.Toggle, { value: partialJoin.type, options: [
                        { value: "1-n", label: "One to many" },
                        { value: "n-1", label: "Many to one" },
                        { value: "n-n", label: "Many to many" },
                        { value: "1-1", label: "one to one" }
                    ], onChange: function (type) { return onChange(lodash_1.default.extend({}, partialJoin, { type: type })); } })),
            react_2.default.createElement(bootstrap_1.FormGroup, { key: "toTable", label: "To Table" },
                react_2.default.createElement(bootstrap_1.TextInput, { value: partialJoin.toTable || "", onChange: function (toTable) { return onChange(lodash_1.default.extend({}, partialJoin, { toTable: toTable })); } })),
            jsonQLMode ?
                react_2.default.createElement("div", null,
                    react_2.default.createElement("button", { type: "button", className: "btn btn-xs btn-link", style: { float: "right" }, onClick: function () {
                            setForceJsonQLMode(false);
                            onChange(lodash_1.default.omit(partialJoin, "jsonql"));
                        } }, "Normal Mode"),
                    react_2.default.createElement(JsonQLEditor, { jsonql: partialJoin.jsonql, onChange: function (jsonql) { onChange(lodash_1.default.extend({}, partialJoin, { jsonql: jsonql })); } }))
                :
                    react_2.default.createElement("div", null,
                        react_2.default.createElement("button", { type: "button", className: "btn btn-xs btn-link", style: { float: "right" }, onClick: function () { return setForceJsonQLMode(true); } }, "JsonQL Mode"),
                        react_2.default.createElement(bootstrap_1.FormGroup, { key: "fromColumn", label: "From Column", hint: "JsonQL-level column, not schema column" },
                            react_2.default.createElement(bootstrap_1.TextInput, { value: partialJoin.fromColumn || "", onChange: function (fromColumn) { return onChange(lodash_1.default.extend({}, partialJoin, { fromColumn: fromColumn })); } })),
                        react_2.default.createElement(bootstrap_1.FormGroup, { key: "toColumn", label: "To Column", hint: "JsonQL-level column, not schema column" },
                            react_2.default.createElement(bootstrap_1.TextInput, { value: partialJoin.toColumn || "", onChange: function (toColumn) { return onChange(lodash_1.default.extend({}, partialJoin, { toColumn: toColumn })); } }))),
            join && join.type == "1-n" ?
                react_2.default.createElement(bootstrap_1.FormGroup, { key: "inverse", label: "Inverse. Column (schema, not physical) in 'To Table' that is the reverse of this join. Optional" },
                    react_2.default.createElement(bootstrap_1.TextInput, { value: partialJoin.inverse || "", onChange: function (inverse) { return onChange(lodash_1.default.extend({}, partialJoin, { inverse: inverse })); }, emptyNull: true }))
                : null);
    }
    // --- Simple mode
    // Create list of inverses
    var inverseOptions = [];
    for (var _i = 0, _c = lodash_1.default.sortBy(schema.getTables(), function (t) { return mwater_expressions_1.ExprUtils.localizeString(t.name); }); _i < _c.length; _i++) {
        var table = _c[_i];
        for (var _d = 0, _e = schema.getColumns(table.id); _d < _e.length; _d++) {
            var column = _e[_d];
            // If is simple id with idTable of this table
            if (column.type == "id" && column.idTable == fromTableId && !column.jsonql) {
                inverseOptions.push({
                    value: { table: table.id, column: column.id },
                    label: "Inverse of " + mwater_expressions_1.ExprUtils.localizeString(table.name) + ": " + mwater_expressions_1.ExprUtils.localizeString(column.name)
                });
            }
        }
    }
    var handleSelectInverse = function (value) {
        props.onChange({
            type: "1-n",
            toTable: value.table,
            fromColumn: fromTable.primaryKey,
            toColumn: value.column,
            inverse: value.column
        });
    };
    return react_2.default.createElement("div", null,
        react_2.default.createElement("button", { type: "button", className: "btn btn-xs btn-link", style: { float: "right" }, onClick: function () { return setForceAdvanced(true); } }, "Advanced"),
        react_2.default.createElement(bootstrap_1.Select, { options: inverseOptions, value: join ? { table: join.toTable, column: join.toColumn } : null, nullLabel: "Select inverse", onChange: handleSelectInverse }));
};
function JsonQLEditor(props) {
    var _a = react_1.useState(function () {
        return props.jsonql ? JSON.stringify(props.jsonql, null, 2) : "";
    }), text = _a[0], setText = _a[1];
    function isValid(t) {
        if (!t) {
            return true;
        }
        try {
            JSON.parse(t);
            return true;
        }
        catch (err) {
            return false;
        }
    }
    function handleChange(ev) {
        var t = ev.target.value;
        setText(t);
        // Attempt to parse
        if (isValid(t)) {
            props.onChange(t ? JSON.parse(t) : undefined);
        }
    }
    return react_2.default.createElement(bootstrap_1.FormGroup, { label: "JsonQL expression for join. Use {to} and {from} as table aliases" },
        react_2.default.createElement("textarea", { rows: 10, className: "form-control", value: text, onChange: handleChange, style: isValid(text) ? {} : { backgroundColor: "#FFEEEE" } }));
}
