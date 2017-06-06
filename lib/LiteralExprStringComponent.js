var AsyncLoadComponent, ExprCompiler, ExprUtils, H, LiteralExprStringComponent, PropTypes, R, React, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

R = React.createElement;

H = React.DOM;

ExprCompiler = require("mwater-expressions").ExprCompiler;

ExprUtils = require("mwater-expressions").ExprUtils;

AsyncLoadComponent = require('react-library/lib/AsyncLoadComponent');

module.exports = LiteralExprStringComponent = (function(superClass) {
  extend(LiteralExprStringComponent, superClass);

  function LiteralExprStringComponent() {
    return LiteralExprStringComponent.__super__.constructor.apply(this, arguments);
  }

  LiteralExprStringComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    value: PropTypes.object,
    enumValues: PropTypes.array
  };

  LiteralExprStringComponent.contextTypes = {
    locale: PropTypes.string
  };

  LiteralExprStringComponent.prototype.isLoadNeeded = function(newProps, oldProps) {
    return !_.isEqual(newProps.value, oldProps.value);
  };

  LiteralExprStringComponent.prototype.load = function(props, prevProps, callback) {
    var idColumn, labelColumn, query, ref, table;
    if (!props.value || ((ref = props.value.valueType) !== 'id' && ref !== "id[]")) {
      callback({
        label: null
      });
      return;
    }
    table = props.schema.getTable(props.value.idTable);
    idColumn = {
      type: "field",
      tableAlias: "main",
      column: table.primaryKey
    };
    if (table.label) {
      labelColumn = {
        type: "field",
        tableAlias: "main",
        column: table.label
      };
    } else {
      labelColumn = idColumn;
    }
    query = {
      type: "query",
      selects: [
        {
          type: "select",
          expr: labelColumn,
          alias: "label"
        }
      ],
      from: {
        type: "table",
        table: table.id,
        alias: "main"
      },
      where: {
        type: "op",
        op: "=",
        modifier: "any",
        exprs: [
          idColumn, {
            type: "literal",
            value: (props.value.valueType === "id[]" ? props.value.value : [props.value.value])
          }
        ]
      }
    };
    return props.dataSource.performQuery(query, (function(_this) {
      return function(err, rows) {
        if (err || !rows[0]) {
          callback({
            label: "(error)"
          });
          return;
        }
        if (props.value.valueType === "id") {
          return callback({
            label: rows[0].label
          });
        } else {
          return callback({
            label: _.pluck(rows, "label").join(", ") || "None"
          });
        }
      };
    })(this));
  };

  LiteralExprStringComponent.prototype.render = function() {
    var exprUtils, ref, ref1, str, type;
    exprUtils = new ExprUtils(this.props.schema);
    type = (ref = this.props.value) != null ? ref.valueType : void 0;
    if (type !== 'id' && type !== 'id[]') {
      str = exprUtils.stringifyLiteralValue(type, (ref1 = this.props.value) != null ? ref1.value : void 0, this.context.locale, this.props.enumValues);
      if (type === "text") {
        str = '"' + str + '"';
      }
    } else {
      if (this.state.loading) {
        str = "...";
      } else {
        str = this.state.label;
      }
    }
    return H.span(null, str);
  };

  return LiteralExprStringComponent;

})(AsyncLoadComponent);
