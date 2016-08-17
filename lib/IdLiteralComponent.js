var AsyncLoadComponent, ExprCompiler, H, IdLiteralComponent, React, ReactSelect, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

ReactSelect = require('react-select');

ExprCompiler = require("mwater-expressions").ExprCompiler;

AsyncLoadComponent = require('react-library/lib/AsyncLoadComponent');

module.exports = IdLiteralComponent = (function(superClass) {
  extend(IdLiteralComponent, superClass);

  function IdLiteralComponent() {
    this.getOptions = bind(this.getOptions, this);
    this.handleChange = bind(this.handleChange, this);
    return IdLiteralComponent.__super__.constructor.apply(this, arguments);
  }

  IdLiteralComponent.propTypes = {
    value: React.PropTypes.string,
    onChange: React.PropTypes.func.isRequired,
    idTable: React.PropTypes.string.isRequired,
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired
  };

  IdLiteralComponent.prototype.isLoadNeeded = function(newProps, oldProps) {
    return newProps.value !== oldProps.value || newProps.idTable !== oldProps.idTable;
  };

  IdLiteralComponent.prototype.load = function(props, prevProps, callback) {
    var idColumn, labelColumn, query, table;
    if (!props.value) {
      callback({
        currentValue: null
      });
      return;
    }
    table = props.schema.getTable(props.idTable);
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
          expr: idColumn,
          alias: "value"
        }, {
          type: "select",
          expr: labelColumn,
          alias: "label"
        }
      ],
      from: {
        type: "table",
        table: this.props.idTable,
        alias: "main"
      },
      where: {
        type: "op",
        op: "=",
        modifier: "any",
        exprs: [
          idColumn, props.multi ? {
            type: "literal",
            value: [props.value]
          } : props.value
        ]
      }
    };
    return props.dataSource.performQuery(query, (function(_this) {
      return function(err, rows) {
        if (err || !rows[0]) {
          callback({
            currentValue: null
          });
          return;
        }
        if (!_this.props.multi) {
          return callback({
            currentValue: {
              label: rows[0].label,
              value: rows[0].value
            }
          });
        } else {
          return callback({
            currentValue: rows
          });
        }
      };
    })(this));
  };

  IdLiteralComponent.prototype.handleChange = function(value) {
    if (this.props.multi) {
      value = value ? value.split("\n") : [];
      return this.props.onChange(value);
    } else {
      return this.props.onChange(value || null);
    }
  };

  IdLiteralComponent.prototype.getOptions = function(input, cb) {
    var idColumn, labelColumn, query, table;
    if (!input || _.isObject(input)) {
      cb(null, {
        options: [],
        complete: false
      });
      return;
    }
    table = this.props.schema.getTable(this.props.idTable);
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
          expr: idColumn,
          alias: "value"
        }, {
          type: "select",
          expr: labelColumn,
          alias: "label"
        }
      ],
      from: {
        type: "table",
        table: this.props.idTable,
        alias: "main"
      },
      where: {
        type: "op",
        op: "like",
        exprs: [
          {
            type: "op",
            op: "lower",
            exprs: [labelColumn]
          }, input.toLowerCase() + "%"
        ]
      },
      orderBy: [
        {
          ordinal: 2,
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
          return r.label;
        });
        return cb(null, {
          options: _.map(rows, function(r) {
            return {
              value: r.value,
              label: r.label
            };
          }),
          complete: false
        });
      };
    })(this));
  };

  IdLiteralComponent.prototype.render = function() {
    var value;
    value = this.state.currentValue || "";
    return H.div({
      style: {
        width: "100%"
      }
    }, React.createElement(ReactSelect, {
      value: value,
      placeholder: "Select",
      asyncOptions: this.getOptions,
      multi: this.props.multi,
      delimiter: "\n",
      isLoading: this.state.loading,
      onChange: this.handleChange
    }));
  };

  return IdLiteralComponent;

})(AsyncLoadComponent);
