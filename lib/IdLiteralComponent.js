"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const async_1 = __importDefault(require("react-select/async"));
const AsyncLoadComponent_1 = __importDefault(require("react-library/lib/AsyncLoadComponent"));
const R = react_1.default.createElement;
// Displays a combo box that allows selecting one or multiple text values from an expression
// Needs two indexes to work fast:
// create index on some_table (label_column);
// create index on some_table (lower(label_column) text_pattern_ops);
class IdLiteralComponent extends AsyncLoadComponent_1.default {
    constructor() {
        super(...arguments);
        this.handleChange = (value) => {
            if (this.props.multi) {
                if (value && value.length === 0) {
                    return this.props.onChange(null);
                }
                else {
                    return this.props.onChange(lodash_1.default.pluck(value, "value"));
                }
            }
            else {
                return this.props.onChange(value === null || value === void 0 ? void 0 : value.value);
            }
        };
        this.loadOptions = (input, cb) => {
            let where;
            const table = this.props.schema.getTable(this.props.idTable);
            // Primary key column
            const idColumn = { type: "field", tableAlias: "main", column: table.primaryKey };
            const labelExpr = this.getLabelExpr();
            if (input) {
                where = {
                    type: "op",
                    op: "like",
                    exprs: [
                        { type: "op", op: "lower", exprs: [labelExpr] },
                        this.props.searchWithin ? "%" + input.toLowerCase() + "%" : input.toLowerCase() + "%"
                    ]
                };
            }
            else {
                where = null;
            }
            // select <label column> as value from <table> where lower(<label column>) like 'input%' limit 50
            const query = {
                type: "query",
                selects: [
                    { type: "select", expr: idColumn, alias: "value" },
                    { type: "select", expr: labelExpr, alias: "label" }
                ],
                from: { type: "table", table: this.props.idTable, alias: "main" },
                where,
                orderBy: [{ ordinal: 2, direction: "asc" }],
                limit: 50
            };
            if (this.props.filter) {
                if (query.where) {
                    query.where = {
                        type: "op",
                        op: "and",
                        exprs: [query.where, this.props.filter]
                    };
                }
                else {
                    query.where = this.props.filter;
                }
            }
            // Add custom orderings
            if (this.props.orderBy) {
                query.orderBy = this.props.orderBy.concat(query.orderBy);
            }
            // Execute query
            this.props.dataSource.performQuery(query, (err, rows) => {
                if (err) {
                    return;
                }
                // Filter null and blank
                rows = lodash_1.default.filter(rows, (r) => r.label);
                return cb(rows);
            });
        };
    }
    focus() {
        return this.select.focus();
    }
    // Override to determine if a load is needed. Not called on mounting
    isLoadNeeded(newProps, oldProps) {
        return newProps.value !== oldProps.value || newProps.idTable !== oldProps.idTable;
    }
    // Call callback with state changes
    load(props, prevProps, callback) {
        // Create query to get current value
        if (!props.value) {
            callback({ currentValue: null });
            return;
        }
        const table = props.schema.getTable(props.idTable);
        // Primary key column
        const idColumn = { type: "field", tableAlias: "main", column: table.primaryKey };
        const labelExpr = this.getLabelExpr();
        const query = {
            type: "query",
            selects: [
                { type: "select", expr: idColumn, alias: "value" },
                { type: "select", expr: labelExpr, alias: "label" }
            ],
            from: { type: "table", table: this.props.idTable, alias: "main" },
            where: {
                type: "op",
                op: "=",
                modifier: "any",
                exprs: [idColumn, { type: "literal", value: props.multi ? props.value : [props.value] }]
            }
        };
        // Execute query
        return props.dataSource.performQuery(query, (err, rows) => {
            if (err || !rows[0]) {
                callback({ currentValue: null });
                return;
            }
            if (!this.props.multi) {
                return callback({ currentValue: rows[0] });
            }
            else {
                return callback({ currentValue: rows });
            }
        });
    }
    getLabelExpr() {
        if (this.props.labelExpr) {
            return this.props.labelExpr;
        }
        const table = this.props.schema.getTable(this.props.idTable);
        if (table.label) {
            return { type: "field", tableAlias: "main", column: table.label };
        }
        // Use primary key. Ugly, but what else to do?. Cast to text.
        return { type: "op", op: "::text", exprs: [{ type: "field", tableAlias: "main", column: table.primaryKey }] };
    }
    render() {
        return R("div", { style: { width: "100%" } }, R(async_1.default, {
            ref: (c) => {
                return (this.select = c);
            },
            value: this.state.currentValue,
            placeholder: this.props.placeholder || "Select",
            loadOptions: this.loadOptions,
            isMulti: this.props.multi,
            isClearable: true,
            isLoading: this.state.loading,
            onChange: this.handleChange,
            noOptionsMessage: () => "Type to search",
            defaultOptions: true,
            closeMenuOnScroll: true,
            menuPortalTarget: document.body,
            styles: {
                // Keep menu above fixed data table headers and map
                menu: (style) => lodash_1.default.extend({}, style, { zIndex: 2000 }),
                menuPortal: (style) => lodash_1.default.extend({}, style, { zIndex: 2000 })
            }
        }));
    }
}
exports.default = IdLiteralComponent;
