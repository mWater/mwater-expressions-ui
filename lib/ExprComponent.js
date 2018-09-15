var ExprCleaner, ExprComponent, ExprElementBuilder, PropTypes, R, React, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

R = React.createElement;

ExprCleaner = require("mwater-expressions").ExprCleaner;

ExprElementBuilder = require('./ExprElementBuilder');

module.exports = ExprComponent = (function(superClass) {
  extend(ExprComponent, superClass);

  function ExprComponent() {
    this.handleChange = bind(this.handleChange, this);
    this.openEditor = bind(this.openEditor, this);
    return ExprComponent.__super__.constructor.apply(this, arguments);
  }

  ExprComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    table: PropTypes.string.isRequired,
    value: PropTypes.object,
    onChange: PropTypes.func,
    types: PropTypes.array,
    enumValues: PropTypes.array,
    idTable: PropTypes.string,
    preferLiteral: PropTypes.bool,
    aggrStatuses: PropTypes.array,
    placeholder: PropTypes.string
  };

  ExprComponent.defaultProps = {
    aggrStatuses: ["individual", "literal"]
  };

  ExprComponent.contextTypes = {
    locale: PropTypes.string
  };

  ExprComponent.prototype.openEditor = function() {
    var ref;
    return (ref = this.refs.exprLink) != null ? ref.showModal() : void 0;
  };

  ExprComponent.prototype.handleChange = function(expr) {
    return this.props.onChange(this.cleanExpr(expr));
  };

  ExprComponent.prototype.cleanExpr = function(expr) {
    return new ExprCleaner(this.props.schema).cleanExpr(expr, {
      table: this.props.table,
      types: this.props.types,
      enumValueIds: this.props.enumValues ? _.pluck(this.props.enumValues, "id") : void 0,
      idTable: this.props.idTable,
      aggrStatuses: this.props.aggrStatuses
    });
  };

  ExprComponent.prototype.render = function() {
    var expr;
    expr = this.cleanExpr(this.props.value);
    return new ExprElementBuilder(this.props.schema, this.props.dataSource, this.context.locale).build(expr, this.props.table, this.handleChange, {
      types: this.props.types,
      enumValues: this.props.enumValues,
      preferLiteral: this.props.preferLiteral,
      idTable: this.props.idTable,
      includeAggr: indexOf.call(this.props.aggrStatuses, "aggregate") >= 0,
      aggrStatuses: this.props.aggrStatuses,
      placeholder: this.props.placeholder,
      exprLinkRef: !expr ? "exprLink" : void 0
    });
  };

  return ExprComponent;

})(React.Component);
