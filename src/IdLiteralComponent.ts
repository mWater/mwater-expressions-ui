// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let IdLiteralComponent;
import PropTypes from 'prop-types';
import _ from 'lodash';
import React from 'react';
const R = React.createElement;
import { default as AsyncReactSelect } from 'react-select/async';
import { ExprCompiler } from "mwater-expressions";
import AsyncLoadComponent from 'react-library/lib/AsyncLoadComponent';

// Displays a combo box that allows selecting one or multiple text values from an expression
// Needs two indexes to work fast:
// create index on some_table (label_column);
// create index on some_table (lower(label_column) text_pattern_ops);
export default IdLiteralComponent = (function() {
  IdLiteralComponent = class IdLiteralComponent extends AsyncLoadComponent {
    static initClass() {
      this.propTypes = { 
        value: PropTypes.any, // String value of primary key or array of primary keys
        onChange: PropTypes.func.isRequired,  // Called with primary key or array of primary keys
        idTable: PropTypes.string.isRequired, // Array of id and name (localized string)
        schema: PropTypes.object.isRequired, // Schema of the database
        dataSource: PropTypes.object.isRequired, // Data source to use to get values
        placeholder: PropTypes.string,
        orderBy: PropTypes.array,   // Optional extra orderings. Put "main" as tableAlias. JsonQL
        multi: PropTypes.bool,      // Allow multiple values (id[] type)
        filter: PropTypes.object,   // Optional extra filter. Put "main" as tableAlias. JsonQL
        labelExpr: PropTypes.object, // Optional label expression to use. Defaults to label column or PK if none. JsonQL
        searchWithin: PropTypes.bool
      };
       // Allow searching anywhere in label, not just start
    }

    focus() {
      return this.select.focus();
    }

    // Override to determine if a load is needed. Not called on mounting
    isLoadNeeded(newProps, oldProps) { 
      return (newProps.value !== oldProps.value) || (newProps.idTable !== oldProps.idTable);
    }

    // Call callback with state changes
    load(props, prevProps, callback) {
      // Create query to get current value
      if (!props.value) { 
        callback({currentValue: null});
        return;
      }

      const table = props.schema.getTable(props.idTable);

      // Primary key column
      const idColumn = { type: "field", tableAlias: "main", column: table.primaryKey };
      const labelExpr = this.getLabelExpr();

      const query = {
        type: "query",
        selects: [
          { type: "select", expr: idColumn, alias: "value" },
          { type: "select", expr: labelExpr, alias: "label" }
        ],
        from: { type: "table", table: this.props.idTable, alias: "main" },
        where: {
          type: "op",
          op: "=",
          modifier: "any",
          exprs: [
            idColumn,
            { type: "literal", value: (props.multi ? props.value : [props.value]) }
          ]
        }
      };

      // Execute query
      return props.dataSource.performQuery(query, (err, rows) => {
        if (err || !rows[0]) {
          callback({currentValue: null});
          return; 
        }
        if (!this.props.multi) {
          return callback({currentValue: rows[0]});
        } else {
          return callback({currentValue: rows});
        }
      });
    }

    handleChange = value => {
      if (this.props.multi) {
        if (value && (value.length === 0)) {
          return this.props.onChange(null);
        } else {
          return this.props.onChange(_.pluck(value, "value"));
        }
      } else {
        return this.props.onChange(value?.value);
      }
    };

    getLabelExpr() {
      if (this.props.labelExpr) {
        return this.props.labelExpr;
      }

      const table = this.props.schema.getTable(this.props.idTable);
      if (table.label) {
        return { type: "field", tableAlias: "main", column: table.label };
      }

      // Use primary key. Ugly, but what else to do?. Cast to text.
      return { type: "op", op: "::text", exprs: [{ type: "field", tableAlias: "main", column: table.primaryKey }] };
    }

    loadOptions = (input, cb) => {
      let where;
      const table = this.props.schema.getTable(this.props.idTable);

      // Primary key column
      const idColumn = { type: "field", tableAlias: "main", column: table.primaryKey };
      const labelExpr = this.getLabelExpr();

      if (input) {
        where = {
          type: "op",
          op: "like",
          exprs: [
            { type: "op", op: "lower", exprs: [labelExpr] },
            (this.props.searchWithin ? "%" + input.toLowerCase() + "%" : input.toLowerCase() + "%")
          ]
        };
      } else {  
        where = null; 
      }

      // select <label column> as value from <table> where lower(<label column>) like 'input%' limit 50
      const query = {
        type: "query",
        selects: [
          { type: "select", expr: idColumn, alias: "value" },
          { type: "select", expr: labelExpr, alias: "label" }
        ],
        from: { type: "table", table: this.props.idTable, alias: "main" },
        where,
        orderBy: [{ ordinal: 2, direction: "asc" }],
        limit: 50
      };
    
      if (this.props.filter) { 
        if (query.where) {
          query.where = {
            type: "op",
            op: "and",
            exprs: [query.where, this.props.filter]
          };
        } else {
          query.where = this.props.filter;
        }
      }

      // Add custom orderings
      if (this.props.orderBy) {
        query.orderBy = this.props.orderBy.concat(query.orderBy);
      }

      // Execute query
      this.props.dataSource.performQuery(query, (err, rows) => {
        if (err) {
          return; 
        }

        // Filter null and blank
        rows = _.filter(rows, r => r.label);

        return cb(rows);
      });

    };

    render() {
      return R('div', {style: { width: "100%" }},
        R(AsyncReactSelect, { 
          ref: c => { return this.select = c; },
          value: this.state.currentValue,
          placeholder: this.props.placeholder || "Select",
          loadOptions: this.loadOptions,
          isMulti: this.props.multi,
          isClearable: true,
          isLoading: this.state.loading,
          onChange: this.handleChange,
          noOptionsMessage: () => "Type to search",
          defaultOptions: true,
          closeMenuOnScroll: true,
          menuPortalTarget: document.body,
          styles: { 
            // Keep menu above fixed data table headers and map
            menu: style => _.extend({}, style, {zIndex: 2000}),
            menuPortal: style => _.extend({}, style, {zIndex: 2000})
          }
        }));
    }
  };
  IdLiteralComponent.initClass();
  return IdLiteralComponent;
})();
