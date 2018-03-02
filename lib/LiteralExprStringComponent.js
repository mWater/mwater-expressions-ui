var AsyncLoadComponent, ExprCompiler, ExprUtils, H, LiteralExprStringComponent, PropTypes, R, React, _;

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

R = React.createElement;

H = React.DOM;

ExprCompiler = require("mwater-expressions").ExprCompiler;

ExprUtils = require("mwater-expressions").ExprUtils;

AsyncLoadComponent = require('react-library/lib/AsyncLoadComponent');

// Displays a literal expression as a string. Simple for non-id types. For id types, loads using a query
module.exports = LiteralExprStringComponent = (function() {
  class LiteralExprStringComponent extends AsyncLoadComponent {
    
    // Override to determine if a load is needed. Not called on mounting
    isLoadNeeded(newProps, oldProps) {
      return !_.isEqual(newProps.value, oldProps.value);
    }

    // Call callback with state changes
    load(props, prevProps, callback) {
      var idColumn, labelColumn, query, ref, table;
      // If no value or not id, id[]
      if (!props.value || ((ref = props.value.valueType) !== 'id' && ref !== "id[]")) {
        callback({
          label: null
        });
        return;
      }
      // Create query to get current value
      table = props.schema.getTable(props.value.idTable);
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
            idColumn,
            {
              type: "literal",
              value: (props.value.valueType === "id[]" ? props.value.value : [props.value.value])
            }
          ]
        }
      };
      // Execute query
      return props.dataSource.performQuery(query, (err, rows) => {
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
      });
    }

    render() {
      var exprUtils, ref, ref1, str, type;
      exprUtils = new ExprUtils(this.props.schema);
      type = (ref = this.props.value) != null ? ref.valueType : void 0;
      
      // Handle simple case
      if (type !== 'id' && type !== 'id[]') {
        str = exprUtils.stringifyLiteralValue(type, (ref1 = this.props.value) != null ? ref1.value : void 0, this.context.locale, this.props.enumValues);
        // Quote text
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
    }

  };

  LiteralExprStringComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired, // Data source to use to get values
    value: PropTypes.object, // Current expression value
    enumValues: PropTypes.array // Array of { id:, name: } of enum values that can be selected. Only when type = "enum"
  };

  LiteralExprStringComponent.contextTypes = {
    locale: PropTypes.string // e.g. "en"
  };

  return LiteralExprStringComponent;

}).call(this);
