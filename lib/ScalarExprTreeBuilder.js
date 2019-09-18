"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var ExprUtils,
    ScalarExprTreeBuilder,
    _,
    filterMatches,
    indexOf = [].indexOf;

_ = require('lodash');
ExprUtils = require("mwater-expressions").ExprUtils; // Builds a tree for selecting table + joins + expr of a scalar expression
// Organizes columns, and follows joins
// options:
//   locale: optional locale to use for names
//   isScalarExprTreeSectionInitiallyOpen: optiona function to override initial open state of a section. Passed { tableId: id of table, section: section object from schema, filter: optional string filter }
//     Should return true to set initially open
//   isScalarExprTreeSectionMatch: optiona function to override filtering of a section. Passed { tableId: id of table, section: section object from schema, filter: optional string filter }
//     Should return null for default, true to include, false to exclude
//   variables: list of variables to show

module.exports = ScalarExprTreeBuilder =
/*#__PURE__*/
function () {
  function ScalarExprTreeBuilder(schema) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    (0, _classCallCheck2.default)(this, ScalarExprTreeBuilder);
    this.schema = schema;
    this.locale = options.locale;
    this.isScalarExprTreeSectionInitiallyOpen = options.isScalarExprTreeSectionInitiallyOpen;
    this.isScalarExprTreeSectionMatch = options.isScalarExprTreeSectionMatch;
    this.variables = options.variables || [];
    this.exprUtils = new ExprUtils(this.schema);
  } // Returns array of 
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


  (0, _createClass2.default)(ScalarExprTreeBuilder, [{
    key: "getTree",
    value: function getTree() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
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
    } // Options:
    // startTable: table id that started from
    // table: table id to get nodes for
    // joins: joins for child nodes
    // types: types to limit to 
    // idTable: table to limit to for id type
    // includeAggr: to include an count() option that has and name that is "Number of ..."
    // initialValue: initial value to flesh out TODO REMOVE
    // filter: optional string filter 
    // depth: current depth. First level is 0

  }, {
    key: "createTableChildNodes",
    value: function createTableChildNodes(options) {
      var i, len, node, nodes, ref, table, variable;
      nodes = []; // Create self (id) type if id type allowed and idTable matches

      if (!options.includeAggr && options.idTable === options.table && (!options.types || indexOf.call(options.types, "id") >= 0)) {
        node = {
          name: ExprUtils.localizeString(this.schema.getTable(options.table).name, this.locale) || "(unnamed)",
          desc: ExprUtils.localizeString(this.schema.getTable(options.table).desc, this.locale),
          value: {
            table: options.startTable,
            joins: options.joins,
            expr: {
              type: "id",
              table: options.table
            }
          },
          tableId: options.table,
          key: "(id)"
        };

        if (filterMatches(options.filter, node.name)) {
          nodes.push(node);
        }
      }

      table = this.schema.getTable(options.table); // Create count node if any joins

      if (options.includeAggr) {
        node = {
          name: "Number of ".concat(ExprUtils.localizeString(this.schema.getTable(options.table).name, this.locale)),
          value: {
            table: options.startTable,
            joins: options.joins,
            expr: {
              type: "op",
              op: "count",
              table: options.table,
              exprs: []
            }
          },
          tableId: options.tableId,
          key: "(count)"
        };

        if (filterMatches(options.filter, node.name)) {
          nodes.push(node);
        }
      }

      nodes = nodes.concat(this.createNodes(table.contents, options));
      ref = this.variables; // Include variables

      for (i = 0, len = ref.length; i < len; i++) {
        variable = ref[i];

        if (variable.table === options.table) {
          nodes.push({
            name: ExprUtils.localizeString(variable.name, this.locale),
            desc: ExprUtils.localizeString(variable.desc, this.locale),
            value: {
              table: options.startTable,
              joins: options.joins,
              expr: {
                type: "variable",
                variableId: variable.id,
                table: options.table
              }
            },
            key: "variable:" + variable.id
          });
        }
      } // Include advanced option (null expression with only joins that can be customized)


      if (options.depth > 0 && filterMatches(options.filter, "Advanced")) {
        nodes.push({
          name: "Advanced...",
          desc: "Use to create an advanced function here",
          value: {
            table: options.startTable,
            joins: options.joins,
            expr: null
          },
          tableId: options.tableId,
          key: "(advanced)"
        });
      } // TODO keep?
      // # Add unique id if not including count
      // if not options.includeAggr and not options.types or "id" in options.types
      //   nodes.push({ name: "Unique ID", value: { table: options.table, joins: options.joins, expr: { type: "id", table: options.table } } })


      return nodes;
    } // Options:
    // startTable: table id that started from
    // table: table id to get nodes for
    // joins: joins for child nodes
    // types: types to limit to 
    // idTable: table to limit to for id type
    // includeAggr: to include an count() option that has and name that is "Number of ..."
    // initialValue: initial value to flesh out TODO REMOVE
    // filter: optional string filter 
    // depth: current depth. First level is 0

  }, {
    key: "createNodes",
    value: function createNodes(contents, options) {
      var _this = this;

      var i, item, len, nodes;
      nodes = [];

      for (i = 0, len = contents.length; i < len; i++) {
        item = contents[i];

        (function (item) {
          var childOptions, desc, matches, name, node, numChildren, overrideMatch;

          if (item.type === "section") {
            // Avoid if deprecated
            if (!item.deprecated) {
              // Determine if matches
              name = ExprUtils.localizeString(item.name, _this.locale) || "(unnamed)";
              desc = ExprUtils.localizeString(item.desc, _this.locale);
              matches = filterMatches(options.filter, name) || desc && filterMatches(options.filter, desc); // Override matching

              overrideMatch = typeof _this.isScalarExprTreeSectionMatch === "function" ? _this.isScalarExprTreeSectionMatch({
                tableId: options.table,
                section: item,
                filter: options.filter
              }) : void 0;

              if (overrideMatch != null) {
                matches = overrideMatch;
              }

              childOptions = _.extend({}, options); // Strip filter if matches to allow all sub-items

              if (matches) {
                childOptions.filter = null;
              } // Increment depth


              childOptions.depth += 1;
              node = {
                name: name,
                desc: desc,
                children: function children() {
                  return _this.createNodes(item.contents, childOptions);
                },
                tableId: options.table,
                item: item,
                key: item.id
              };

              if (typeof _this.isScalarExprTreeSectionInitiallyOpen === "function" ? _this.isScalarExprTreeSectionInitiallyOpen({
                tableId: options.table,
                section: item,
                filter: options.filter
              }) : void 0) {
                node.initiallyOpen = true;
              } // If empty, do not show if searching unless override match


              numChildren = node.children().length;

              if (numChildren > 0 || !options.filter || overrideMatch) {
                // If depth is 0-1 and searching and doesn't match, leave open
                if (options.depth < 2 && options.filter && !matches) {
                  node.initiallyOpen = true;
                }

                if (!options.filter) {
                  return nodes.push(node);
                } else if (matches) {
                  return nodes.push(node);
                } else if (options.depth < 2 && numChildren) {
                  return nodes.push(node);
                }
              }
            }
          } else {
            // Gracefully handle deprecated columns
            if (!item.deprecated) {
              node = _this.createColumnNode(_.extend(options, {
                column: item
              }));

              if (node) {
                return nodes.push(node);
              }
            }
          }
        })(item);
      }

      return nodes;
    } // Include column, startTable, joins, initialValue, table, types, filter, idTable

  }, {
    key: "createColumnNode",
    value: function createColumnNode(options) {
      var _this2 = this;

      var column, fieldExpr, initVal, joins, matches, node, ref, ref1, ref2, types;
      column = options.column;
      node = {
        name: ExprUtils.localizeString(column.name, this.locale) || "(unnamed)",
        desc: ExprUtils.localizeString(column.desc, this.locale),
        tableId: options.table,
        item: column,
        key: column.id
      }; // Determine if matches

      matches = filterMatches(options.filter, node.name) || node.desc && filterMatches(options.filter, node.desc); // If join, add children

      if (column.type === "join") {
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
        initVal = options.initialValue; // Had to disable to allow UIBuilder to work as it needs raw ids      
        // # Do not allow selecting joins if the toTable doesn't have a label field. Otherwise, there is no way to filter it or otherwise manipulate it
        // if @schema.getTable(column.join.toTable)?.label
        // Single joins have a value of id (if for correct table)

        if (((ref = column.join.type) === 'n-1' || ref === '1-1') && (!options.types || indexOf.call(options.types, 'id') >= 0) && (!options.idTable || column.join.toTable === options.idTable)) {
          node.value = {
            table: options.startTable,
            joins: options.joins,
            expr: {
              type: "field",
              table: options.table,
              column: column.id
            }
          };
        } // Multiple joins have a value of id[] (if for correct table)


        if (((ref1 = column.join.type) === 'n-n' || ref1 === '1-n') && (!options.types || indexOf.call(options.types, 'id[]') >= 0) && (!options.idTable || column.join.toTable === options.idTable)) {
          node.value = {
            table: options.startTable,
            joins: options.joins,
            expr: {
              type: "field",
              table: options.table,
              column: column.id
            }
          };
        }

        node.children = function () {
          var filter, includeAggr; // Determine if to include count. True if aggregated

          includeAggr = _this2.exprUtils.isMultipleJoins(options.startTable, joins); // Determine whether to include filter. If matches, do not include filter so that subtree will show

          if (!matches) {
            filter = options.filter;
          } else {
            filter = null;
          }

          return _this2.createTableChildNodes({
            startTable: options.startTable,
            table: column.join.toTable,
            joins: joins,
            types: options.types,
            includeAggr: includeAggr,
            initialValue: initVal,
            filter: filter,
            depth: options.depth + 1,
            idTable: options.idTable
          });
        }; // Load children (recursively) if selected node is in this tree


        if (initVal && initVal.joins && _.isEqual(initVal.joins.slice(0, joins.length), joins)) {
          node.initiallyOpen = true;
        } // If depth is 0 and searching, leave open


        if (options.depth < 1 && options.filter && !matches) {
          node.initiallyOpen = true;
        }

        if (!options.filter) {
          return node;
        } else if (matches) {
          return node;
        } else if (options.depth < 1 && node.children().length > 0) {
          return node;
        }

        return null;
      } else {
        if (!matches) {
          return;
        }

        fieldExpr = {
          type: "field",
          table: options.table,
          column: column.id
        }; // Skip if aggregate and not aggr allowed

        if (!this.exprUtils.isMultipleJoins(options.startTable, options.joins) && this.exprUtils.getExprAggrStatus(fieldExpr) === "aggregate" && !options.includeAggr) {
          return;
        }

        if (options.types) {
          // If aggregated
          if (this.exprUtils.isMultipleJoins(options.startTable, options.joins)) {
            // Get types that this can become through aggregation
            types = this.exprUtils.getAggrTypes(fieldExpr); // Skip if wrong type

            if (_.intersection(types, options.types).length === 0) {
              return;
            }
          } else {
            if (ref2 = this.exprUtils.getExprType(fieldExpr), indexOf.call(options.types, ref2) < 0) {
              return;
            }
          }
        }

        node.value = {
          table: options.startTable,
          joins: options.joins,
          expr: fieldExpr
        };
      }

      return node;
    }
  }]);
  return ScalarExprTreeBuilder;
}(); // Filters text based on lower-case


filterMatches = function filterMatches(filter, text) {
  if (!filter) {
    return true;
  }

  if (!text) {
    return false;
  }

  if (text.match(new RegExp(_.escapeRegExp(filter), "i"))) {
    return true;
  }

  return false;
};