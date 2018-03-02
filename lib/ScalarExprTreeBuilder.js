var ExprUtils, ScalarExprTreeBuilder, _, filterMatches,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

_ = require('lodash');

ExprUtils = require("mwater-expressions").ExprUtils;

module.exports = ScalarExprTreeBuilder = (function() {
  function ScalarExprTreeBuilder(schema, options) {
    if (options == null) {
      options = {};
    }
    this.schema = schema;
    this.locale = options.locale;
    this.isScalarExprTreeSectionInitiallyOpen = options.isScalarExprTreeSectionInitiallyOpen;
    this.isScalarExprTreeSectionMatch = options.isScalarExprTreeSectionMatch;
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
        tableId: options.tableId,
        key: "(count)"
      };
      if (filterMatches(options.filter, node.name)) {
        nodes.push(node);
      }
    }
    nodes = nodes.concat(this.createNodes(table.contents, options));
    if (options.includeAggr && options.depth > 0 && filterMatches(options.filter, "Advanced")) {
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
    }
    return nodes;
  };

  ScalarExprTreeBuilder.prototype.createNodes = function(contents, options) {
    var fn, i, item, len, nodes;
    nodes = [];
    fn = (function(_this) {
      return function(item) {
        var childOptions, desc, matches, name, node, numChildren, overrideMatch;
        if (item.type === "section") {
          if (!item.deprecated) {
            name = ExprUtils.localizeString(item.name, _this.locale) || "(unnamed)";
            desc = ExprUtils.localizeString(item.desc, _this.locale);
            matches = filterMatches(options.filter, name) || (desc && filterMatches(options.filter, desc));
            overrideMatch = typeof _this.isScalarExprTreeSectionMatch === "function" ? _this.isScalarExprTreeSectionMatch({
              tableId: options.table,
              section: item,
              filter: options.filter
            }) : void 0;
            if (overrideMatch != null) {
              matches = overrideMatch;
            }
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
              item: item,
              key: item.id
            };
            if (typeof _this.isScalarExprTreeSectionInitiallyOpen === "function" ? _this.isScalarExprTreeSectionInitiallyOpen({
              tableId: options.table,
              section: item,
              filter: options.filter
            }) : void 0) {
              node.initiallyOpen = true;
            }
            numChildren = node.children().length;
            if (numChildren > 0 || !options.filter || overrideMatch) {
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
    for (i = 0, len = contents.length; i < len; i++) {
      item = contents[i];
      fn(item);
    }
    return nodes;
  };

  ScalarExprTreeBuilder.prototype.createColumnNode = function(options) {
    var column, fieldExpr, initVal, joins, matches, node, ref, ref1, ref2, ref3, types;
    column = options.column;
    node = {
      name: ExprUtils.localizeString(column.name, this.locale) || "(unnamed)",
      desc: ExprUtils.localizeString(column.desc, this.locale),
      tableId: options.table,
      item: column,
      key: column.id
    };
    matches = filterMatches(options.filter, node.name) || (node.desc && filterMatches(options.filter, node.desc));
    if (column.type === "join") {
      joins = options.joins.slice();
      joins.push(column.id);
      initVal = options.initialValue;
      if ((ref = this.schema.getTable(column.join.toTable)) != null ? ref.label : void 0) {
        if (((ref1 = column.join.type) === 'n-1' || ref1 === '1-1') && (!options.types || indexOf.call(options.types, 'id') >= 0) && (!options.idTable || column.join.toTable === options.idTable)) {
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
        if (((ref2 = column.join.type) === 'n-n' || ref2 === '1-n') && (!options.types || indexOf.call(options.types, 'id[]') >= 0) && (!options.idTable || column.join.toTable === options.idTable)) {
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
          if (ref3 = this.exprUtils.getExprType(fieldExpr), indexOf.call(options.types, ref3) < 0) {
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

filterMatches = function(filter, text) {
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
