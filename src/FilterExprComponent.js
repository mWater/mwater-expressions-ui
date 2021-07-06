// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let FilterExprComponent;
import PropTypes from 'prop-types';
import _ from 'lodash';
import React from 'react';
const R = React.createElement;

import update from 'update-object';
import { ExprCleaner } from "mwater-expressions";
import ExprElementBuilder from './ExprElementBuilder';
import StackedComponent from './StackedComponent';
import RemovableComponent from './RemovableComponent';
import ExprLinkComponent from './ExprLinkComponent';

// Displays a boolean filter expression. Just shows "+ Add filter" (or other add label) when empty
export default FilterExprComponent = (function() {
  FilterExprComponent = class FilterExprComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        schema: PropTypes.object.isRequired,
        dataSource: PropTypes.object.isRequired, // Data source to use to get values
        variables: PropTypes.array,
  
        table: PropTypes.string.isRequired, // Current table
  
        value: PropTypes.object,   // Current value
        onChange: PropTypes.func,  // Called with new expression
        addLabel: PropTypes.node  // Label for adding item. Default "+ Add Label"
      };
  
      this.contextTypes =
        {locale: PropTypes.string};  // e.g. "en"
  
      this.defaultProps = {
        addLabel: "+ Add Filter",
        variables: []
      };
    }

    constructor(props) {
      super(props);

      this.state = { displayNull: false }; // Set true when initial null value should be displayed
    }

    // Handle add filter clicked by wrapping in "and" if existing, otherwise adding a null
    handleAddFilter = () => {
      // If already "and", add null
      if (this.props.value && (this.props.value.op === "and")) {
        this.props.onChange(update(this.props.value, {exprs: { $push: [null] }}));
        return;
      }

      // If already has value, wrap in and
      if (this.props.value) {
        this.props.onChange({ type: "op", op: "and", table: this.props.table, exprs: [this.props.value, null] });
        return;
      }

      return this.setState({displayNull: true}, () => this.newExpr?.showModal());
    };

    // Clean expression and pass up
    handleChange = expr => {
      return this.props.onChange(this.cleanExpr(expr));
    };

    // Cleans an expression
    cleanExpr(expr) {
      return new ExprCleaner(this.props.schema, this.props.variables).cleanExpr(expr, {
        table: this.props.table,
        types: ["boolean"]
      });
    }

    // Handle change to a single item
    handleAndChange = (i, expr) => {
      return this.handleChange(update(this.props.value, {exprs: { $splice: [[i, 1, expr]]}}));
    };

    handleAndRemove = i => {
      return this.handleChange(update(this.props.value, {exprs: { $splice: [[i, 1]]}}));    
    };

    handleRemove = () => {
      this.setState({displayNull: false});
      return this.handleChange(null);    
    };

    renderAddFilter() {
      return R('div', null, 
        R('a', {onClick: this.handleAddFilter}, this.props.addLabel));
    }

    render() {
      const expr = this.cleanExpr(this.props.value);

      // Render each item of and
      if (expr && (expr.op === "and")) {
        return R('div', null,
          R(StackedComponent, { 
            joinLabel: "and",
            items: _.map(expr.exprs, (subexpr, i) => {
              return {
                elem: new ExprElementBuilder(this.props.schema, this.props.dataSource, this.context.locale, this.props.variables).build(subexpr, this.props.table, (this.props.onChange ? this.handleAndChange.bind(null, i) : undefined), { 
                  types: ["boolean"],
                  preferLiteral: false,
                  suppressWrapOps: ['and']   // Don't allow wrapping in and since this is an and control
                }),
                onRemove: this.props.onChange ? this.handleAndRemove.bind(null, i) : undefined
              };
            })
          }
          ),

          // Only display add if last item is not null
          (_.last(expr.exprs) !== null) && this.props.onChange ?
            this.renderAddFilter() : undefined
        );

      } else if (expr) { 
        return R('div', null,
          R(RemovableComponent, 
            {onRemove: this.props.onChange ? this.handleRemove : undefined},
            new ExprElementBuilder(this.props.schema, this.props.dataSource, this.context.locale, this.props.variables).build(expr, this.props.table, (this.props.onChange ? this.handleChange : undefined), { 
              types: ["boolean"],
              preferLiteral: false,
              suppressWrapOps: ['and']  // Don't allow wrapping in and since this is an and control
            })
          ),

          // Only display add if has a value
          this.renderAddFilter());
      } else if (this.state.displayNull) {
        return R(ExprLinkComponent, { 
          ref: c => { return this.newExpr = c; },
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          variables: this.props.variables,
          table: this.props.table,
          onChange: this.props.onChange ? this.handleChange : undefined
        }
        );
      } else {
        return this.renderAddFilter();
      }
    }
  };
  FilterExprComponent.initClass();
  return FilterExprComponent;
})();
