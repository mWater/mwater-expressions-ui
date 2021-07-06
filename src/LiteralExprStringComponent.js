let LiteralExprStringComponent;
import PropTypes from 'prop-types';
import _ from 'lodash';
import React from 'react';
const R = React.createElement;

import { ExprCompiler } from "mwater-expressions";
import { ExprUtils } from "mwater-expressions";
import AsyncLoadComponent from 'react-library/lib/AsyncLoadComponent';

// Displays a literal expression as a string. Simple for non-id types. For id types, loads using a query
export default LiteralExprStringComponent = (function() {
  LiteralExprStringComponent = class LiteralExprStringComponent extends AsyncLoadComponent {
    static initClass() {
      this.propTypes = {
        schema: PropTypes.object.isRequired,
        dataSource: PropTypes.object.isRequired, // Data source to use to get values
        value: PropTypes.object,   // Current expression value
        enumValues: PropTypes.array, // Array of { id:, name: } of enum values that can be selected. Only when type = "enum"
        locale: PropTypes.string  // e.g. "en"
      };
  
      this.contextTypes =
        {locale: PropTypes.string};
        // e.g. "en"
    }

    // Override to determine if a load is needed. Not called on mounting
    isLoadNeeded(newProps, oldProps) { 
      return !_.isEqual(newProps.value, oldProps.value);
    }

    // Call callback with state changes
    load(props, prevProps, callback) {
      // If no value or not id, id[]
      let labelColumn;
      if (!props.value || !['id', "id[]"].includes(props.value.valueType)) {
        callback({label: null});
        return;
      }

      // Create query to get current value
      const table = props.schema.getTable(props.value.idTable);

      // Primary key column
      const idColumn = { type: "field", tableAlias: "main", column: table.primaryKey };
      if (table.label) {
        labelColumn = { type: "field", tableAlias: "main", column: table.label };
      } else { // Use primary key. Ugly, but what else to do?
        labelColumn = idColumn;
      }

      const query = {
        type: "query",
        selects: [
          { type: "select", expr: labelColumn, alias: "label" }
        ],
        from: { type: "table", table: table.id, alias: "main" },
        where: {
          type: "op",
          op: "=",
          modifier: "any",
          exprs: [
            idColumn,
            { type: "literal", value: (props.value.valueType === "id[]" ? props.value.value : [props.value.value]) }
          ]
        }
      };

      // Execute query
      return props.dataSource.performQuery(query, (err, rows) => {
        if (err || !rows[0]) {
          callback({label: "(error)"});
          return; 
        }
        if (props.value.valueType === "id") {
          return callback({label: rows[0].label});
        } else {
          return callback({label: _.pluck(rows, "label").join(", ") || "None"});
        }
      });
    }

    render() {
      let str;
      const exprUtils = new ExprUtils(this.props.schema);

      const type = this.props.value?.valueType;
    
      // Handle simple case
      if (!['id', 'id[]'].includes(type)) {
        str = exprUtils.stringifyLiteralValue(type, this.props.value?.value, this.props.locale || this.context.locale, this.props.enumValues);

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

      return R('span', null,
        str);
    }
  };
  LiteralExprStringComponent.initClass();
  return LiteralExprStringComponent;
})();
        
