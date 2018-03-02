var AsyncLoadComponent, ExprCompiler, H, IdLiteralComponent, PropTypes, React, ReactSelect, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

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
    value: PropTypes.any,
    onChange: PropTypes.func.isRequired,
    idTable: PropTypes.string.isRequired,
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    placeholder: PropTypes.string,
    orderBy: PropTypes.array,
    multi: PropTypes.bool
  };

  IdLiteralComponent.prototype.focus = function() {
    return this.refs.select.focus();
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
          idColumn, {
            type: "literal",
            value: (props.multi ? props.value : [props.value])
          }
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
              value: JSON.stringify(rows[0].value)
            }
          });
        } else {
          return callback({
            currentValue: _.map(rows, function(row) {
              return {
                label: row.label,
                value: JSON.stringify(row.value)
              };
            })
          });
        }
      };
    })(this));
  };

  IdLiteralComponent.prototype.handleChange = function(value) {
    if (this.props.multi) {
      value = value ? value.split("\n") : null;
      value = _.map(value, JSON.parse);
      return this.props.onChange(value);
    } else {
      if (value) {
        return this.props.onChange(JSON.parse(value));
      } else {
        return this.props.onChange(null);
      }
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
    if (this.props.orderBy) {
      query.orderBy = this.props.orderBy.concat(query.orderBy);
    }
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
              value: JSON.stringify(r.value),
              label: r.label
            };
          }),
          complete: false
        });
      };
    })(this));
  };

  IdLiteralComponent.prototype.render = function() {
    return H.div({
      style: {
        width: "100%"
      }
    }, React.createElement(ReactSelect, {
      ref: "select",
      value: this.state.currentValue != null ? this.state.currentValue : "",
      placeholder: this.props.placeholder || "Select",
      asyncOptions: this.getOptions,
      multi: this.props.multi,
      delimiter: "\n",
      isLoading: this.state.loading,
      onChange: this.handleChange
    }));
  };

  return IdLiteralComponent;

})(AsyncLoadComponent);
