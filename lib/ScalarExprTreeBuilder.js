var ExprUtils, ScalarExprTreeBuilder, _,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

_ = require('lodash');

ExprUtils = require("mwater-expressions").ExprUtils;

module.exports = ScalarExprTreeBuilder = (function() {
  function ScalarExprTreeBuilder(schema, locale) {
    this.schema = schema;
    this.locale = locale;
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
      includeCount: options.includeCount,
      initialValue: options.initialValue,
      filter: options.filter,
      depth: 0
    });
  };

  ScalarExprTreeBuilder.prototype.createTableChildNodes = function(options) {
    var node, nodes, table;
    nodes = [];
    if (options.includeCount) {
      node = {
        name: "Number of " + (ExprUtils.localizeString(this.schema.getTable(options.table).name, this.locale)),
        value: {
          table: options.startTable,
          joins: options.joins,
          expr: {
            type: "id",
            table: options.table
          }
        }
      };
      if (!options.filter || node.name.match(options.filter)) {
        nodes.push(node);
      }
    }
    if (!options.includeCount && options.idTable && (!options.types || indexOf.call(options.types, "id") >= 0)) {
      node = {
        name: ExprUtils.localizeString(this.schema.getTable(options.table).name, this.locale),
        value: {
          table: options.startTable,
          joins: options.joins,
          expr: {
            type: "id",
            table: options.table
          }
        }
      };
      if (!options.filter || node.name.match(options.filter)) {
        nodes.push(node);
      }
    }
    table = this.schema.getTable(options.table);
    nodes = nodes.concat(this.createNodes(table.contents, options));
    return nodes;
  };

  ScalarExprTreeBuilder.prototype.createNodes = function(contents, options) {
    var fn, i, item, len, nodes;
    nodes = [];
    fn = (function(_this) {
      return function(item) {
        var childOptions, column, matches, name, node;
        if (item.type === "section") {
          name = ExprUtils.localizeString(item.name, _this.locale);
          matches = !options.filter || name.match(options.filter);
          childOptions = _.extend({}, options);
          if (matches) {
            childOptions.filter = null;
          }
          childOptions.depth += 1;
          node = {
            name: name,
            children: function() {
              return _this.createNodes(item.contents, childOptions);
            }
          };
          if (options.depth === 0 && options.filter) {
            node.initiallyOpen = true;
          }
          if (node.children().length > 0) {
            return nodes.push(node);
          }
        } else {
          column = _this.schema.getColumn(options.table, item.id);
          if (column) {
            node = _this.createColumnNode(_.extend(options, {
              column: column
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
    var column, exprUtils, fieldExpr, initVal, joins, matches, node, ref, ref1, types;
    exprUtils = new ExprUtils(this.schema);
    column = options.column;
    node = {
      name: ExprUtils.localizeString(column.name, this.locale),
      desc: ExprUtils.localizeString(column.desc, this.locale)
    };
    matches = !options.filter || node.name.match(options.filter);
    if (column.type === "join") {
      joins = options.joins.slice();
      joins.push(column.id);
      initVal = options.initialValue;
      if (((ref = column.join.type) === 'n-1' || ref === '1-1') && (!options.types || indexOf.call(options.types, 'id') >= 0) && (!options.idTable || column.join.toTable === options.idTable)) {
        node.value = {
          table: options.startTable,
          joins: joins,
          expr: {
            type: "id",
            table: column.join.toTable
          }
        };
      }
      node.children = (function(_this) {
        return function() {
          var filter, includeCount;
          includeCount = exprUtils.isMultipleJoins(options.startTable, joins);
          if (!matches) {
            filter = options.filter;
          }
          return _this.createTableChildNodes({
            startTable: options.startTable,
            table: column.join.toTable,
            joins: joins,
            types: options.types,
            includeCount: includeCount,
            initialValue: initVal,
            filter: filter,
            depth: options.depth + 1
          });
        };
      })(this);
      if (initVal && initVal.joins && _.isEqual(initVal.joins.slice(0, joins.length), joins)) {
        node.initiallyOpen = true;
      }
      if (options.depth === 0 && options.filter) {
        node.initiallyOpen = true;
      }
    } else {
      if (!matches) {
        return;
      }
      fieldExpr = {
        type: "field",
        table: options.table,
        column: column.id
      };
      if (options.types) {
        if (exprUtils.isMultipleJoins(options.startTable, options.joins)) {
          types = exprUtils.getAggrTypes(fieldExpr);
          if (_.intersection(types, options.types).length === 0) {
            return;
          }
        } else {
          if (ref1 = column.type, indexOf.call(options.types, ref1) < 0) {
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
