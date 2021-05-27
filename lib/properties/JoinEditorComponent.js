"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JoinEditorComponent = void 0;
const lodash_1 = __importDefault(require("lodash"));
const mwater_expressions_1 = require("mwater-expressions");
const react_1 = require("react");
const react_2 = __importDefault(require("react"));
const bootstrap_1 = require("react-library/lib/bootstrap");
/** Edits a join, preferring a simple inverse select dropdown, but allowing advanced mode */
exports.JoinEditorComponent = (props) => {
    const { join, onChange, schema, fromTableId } = props;
    // Always present
    const partialJoin = join || {};
    // Determine if standard 1-n join (all fields exactly as 1-n to an existing id)
    const inverse = join && (join.type == "1-n") && join.toTable && join.inverse ? schema.getColumn(join.toTable, join.inverse) : null;
    const fromTable = schema.getTable(fromTableId);
    const isStandard1toN = join && inverse && fromTable && inverse.type == "id" && !inverse.jsonql && inverse.idTable == fromTableId
        && join.toColumn == inverse.id && join.fromColumn == fromTable.primaryKey && !join.jsonql;
    /** Manual toggle to advanced mode */
    const [forceAdvanced, setForceAdvanced] = react_1.useState(false);
    /** Manual toggle for JsonQL mode (very advanced joins) */
    const [forceJsonQLMode, setForceJsonQLMode] = react_1.useState(false);
    const handleReset = () => {
        setForceAdvanced(false);
        onChange(undefined);
    };
    // Determine if in JsonQL mode
    const jsonQLMode = forceJsonQLMode || (join && join.jsonql);
    // Advanced mode if forced, or exists and is non-standard, or no from table
    if (forceAdvanced || !fromTable || (join && !isStandard1toN)) {
        return react_2.default.createElement("div", null,
            react_2.default.createElement("button", { type: "button", className: "btn btn-xs btn-link", style: { float: "right" }, onClick: handleReset }, "Reset"),
            react_2.default.createElement(bootstrap_1.FormGroup, { key: "type", label: "Type" },
                react_2.default.createElement(bootstrap_1.Toggle, { value: partialJoin.type, options: [
                        { value: "1-n", label: "One to many" },
                        { value: "n-1", label: "Many to one" },
                        { value: "n-n", label: "Many to many" },
                        { value: "1-1", label: "One to one" }
                    ], onChange: type => onChange(lodash_1.default.extend({}, partialJoin, { type: type })) })),
            react_2.default.createElement(bootstrap_1.FormGroup, { key: "toTable", label: "To Table" },
                react_2.default.createElement(bootstrap_1.TextInput, { value: partialJoin.toTable || "", onChange: toTable => onChange(lodash_1.default.extend({}, partialJoin, { toTable: toTable })) })),
            jsonQLMode ?
                react_2.default.createElement("div", null,
                    react_2.default.createElement("button", { type: "button", className: "btn btn-xs btn-link", style: { float: "right" }, onClick: () => {
                            setForceJsonQLMode(false);
                            onChange(lodash_1.default.omit(partialJoin, "jsonql"));
                        } }, "Normal Mode"),
                    react_2.default.createElement(JsonQLEditor, { jsonql: partialJoin.jsonql, onChange: jsonql => { onChange(lodash_1.default.extend({}, partialJoin, { jsonql: jsonql })); } }))
                :
                    react_2.default.createElement("div", null,
                        react_2.default.createElement("button", { type: "button", className: "btn btn-xs btn-link", style: { float: "right" }, onClick: () => setForceJsonQLMode(true) }, "JsonQL Mode"),
                        react_2.default.createElement(bootstrap_1.FormGroup, { key: "fromColumn", label: "From Column", hint: "JsonQL-level column, not schema column" },
                            react_2.default.createElement(bootstrap_1.TextInput, { value: partialJoin.fromColumn || "", onChange: fromColumn => onChange(lodash_1.default.extend({}, partialJoin, { fromColumn: fromColumn })) })),
                        react_2.default.createElement(bootstrap_1.FormGroup, { key: "toColumn", label: "To Column", hint: "JsonQL-level column, not schema column" },
                            react_2.default.createElement(bootstrap_1.TextInput, { value: partialJoin.toColumn || "", onChange: toColumn => onChange(lodash_1.default.extend({}, partialJoin, { toColumn: toColumn })) }))),
            join && join.type == "1-n" ?
                react_2.default.createElement(bootstrap_1.FormGroup, { key: "inverse", label: "Inverse. Column (schema, not physical) in 'To Table' that is the reverse of this join. Optional" },
                    react_2.default.createElement(bootstrap_1.TextInput, { value: partialJoin.inverse || "", onChange: inverse => onChange(lodash_1.default.extend({}, partialJoin, { inverse: inverse })), emptyNull: true }))
                : null);
    }
    // --- Simple mode
    // Create list of inverses
    const inverseOptions = [];
    for (const table of lodash_1.default.sortBy(schema.getTables(), t => mwater_expressions_1.ExprUtils.localizeString(t.name))) {
        for (const column of schema.getColumns(table.id)) {
            // If is simple id with idTable of this table
            if (column.type == "id" && column.idTable == fromTableId && !column.jsonql) {
                inverseOptions.push({
                    value: { table: table.id, column: column.id },
                    label: `Inverse of ${mwater_expressions_1.ExprUtils.localizeString(table.name)}: ${mwater_expressions_1.ExprUtils.localizeString(column.name)}`
                });
            }
        }
    }
    const handleSelectInverse = (value) => {
        props.onChange({
            type: "1-n",
            toTable: value.table,
            fromColumn: fromTable.primaryKey,
            toColumn: value.column,
            inverse: value.column
        });
    };
    return react_2.default.createElement("div", null,
        react_2.default.createElement("button", { type: "button", className: "btn btn-xs btn-link", style: { float: "right" }, onClick: () => setForceAdvanced(true) }, "Advanced"),
        react_2.default.createElement(bootstrap_1.Select, { options: inverseOptions, value: join ? { table: join.toTable, column: join.toColumn } : null, nullLabel: "Select inverse", onChange: handleSelectInverse }));
};
function JsonQLEditor(props) {
    const [text, setText] = react_1.useState(() => {
        return props.jsonql ? JSON.stringify(props.jsonql, null, 2) : "";
    });
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
        const t = ev.target.value;
        setText(t);
        // Attempt to parse
        if (isValid(t)) {
            props.onChange(t ? JSON.parse(t) : undefined);
        }
    }
    return react_2.default.createElement(bootstrap_1.FormGroup, { label: "JsonQL expression for join. Use {to} and {from} as table aliases" },
        react_2.default.createElement("textarea", { rows: 10, className: "form-control", value: text, onChange: handleChange, style: isValid(text) ? {} : { backgroundColor: "#FFEEEE" } }));
}
