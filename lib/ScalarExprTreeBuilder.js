"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const mwater_expressions_1 = require("mwater-expressions");
// Builds a tree for selecting table + joins + expr of a scalar expression
// Organizes columns, and follows joins
// options:
//   locale: optional locale to use for names
//   isScalarExprTreeSectionInitiallyOpen: optiona function to override initial open state of a section. Passed { tableId: id of table, section: section object from schema, filter: optional string filter }
//     Should return true to set initially open
//   isScalarExprTreeSectionMatch: optiona function to override filtering of a section. Passed { tableId: id of table, section: section object from schema, filter: optional string filter }
//     Should return null for default, true to include, false to exclude
//   variables: list of variables to show
class ScalarExprTreeBuilder {
    constructor(schema, options = {}) {
        this.schema = schema;
        this.locale = options.locale;
        this.isScalarExprTreeSectionInitiallyOpen = options.isScalarExprTreeSectionInitiallyOpen;
        this.isScalarExprTreeSectionMatch = options.isScalarExprTreeSectionMatch;
        this.variables = options.variables || [];
        this.exprUtils = new mwater_expressions_1.ExprUtils(this.schema);
    }
    // Returns array of
    // {
    //   name: name of item,
    //   desc: description of item,
    //   value: { table, joins, expr } - partial scalar expression, null if not selectable node
    //   children: function which returns children nodes
    //   initiallyOpen: true if children should display initially
    //   childrenType: "section", "join"
    //   tableId: table id of current item if applicable
    //   item: column/section object of current item if applicable
    //   key: unique key within sibling list if present
    // }
    // options are:
    //  table: starting table
    //  types: types to limit to
    //  idTable: id type table to limit to
    //  includeAggr: to include aggregate expressions, including an count() option that has name that is "Number of ..." at first table level
    //  initialValue: initial value to flesh out TODO REMOVE
    //  filter: optional string filter
    getTree(options = {}) {
        return this.createTableChildNodes({
            startTable: options.table,
            table: options.table,
            joins: [],
            types: options.types,
            idTable: options.idTable,
            includeAggr: options.includeAggr,
            initialValue: options.initialValue,
            filter: options.filter,
            depth: 0
        });
    }
    // Options:
    // startTable: table id that started from
    // table: table id to get nodes for
    // joins: joins for child nodes
    // types: types to limit to
    // idTable: table to limit to for id type
    // includeAggr: to include an count() option that has and name that is "Number of ..."
    // initialValue: initial value to flesh out TODO REMOVE
    // filter: optional string filter
    // depth: current depth. First level is 0
    createTableChildNodes(options) {
        let node;
        let nodes = [];
        const table = this.schema.getTable(options.table);
        // Create count node if any joins
        if (options.includeAggr) {
            node = {
                name: `Number of ${mwater_expressions_1.ExprUtils.localizeString(this.schema.getTable(options.table).name, this.locale)}`,
                value: {
                    table: options.startTable,
                    joins: options.joins,
                    expr: { type: "op", op: "count", table: options.table, exprs: [] }
                },
                tableId: options.tableId,
                key: "(count)"
            };
            if (filterMatches(options.filter, node.name)) {
                nodes.push(node);
            }
        }
        nodes = nodes.concat(this.createNodes(table.contents, options));
        // Include variables
        for (let variable of this.variables) {
            if (variable.table === options.table) {
                nodes.push({
                    name: mwater_expressions_1.ExprUtils.localizeString(variable.name, this.locale),
                    desc: mwater_expressions_1.ExprUtils.localizeString(variable.desc, this.locale),
                    value: {
                        table: options.startTable,
                        joins: options.joins,
                        expr: { type: "variable", variableId: variable.id, table: options.table }
                    },
                    key: "variable:" + variable.id
                });
            }
        }
        // Create self (id) type if id type allowed and idTable matches
        if (!options.includeAggr &&
            (!options.idTable || options.idTable === options.table) &&
            (!options.types || options.types.includes("id"))) {
            node = {
                name: mwater_expressions_1.ExprUtils.localizeString(this.schema.getTable(options.table).name, this.locale) || "(unnamed)",
                desc: "Id of the row",
                value: { table: options.startTable, joins: options.joins, expr: { type: "id", table: options.table } },
                tableId: options.table,
                key: "(id)"
            };
            if (filterMatches(options.filter, node.name)) {
                nodes.push(node);
            }
        }
        // Include advanced option (null expression with only joins that can be customized)
        if (options.depth > 0 && filterMatches(options.filter, "Advanced")) {
            nodes.push({
                name: "Advanced...",
                desc: "Use to create an advanced function here",
                value: { table: options.startTable, joins: options.joins, expr: null },
                tableId: options.tableId,
                key: "(advanced)"
            });
        }
        // TODO keep?
        // # Add unique id if not including count
        // if not options.includeAggr and not options.types or "id" in options.types
        //   nodes.push({ name: "Unique ID", value: { table: options.table, joins: options.joins, expr: { type: "id", table: options.table } } })
        return nodes;
    }
    // Options:
    // startTable: table id that started from
    // table: table id to get nodes for
    // joins: joins for child nodes
    // types: types to limit to
    // idTable: table to limit to for id type
    // includeAggr: to include an count() option that has and name that is "Number of ..."
    // initialValue: initial value to flesh out TODO REMOVE
    // filter: optional string filter
    // depth: current depth. First level is 0
    createNodes(contents, options) {
        const nodes = [];
        for (let item of contents) {
            ;
            ((item) => {
                var _a, _b;
                let node;
                if (item.type === "section") {
                    // Avoid if deprecated
                    if (!item.deprecated) {
                        // Determine if matches
                        const name = mwater_expressions_1.ExprUtils.localizeString(item.name, this.locale) || "(unnamed)";
                        const desc = mwater_expressions_1.ExprUtils.localizeString(item.desc, this.locale);
                        let matches = filterMatches(options.filter, name) || (desc && filterMatches(options.filter, desc));
                        // Override matching
                        const overrideMatch = (_a = this.isScalarExprTreeSectionMatch) === null || _a === void 0 ? void 0 : _a.call(this, {
                            tableId: options.table,
                            section: item,
                            filter: options.filter
                        });
                        if (overrideMatch != null) {
                            matches = overrideMatch;
                        }
                        const childOptions = lodash_1.default.extend({}, options);
                        // Strip filter if matches to allow all sub-items
                        if (matches) {
                            childOptions.filter = null;
                        }
                        // Increment depth
                        childOptions.depth += 1;
                        node = {
                            name,
                            desc,
                            children: () => {
                                return this.createNodes(item.contents, childOptions);
                            },
                            tableId: options.table,
                            item,
                            key: item.id
                        };
                        // Override initially open
                        if ((_b = this.isScalarExprTreeSectionInitiallyOpen) === null || _b === void 0 ? void 0 : _b.call(this, {
                            tableId: options.table,
                            section: item,
                            filter: options.filter
                        })) {
                            node.initiallyOpen = true;
                        }
                        // If empty, do not show if searching unless override match
                        const numChildren = node.children().length;
                        if (numChildren > 0 || !options.filter || overrideMatch) {
                            // If depth is 0-1 and searching and doesn't match, leave open
                            if (options.depth < 2 && options.filter && !matches) {
                                node.initiallyOpen = true;
                            }
                            if (!options.filter) {
                                return nodes.push(node);
                            }
                            else if (matches) {
                                return nodes.push(node);
                            }
                            else if (options.depth < 2 && numChildren) {
                                return nodes.push(node);
                            }
                        }
                    }
                }
                else {
                    // Gracefully handle deprecated columns
                    if (!item.deprecated) {
                        node = this.createColumnNode(lodash_1.default.extend(options, { column: item }));
                        if (node) {
                            return nodes.push(node);
                        }
                    }
                }
            })(item);
        }
        return nodes;
    }
    // Include column, startTable, joins, initialValue, table, types, filter, idTable
    createColumnNode(options) {
        let joins;
        const { column } = options;
        const node = {
            name: mwater_expressions_1.ExprUtils.localizeString(column.name, this.locale) || "(unnamed)",
            desc: mwater_expressions_1.ExprUtils.localizeString(column.desc, this.locale),
            tableId: options.table,
            item: column,
            key: column.id
        };
        // Determine if matches
        const matches = filterMatches(options.filter, node.name) || (node.desc && filterMatches(options.filter, node.desc));
        // If join (or id, id[]), add children
        if (["join", "id", "id[]"].includes(column.type)) {
            // Allow looping now as it prevents some useful calculations
            // # Do not allow looping (selecting a->b->a) by getting a list of all tables visited so far
            // visitedTables = []
            // for i in [0..options.joins.length]
            //   visitedTables = _.union(visitedTables, [@exprUtils.followJoins(options.startTable, _.take(options.joins, i))])
            // if column.join.toTable in visitedTables
            //   return
            // Add column to joins
            joins = options.joins.slice();
            joins.push(column.id);
            const initVal = options.initialValue;
            // Had to disable to allow UIBuilder to work as it needs raw ids
            // # Do not allow selecting joins if the toTable doesn't have a label field. Otherwise, there is no way to filter it or otherwise manipulate it
            // if @schema.getTable(column.join.toTable)?.label
            // Handle id
            if (column.type === "id" &&
                (!options.types || options.types.includes("id")) &&
                (!options.idTable || column.idTable === options.idTable)) {
                node.value = {
                    table: options.startTable,
                    joins: options.joins,
                    expr: { type: "field", table: options.table, column: column.id }
                };
            }
            // Multiple joins have a value of id[] (if for correct table)
            if (column.type === "id[]" &&
                (!options.types || options.types.includes("id[]")) &&
                (!options.idTable || column.idTable === options.idTable)) {
                node.value = {
                    table: options.startTable,
                    joins: options.joins,
                    expr: { type: "field", table: options.table, column: column.id }
                };
            }
            // Single joins have a vlaue of id (if for correct table)
            if (column.type === "join" &&
                ["n-1", "1-1"].includes(column.join.type) &&
                (!options.types || options.types.includes("id")) &&
                (!options.idTable || column.join.toTable === options.idTable)) {
                node.value = {
                    table: options.startTable,
                    joins: options.joins,
                    expr: { type: "field", table: options.table, column: column.id }
                };
            }
            // Multiple joins have a value of id[] (if for correct table)
            if (column.type === "join" &&
                ["n-n", "1-n"].includes(column.join.type) &&
                (!options.types || options.types.includes("id[]")) &&
                (!options.idTable || column.join.toTable === options.idTable)) {
                node.value = {
                    table: options.startTable,
                    joins: options.joins,
                    expr: { type: "field", table: options.table, column: column.id }
                };
            }
            // Don't allow selecting non-number fields in multiple joins, as it's too confusing https://github.com/mWater/mwater-portal/issues/1121
            if (this.exprUtils.isMultipleJoins(options.startTable, options.joins)) {
                node.value = null;
            }
            node.children = () => {
                // Determine if to include count. True if aggregated
                let filter;
                const includeAggr = this.exprUtils.isMultipleJoins(options.startTable, joins);
                // Determine whether to include filter. If matches, do not include filter so that subtree will show
                if (!matches) {
                    ;
                    ({ filter } = options);
                }
                else {
                    filter = null;
                }
                return this.createTableChildNodes({
                    startTable: options.startTable,
                    table: column.type === "join" ? column.join.toTable : column.idTable,
                    joins,
                    types: options.types,
                    includeAggr,
                    initialValue: initVal,
                    filter,
                    depth: options.depth + 1,
                    idTable: options.idTable
                });
            };
            // Load children (recursively) if selected node is in this tree
            if (initVal && initVal.joins && lodash_1.default.isEqual(initVal.joins.slice(0, joins.length), joins)) {
                node.initiallyOpen = true;
            }
            // If depth is 0 and searching, leave open
            if (options.depth < 1 && options.filter && !matches) {
                node.initiallyOpen = true;
            }
            if (!options.filter) {
                return node;
            }
            else if (matches) {
                return node;
            }
            else if (options.depth < 1 && node.children().length > 0) {
                return node;
            }
            return null;
        }
        else {
            if (!matches) {
                return;
            }
            const fieldExpr = { type: "field", table: options.table, column: column.id };
            // Skip if aggregate and not aggr allowed
            if (!this.exprUtils.isMultipleJoins(options.startTable, options.joins) &&
                this.exprUtils.getExprAggrStatus(fieldExpr) === "aggregate" &&
                !options.includeAggr) {
                return;
            }
            // Don't allow selecting non-number fields in multiple joins, as it's too confusing https://github.com/mWater/mwater-portal/issues/1121
            // unless they are ordered. New: But allow text in order to make list.
            if (!this.schema.getTable(options.table).ordering &&
                this.exprUtils.isMultipleJoins(options.startTable, options.joins) &&
                !["number", "text"].includes(column.type)) {
                return;
            }
            if (options.types) {
                // If aggregated
                let types;
                if (this.exprUtils.isMultipleJoins(options.startTable, options.joins)) {
                    // Get types that this can become through aggregation
                    types = this.exprUtils.getAggrTypes(fieldExpr);
                    // Skip if wrong type
                    if (lodash_1.default.intersection(types, options.types).length === 0) {
                        return;
                    }
                }
                else {
                    let needle;
                    if (((needle = this.exprUtils.getExprType(fieldExpr)), !options.types.includes(needle))) {
                        return;
                    }
                }
            }
            node.value = { table: options.startTable, joins: options.joins, expr: fieldExpr };
        }
        return node;
    }
}
exports.default = ScalarExprTreeBuilder;
// Filters text based on lower-case
function filterMatches(filter, text) {
    if (!filter) {
        return true;
    }
    if (!text) {
        return false;
    }
    if (text.match(new RegExp(lodash_1.default.escapeRegExp(filter), "i"))) {
        return true;
    }
    return false;
}
