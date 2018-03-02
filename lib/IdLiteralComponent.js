var AsyncLoadComponent, ExprCompiler, H, IdLiteralComponent, PropTypes, React, ReactSelect, _,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

H = React.DOM;

ReactSelect = require('react-select');

ExprCompiler = require("mwater-expressions").ExprCompiler;

AsyncLoadComponent = require('react-library/lib/AsyncLoadComponent');

// Displays a combo box that allows selecting one or multiple text values from an expression
// Needs two indexes to work fast:
// create index on some_table (label_column);
// create index on some_table (lower(label_column) text_pattern_ops);
module.exports = IdLiteralComponent = (function() {
  class IdLiteralComponent extends AsyncLoadComponent {
    constructor() {
      super(...arguments);
      this.handleChange = this.handleChange.bind(this);
      this.getOptions = this.getOptions.bind(this);
    }

    focus() {
      return this.refs.select.focus();
    }

    // Override to determine if a load is needed. Not called on mounting
    isLoadNeeded(newProps, oldProps) {
      return newProps.value !== oldProps.value || newProps.idTable !== oldProps.idTable;
    }

    // Call callback with state changes
    load(props, prevProps, callback) {
      var idColumn, labelColumn, query, table;
      // Create query to get current value
      if (!props.value) {
        callback({
          currentValue: null
        });
        return;
      }
      table = props.schema.getTable(props.idTable);
      // Primary key column
      idColumn = {
        type: "field",
        tableAlias: "main",
        column: table.primaryKey
      };
      if (table.label) {
        labelColumn = {
          type: "field",
          tableAlias: "main",
          column: table.label // Use primary key. Ugly, but what else to do?
        };
      } else {
        labelColumn = idColumn;
      }
      // select <label column> as value from <table> where <label column> ~* 'input%' limit 50
      query = {
        type: "query",
        selects: [
          {
            type: "select",
            expr: idColumn,
            alias: "value"
          },
          {
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
            idColumn,
            {
              type: "literal",
              value: (props.multi ? props.value : [props.value])
            }
          ]
        }
      };
      // Execute query
      return props.dataSource.performQuery(query, (err, rows) => {
        if (err || !rows[0]) {
          callback({
            currentValue: null
          });
          return;
        }
        if (!this.props.multi) {
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
      });
    }

    handleChange(value) {
      boundMethodCheck(this, IdLiteralComponent);
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
    }

    getOptions(input, cb) {
      var idColumn, labelColumn, query, table;
      boundMethodCheck(this, IdLiteralComponent);
      // If no input, or just displaying current value
      if (!input || _.isObject(input)) {
        // No options
        cb(null, {
          options: [],
          complete: false
        });
        return;
      }
      table = this.props.schema.getTable(this.props.idTable);
      // Primary key column
      idColumn = {
        type: "field",
        tableAlias: "main",
        column: table.primaryKey
      };
      if (table.label) {
        labelColumn = {
          type: "field",
          tableAlias: "main",
          column: table.label // Use primary key. Ugly, but what else to do?
        };
      } else {
        labelColumn = idColumn;
      }
      // select <label column> as value from <table> where <label column> ~* 'input%' limit 50
      query = {
        type: "query",
        selects: [
          {
            type: "select",
            expr: idColumn,
            alias: "value"
          },
          {
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
            },
            input.toLowerCase() + "%"
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
      // Add custom orderings
      if (this.props.orderBy) {
        query.orderBy = this.props.orderBy.concat(query.orderBy);
      }
      // Execute query
      this.props.dataSource.performQuery(query, (err, rows) => {
        if (err) {
          cb(err);
          return;
        }
        
        // Filter null and blank
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
          complete: false // TODO rows.length < 50 # Complete if didn't hit limit
        });
      });
    }

    render() {
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
    }

  };

  IdLiteralComponent.propTypes = {
    value: PropTypes.any, // String value of primary key or array of primary keys
    onChange: PropTypes.func.isRequired, // Called with primary key or array of primary keys
    idTable: PropTypes.string.isRequired, // Array of id and name (localized string)
    schema: PropTypes.object.isRequired, // Schema of the database
    dataSource: PropTypes.object.isRequired, // Data source to use to get values
    placeholder: PropTypes.string,
    orderBy: PropTypes.array, // Optional extra orderings. Put "main" as tableAlias. JsonQL
    multi: PropTypes.bool // Allow multiple values (id[] type)
  };

  return IdLiteralComponent;

}).call(this);
