var ExprCleaner, ExprComponent, ExprElementBuilder, H, R, React, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

R = React.createElement;

H = React.DOM;

ExprCleaner = require("mwater-expressions").ExprCleaner;

ExprElementBuilder = require('./ExprElementBuilder');

module.exports = ExprComponent = (function(superClass) {
  extend(ExprComponent, superClass);

  function ExprComponent() {
    this.handleChange = bind(this.handleChange, this);
    return ExprComponent.__super__.constructor.apply(this, arguments);
  }

  ExprComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    table: React.PropTypes.string.isRequired,
    value: React.PropTypes.object,
    onChange: React.PropTypes.func,
    type: React.PropTypes.string,
    enumValues: React.PropTypes.array,
    idTable: React.PropTypes.string,
    preferLiteral: React.PropTypes.bool,
    includeCount: React.PropTypes.bool
  };

  ExprComponent.contextTypes = {
    locale: React.PropTypes.string
  };

  ExprComponent.prototype.handleChange = function(expr) {
    expr = new ExprCleaner(this.props.schema).cleanExpr(expr, {
      table: this.props.table,
      type: this.props.type,
      enumValueIds: this.props.enumValues ? _.pluck(this.props.enumValues, "id") : void 0,
      idTable: this.props.idTable
    });
    return this.props.onChange(expr);
  };

  ExprComponent.prototype.render = function() {
    return new ExprElementBuilder(this.props.schema, this.props.dataSource, this.context.locale).build(this.props.value, this.props.table, this.handleChange, {
      type: this.props.type,
      enumValues: this.props.enumValues,
      preferLiteral: this.props.preferLiteral,
      idTable: this.props.idTable
    });
  };

  return ExprComponent;

})(React.Component);
