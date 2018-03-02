var ExprCleaner, ExprElementBuilder, ExprLinkComponent, FilterExprComponent, H, PropTypes, R, React, RemovableComponent, StackedComponent, _, update,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

R = React.createElement;

H = React.DOM;

update = require('update-object');

ExprCleaner = require("mwater-expressions").ExprCleaner;

ExprElementBuilder = require('./ExprElementBuilder');

StackedComponent = require('./StackedComponent');

RemovableComponent = require('./RemovableComponent');

ExprLinkComponent = require('./ExprLinkComponent');

// Displays a boolean filter expression. Just shows "+ Add filter" (or other add label) when empty
module.exports = FilterExprComponent = (function() {
  class FilterExprComponent extends React.Component {
    constructor(props) {
      super(props);
      
      // Handle add filter clicked by wrapping in "and" if existing, otherwise adding a null
      this.handleAddFilter = this.handleAddFilter.bind(this);
      // Clean expression and pass up
      this.handleChange = this.handleChange.bind(this);
      // Handle change to a single item
      this.handleAndChange = this.handleAndChange.bind(this);
      this.handleAndRemove = this.handleAndRemove.bind(this);
      this.handleRemove = this.handleRemove.bind(this);
      this.state = {
        displayNull: false // Set true when initial null value should be displayed
      };
    }

    handleAddFilter() {
      boundMethodCheck(this, FilterExprComponent);
      // If already "and", add null
      if (this.props.value && this.props.value.op === "and") {
        this.props.onChange(update(this.props.value, {
          exprs: {
            $push: [null]
          }
        }));
        return;
      }
      // If already has value, wrap in and
      if (this.props.value) {
        this.props.onChange({
          type: "op",
          op: "and",
          table: this.props.table,
          exprs: [this.props.value, null]
        });
        return;
      }
      return this.setState({
        displayNull: true
      }, () => {
        var ref;
        return (ref = this.refs.newExpr) != null ? ref.showModal() : void 0;
      });
    }

    handleChange(expr) {
      boundMethodCheck(this, FilterExprComponent);
      return this.props.onChange(this.cleanExpr(expr));
    }

    // Cleans an expression
    cleanExpr(expr) {
      return new ExprCleaner(this.props.schema).cleanExpr(expr, {
        table: this.props.table,
        types: ["boolean"]
      });
    }

    handleAndChange(i, expr) {
      boundMethodCheck(this, FilterExprComponent);
      return this.handleChange(update(this.props.value, {
        exprs: {
          $splice: [[i, 1, expr]]
        }
      }));
    }

    handleAndRemove(i) {
      boundMethodCheck(this, FilterExprComponent);
      return this.handleChange(update(this.props.value, {
        exprs: {
          $splice: [[i, 1]]
        }
      }));
    }

    handleRemove() {
      boundMethodCheck(this, FilterExprComponent);
      this.setState({
        displayNull: false
      });
      return this.handleChange(null);
    }

    renderAddFilter() {
      return H.div(null, H.a({
        onClick: this.handleAddFilter
      }, this.props.addLabel));
    }

    render() {
      var expr;
      expr = this.cleanExpr(this.props.value);
      // Render each item of and
      if (expr && expr.op === "and") {
        return H.div(null, R(StackedComponent, {
          joinLabel: "and",
          items: _.map(expr.exprs, (subexpr, i) => {
            return {
              elem: new ExprElementBuilder(this.props.schema, this.props.dataSource, this.context.locale).build(subexpr, this.props.table, this.handleAndChange.bind(null, i), {
                types: ["boolean"],
                preferLiteral: false,
                suppressWrapOps: ['and'] // Don't allow wrapping in and since this is an and control
              }),
              onRemove: this.handleAndRemove.bind(null, i)
            };
          })
        // Only display add if last item is not null
        }), _.last(expr.exprs) !== null ? this.renderAddFilter() : void 0);
      } else if (expr) {
        return H.div(null, R(RemovableComponent, {
          onRemove: this.handleRemove
        }, new ExprElementBuilder(this.props.schema, this.props.dataSource, this.context.locale).build(expr, this.props.table, this.handleChange, {
          types: ["boolean"],
          preferLiteral: false,
          suppressWrapOps: ['and'] // Don't allow wrapping in and since this is an and control
        // Only display add if has a value
        })), this.renderAddFilter());
      } else if (this.state.displayNull) {
        return R(ExprLinkComponent, {
          ref: "newExpr",
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: this.props.table,
          onChange: this.handleChange
        });
      } else {
        return this.renderAddFilter();
      }
    }

  };

  FilterExprComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired, // Data source to use to get values
    table: PropTypes.string.isRequired, // Current table
    value: PropTypes.object, // Current value
    onChange: PropTypes.func, // Called with new expression
    addLabel: PropTypes.node // Label for adding item. Default "+ Add Label"
  };

  FilterExprComponent.contextTypes = {
    locale: PropTypes.string // e.g. "en"
  };

  FilterExprComponent.defaultProps = {
    addLabel: "+ Add Filter"
  };

  return FilterExprComponent;

}).call(this);
