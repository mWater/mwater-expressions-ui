var ExprCleaner, ExprElementBuilder, ExprLinkComponent, FilterExprComponent, PropTypes, R, React, RemovableComponent, StackedComponent, _, update,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

R = React.createElement;

update = require('update-object');

ExprCleaner = require("mwater-expressions").ExprCleaner;

ExprElementBuilder = require('./ExprElementBuilder');

StackedComponent = require('./StackedComponent');

RemovableComponent = require('./RemovableComponent');

ExprLinkComponent = require('./ExprLinkComponent');

module.exports = FilterExprComponent = (function(superClass) {
  extend(FilterExprComponent, superClass);

  FilterExprComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    variables: PropTypes.array,
    table: PropTypes.string.isRequired,
    value: PropTypes.object,
    onChange: PropTypes.func,
    addLabel: PropTypes.node
  };

  FilterExprComponent.contextTypes = {
    locale: PropTypes.string
  };

  FilterExprComponent.defaultProps = {
    addLabel: "+ Add Filter",
    variables: []
  };

  function FilterExprComponent(props) {
    this.handleRemove = bind(this.handleRemove, this);
    this.handleAndRemove = bind(this.handleAndRemove, this);
    this.handleAndChange = bind(this.handleAndChange, this);
    this.handleChange = bind(this.handleChange, this);
    this.handleAddFilter = bind(this.handleAddFilter, this);
    FilterExprComponent.__super__.constructor.call(this, props);
    this.state = {
      displayNull: false
    };
  }

  FilterExprComponent.prototype.handleAddFilter = function() {
    if (this.props.value && this.props.value.op === "and") {
      this.props.onChange(update(this.props.value, {
        exprs: {
          $push: [null]
        }
      }));
      return;
    }
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
    }, (function(_this) {
      return function() {
        var ref;
        return (ref = _this.newExpr) != null ? ref.showModal() : void 0;
      };
    })(this));
  };

  FilterExprComponent.prototype.handleChange = function(expr) {
    return this.props.onChange(this.cleanExpr(expr));
  };

  FilterExprComponent.prototype.cleanExpr = function(expr) {
    return new ExprCleaner(this.props.schema).cleanExpr(expr, {
      table: this.props.table,
      types: ["boolean"]
    });
  };

  FilterExprComponent.prototype.handleAndChange = function(i, expr) {
    return this.handleChange(update(this.props.value, {
      exprs: {
        $splice: [[i, 1, expr]]
      }
    }));
  };

  FilterExprComponent.prototype.handleAndRemove = function(i) {
    return this.handleChange(update(this.props.value, {
      exprs: {
        $splice: [[i, 1]]
      }
    }));
  };

  FilterExprComponent.prototype.handleRemove = function() {
    this.setState({
      displayNull: false
    });
    return this.handleChange(null);
  };

  FilterExprComponent.prototype.renderAddFilter = function() {
    return R('div', null, R('a', {
      onClick: this.handleAddFilter
    }, this.props.addLabel));
  };

  FilterExprComponent.prototype.render = function() {
    var expr;
    expr = this.cleanExpr(this.props.value);
    if (expr && expr.op === "and") {
      return R('div', null, R(StackedComponent, {
        joinLabel: "and",
        items: _.map(expr.exprs, (function(_this) {
          return function(subexpr, i) {
            return {
              elem: new ExprElementBuilder(_this.props.schema, _this.props.dataSource, _this.context.locale, _this.props.variables).build(subexpr, _this.props.table, _this.handleAndChange.bind(null, i), {
                types: ["boolean"],
                preferLiteral: false,
                suppressWrapOps: ['and']
              }),
              onRemove: _this.handleAndRemove.bind(null, i)
            };
          };
        })(this))
      }), _.last(expr.exprs) !== null ? this.renderAddFilter() : void 0);
    } else if (expr) {
      return R('div', null, R(RemovableComponent, {
        onRemove: this.handleRemove
      }, new ExprElementBuilder(this.props.schema, this.props.dataSource, this.context.locale, this.props.variables).build(expr, this.props.table, this.handleChange, {
        types: ["boolean"],
        preferLiteral: false,
        suppressWrapOps: ['and']
      })), this.renderAddFilter());
    } else if (this.state.displayNull) {
      return R(ExprLinkComponent, {
        ref: (function(_this) {
          return function(c) {
            return _this.newExpr = c;
          };
        })(this),
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        variables: this.props.variables,
        table: this.props.table,
        onChange: this.handleChange
      });
    } else {
      return this.renderAddFilter();
    }
  };

  return FilterExprComponent;

})(React.Component);
