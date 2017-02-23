var ExprUtils, ScalarExprTreeBuilder, _,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

_ = require('lodash');

ExprUtils = require("mwater-expressions").ExprUtils;

module.exports = ScalarExprTreeBuilder = (function() {
  function ScalarExprTreeBuilder(schema, locale) {
    this.schema = schema;
    this.locale = locale;
    this.exprUtils = new ExprUtils(this.schema);
  }

  ScalarExprTreeBuilder.prototype.getTree = function(options) {
    if (options == null) {
      options = {};
    }
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
  };

  ScalarExprTreeBuilder.prototype.createTableChildNodes = function(options) {
    var node, nodes, table;
    nodes = [];
    if (!options.includeAggr && options.idTable === options.table && (!options.types || indexOf.call(options.types, "id") >= 0)) {
      node = {
        name: ExprUtils.localizeString(this.schema.getTable(options.table).name, this.locale),
        desc: ExprUtils.localizeString(this.schema.getTable(options.table).desc, this.locale),
        value: {
          table: options.startTable,
          joins: options.joins,
          expr: {
            type: "id",
            table: options.table
          }
        },
        tableId: options.table
      };
      if (!options.filter || (node.name && node.name.match(options.filter))) {
        nodes.push(node);
      }
    }
    table = this.schema.getTable(options.table);
    if (options.includeAggr) {
      node = {
        name: "Number of " + (ExprUtils.localizeString(this.schema.getTable(options.table).name, this.locale)),
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
        tableId: options.tableId
      };
      if (!options.filter || (node.name && node.name.match(options.filter))) {
        nodes.push(node);
      }
    }
    nodes = nodes.concat(this.createNodes(table.contents, options));
    if (options.includeAggr && options.depth > 0) {
      nodes.push({
        name: "Advanced...",
        desc: "Use to create an advanced function here",
        value: {
          table: options.startTable,
          joins: options.joins,
          expr: null
        },
        tableId: options.tableId
      });
    }
    return nodes;
  };

  ScalarExprTreeBuilder.prototype.createNodes = function(contents, options) {
    var fn, item, j, len, nodes;
    nodes = [];
    fn = (function(_this) {
      return function(item) {
        var childOptions, desc, matches, name, node, numChildren;
        if (item.type === "section") {
          if (!item.deprecated) {
            name = ExprUtils.localizeString(item.name, _this.locale);
            desc = ExprUtils.localizeString(item.desc, _this.locale);
            matches = !options.filter || name.match(options.filter) || (desc && desc.match(options.filter));
            childOptions = _.extend({}, options);
            if (matches) {
              childOptions.filter = null;
            }
            childOptions.depth += 1;
            node = {
              name: name,
              desc: desc,
              children: function() {
                return _this.createNodes(item.contents, childOptions);
              },
              tableId: options.table,
              item: item
            };
            numChildren = node.children().length;
            if (numChildren > 0 || !options.filter) {
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
          if (!item.deprecated) {
            node = _this.createColumnNode(_.extend(options, {
              column: item
            }));
            if (node) {
              return nodes.push(node);
            }
          }
        }
      };
    })(this);
    for (j = 0, len = contents.length; j < len; j++) {
      item = contents[j];
      fn(item);
    }
    return nodes;
  };

  ScalarExprTreeBuilder.prototype.createColumnNode = function(options) {
    var column, fieldExpr, i, initVal, j, joins, matches, node, ref, ref1, ref2, ref3, ref4, ref5, types, visitedTables;
    column = options.column;
    node = {
      name: ExprUtils.localizeString(column.name, this.locale),
      desc: ExprUtils.localizeString(column.desc, this.locale),
      tableId: options.table,
      item: column
    };
    matches = !options.filter || (node.name && node.name.match(options.filter)) || (node.desc && node.desc.match(options.filter));
    if (column.type === "join") {
      visitedTables = [];
      for (i = j = 0, ref = options.joins.length; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
        visitedTables = _.union(visitedTables, [this.exprUtils.followJoins(options.startTable, _.take(options.joins, i))]);
      }
      if (ref1 = column.join.toTable, indexOf.call(visitedTables, ref1) >= 0) {
        return;
      }
      joins = options.joins.slice();
      joins.push(column.id);
      initVal = options.initialValue;
      if ((ref2 = this.schema.getTable(column.join.toTable)) != null ? ref2.label : void 0) {
        if (((ref3 = column.join.type) === 'n-1' || ref3 === '1-1') && (!options.types || indexOf.call(options.types, 'id') >= 0) && (!options.idTable || column.join.toTable === options.idTable)) {
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
        if (((ref4 = column.join.type) === 'n-n' || ref4 === '1-n') && (!options.types || indexOf.call(options.types, 'id[]') >= 0) && (!options.idTable || column.join.toTable === options.idTable)) {
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
      }
      node.children = (function(_this) {
        return function() {
          var filter, includeAggr;
          includeAggr = _this.exprUtils.isMultipleJoins(options.startTable, joins);
          if (!matches) {
            filter = options.filter;
          } else {
            filter = null;
          }
          return _this.createTableChildNodes({
            startTable: options.startTable,
            table: column.join.toTable,
            joins: joins,
            types: options.types,
            includeAggr: includeAggr,
            initialValue: initVal,
            filter: filter,
            depth: options.depth + 1
          });
        };
      })(this);
      if (initVal && initVal.joins && _.isEqual(initVal.joins.slice(0, joins.length), joins)) {
        node.initiallyOpen = true;
      }
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
      };
      if (!this.exprUtils.isMultipleJoins(options.startTable, options.joins) && this.exprUtils.getExprAggrStatus(fieldExpr) === "aggregate" && !options.includeAggr) {
        return;
      }
      if (options.types) {
        if (this.exprUtils.isMultipleJoins(options.startTable, options.joins)) {
          types = this.exprUtils.getAggrTypes(fieldExpr);
          if (_.intersection(types, options.types).length === 0) {
            return;
          }
        } else {
          if (ref5 = this.exprUtils.getExprType(fieldExpr), indexOf.call(options.types, ref5) < 0) {
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
  };

  return ScalarExprTreeBuilder;

})();
