var ExprCompiler, H, PropTypes, React, ReactSelect, TextArrayComponent,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

React = require('react');

H = React.DOM;

ReactSelect = require('react-select');

ExprCompiler = require("mwater-expressions").ExprCompiler;

module.exports = TextArrayComponent = (function(superClass) {
  extend(TextArrayComponent, superClass);

  function TextArrayComponent() {
    this.getOptions = bind(this.getOptions, this);
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
    return this.refs.select.focus();
  };

  TextArrayComponent.prototype.handleChange = function(val) {
    var value;
    value = val ? val.split("\n") : [];
    return this.props.onChange({
      type: "literal",
      valueType: "text[]",
      value: value
    });
  };

  TextArrayComponent.prototype.escapeRegex = function(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  };

  TextArrayComponent.prototype.getOptions = function(input, cb) {
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
          cb(err);
          return;
        }
        rows = _.filter(rows, function(r) {
          return r.value;
        });
        return cb(null, {
          options: _.map(rows, function(r) {
            return {
              value: r.value,
              label: r.value
            };
          }),
          complete: false
        });
      };
    })(this));
  };

  TextArrayComponent.prototype.render = function() {
    var value;
    value = "";
    if (this.props.value && this.props.value.value.length > 0) {
      value = this.props.value.value.join("\n");
    }
    return H.div({
      style: {
        width: "100%"
      }
    }, React.createElement(ReactSelect, {
      ref: "select",
      value: value,
      multi: true,
      delimiter: "\n",
      placeholder: "Select...",
      asyncOptions: this.getOptions,
      onChange: this.handleChange
    }));
  };

  return TextArrayComponent;

})(React.Component);
