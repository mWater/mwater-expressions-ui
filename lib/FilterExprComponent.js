var ExprComponent, FilterExprComponent, H, R, React, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

R = React.createElement;

H = React.DOM;

ExprComponent = require('./ExprComponent');

module.exports = FilterExprComponent = (function(superClass) {
  extend(FilterExprComponent, superClass);

  function FilterExprComponent() {
    this.handleAddFilter = bind(this.handleAddFilter, this);
    return FilterExprComponent.__super__.constructor.apply(this, arguments);
  }

  FilterExprComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    table: React.PropTypes.string.isRequired,
    value: React.PropTypes.object,
    onChange: React.PropTypes.func
  };

  FilterExprComponent.prototype.handleAddFilter = function() {};

  FilterExprComponent.prototype.render = function() {
    return R(ExprComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.table,
      value: this.props.value,
      onChange: this.props.onChange,
      type: "boolean"
    });
  };

  return FilterExprComponent;

})(React.Component);
