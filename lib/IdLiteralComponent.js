var AsyncLoadComponent, AsyncReactSelect, ExprCompiler, IdLiteralComponent, PropTypes, R, React, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

R = React.createElement;

AsyncReactSelect = require('react-select/lib/Async')["default"];

ExprCompiler = require("mwater-expressions").ExprCompiler;

AsyncLoadComponent = require('react-library/lib/AsyncLoadComponent');

module.exports = IdLiteralComponent = (function(superClass) {
  extend(IdLiteralComponent, superClass);

  function IdLiteralComponent() {
    this.loadOptions = bind(this.loadOptions, this);
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
    multi: PropTypes.bool,
    filter: PropTypes.object
  };

  IdLiteralComponent.prototype.focus = function() {
    return this.select.focus();
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
            currentValue: rows[0]
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
      if (value && value.length === 0) {
        return this.props.onChange(null);
      } else {
        return this.props.onChange(_.pluck(value, "value"));
      }
    } else {
      return this.props.onChange(value != null ? value.value : void 0);
    }
  };

  IdLiteralComponent.prototype.loadOptions = function(input, cb) {
    var idColumn, labelColumn, query, table;
    if (!input) {
      cb([]);
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
    if (this.props.filter) {
      query.where = {
        type: "op",
        op: "and",
        exprs: [query.where, this.props.filter]
      };
    }
    if (this.props.orderBy) {
      query.orderBy = this.props.orderBy.concat(query.orderBy);
    }
    this.props.dataSource.performQuery(query, (function(_this) {
      return function(err, rows) {
        if (err) {
          return;
        }
        rows = _.filter(rows, function(r) {
          return r.label;
        });
        return cb(rows);
      };
    })(this));
  };

  IdLiteralComponent.prototype.render = function() {
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
      value: this.state.currentValue,
      placeholder: this.props.placeholder || "Select",
      loadOptions: this.loadOptions,
      isMulti: this.props.multi,
      isClearable: true,
      isLoading: this.state.loading,
      onChange: this.handleChange,
      noOptionsMessage: (function(_this) {
        return function() {
          return "Type to search";
        };
      })(this)
    }));
  };

  return IdLiteralComponent;

})(AsyncLoadComponent);
