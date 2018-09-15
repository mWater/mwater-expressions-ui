var AsyncReactSelect, ExprCompiler, PropTypes, R, React, TextArrayComponent,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

React = require('react');

R = React.createElement;

AsyncReactSelect = require('react-select/lib/Async')["default"];

ExprCompiler = require("mwater-expressions").ExprCompiler;

module.exports = TextArrayComponent = (function(superClass) {
  extend(TextArrayComponent, superClass);

  function TextArrayComponent() {
    this.loadOptions = bind(this.loadOptions, this);
    this.handleChange = bind(this.handleChange, this);
    return TextArrayComponent.__super__.constructor.apply(this, arguments);
  }

  TextArrayComponent.propTypes = {
    value: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    refExpr: PropTypes.object.isRequired,
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired
  };

  TextArrayComponent.prototype.focus = function() {
    return this.select.focus();
  };

  TextArrayComponent.prototype.handleChange = function(value) {
    if (value && value.length > 0) {
      return this.props.onChange({
        type: "literal",
        valueType: "text[]",
        value: _.pluck(value, "label")
      });
    } else {
      return this.props.onChange(null);
    }
  };

  TextArrayComponent.prototype.escapeRegex = function(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  };

  TextArrayComponent.prototype.loadOptions = function(input, cb) {
    var exprCompiler, query;
    exprCompiler = new ExprCompiler(this.props.schema);
    query = {
      type: "query",
      selects: [
        {
          type: "select",
          expr: exprCompiler.compileExpr({
            expr: this.props.refExpr,
            tableAlias: "main"
          }),
          alias: "value"
        }, {
          type: "select",
          expr: {
            type: "op",
            op: "count",
            exprs: []
          },
          alias: "number"
        }
      ],
      from: exprCompiler.compileTable(this.props.refExpr.table, "main"),
      where: {
        type: "op",
        op: "~*",
        exprs: [
          exprCompiler.compileExpr({
            expr: this.props.refExpr,
            tableAlias: "main"
          }), "^" + this.escapeRegex(input)
        ]
      },
      groupBy: [1],
      orderBy: [
        {
          ordinal: 2,
          direction: "desc"
        }, {
          ordinal: 1,
          direction: "asc"
        }
      ],
      limit: 50
    };
    this.props.dataSource.performQuery(query, (function(_this) {
      return function(err, rows) {
        if (err) {
          return;
        }
        rows = _.filter(rows, function(r) {
          return r.value;
        });
        return cb(_.map(rows, function(r) {
          return {
            value: r.value,
            label: r.value
          };
        }));
      };
    })(this));
  };

  TextArrayComponent.prototype.render = function() {
    var ref, value;
    value = _.map((ref = this.props.value) != null ? ref.value : void 0, (function(_this) {
      return function(v) {
        return {
          label: v,
          value: v
        };
      };
    })(this));
    return R('div', {
      style: {
        width: "100%"
      }
    }, R(AsyncReactSelect, {
      ref: (function(_this) {
        return function(c) {
          return _this.select = c;
        };
      })(this),
      value: value,
      isMulti: true,
      placeholder: "Select...",
      defaultOptions: true,
      loadOptions: this.loadOptions,
      onChange: this.handleChange
    }));
  };

  return TextArrayComponent;

})(React.Component);
