var BuildEnumsetExprComponent, ExprUtils, H, R, React, RemovableComponent, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

R = React.createElement;

H = React.DOM;

ExprUtils = require("mwater-expressions").ExprUtils;

RemovableComponent = require('./RemovableComponent');

module.exports = BuildEnumsetExprComponent = (function(superClass) {
  extend(BuildEnumsetExprComponent, superClass);

  function BuildEnumsetExprComponent() {
    this.handleValueChange = bind(this.handleValueChange, this);
    return BuildEnumsetExprComponent.__super__.constructor.apply(this, arguments);
  }

  BuildEnumsetExprComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    value: React.PropTypes.object,
    enumValues: React.PropTypes.array,
    onChange: React.PropTypes.func
  };

  BuildEnumsetExprComponent.contextTypes = {
    locale: React.PropTypes.string
  };

  BuildEnumsetExprComponent.prototype.handleValueChange = function(id, value) {
    var values;
    values = _.clone(this.props.value.values);
    values[id] = value;
    return this.props.onChange(_.extend({}, this.props.value, {
      values: values
    }));
  };

  BuildEnumsetExprComponent.prototype.renderValues = function() {
    var ExprComponent, exprUtils;
    ExprComponent = require('./ExprComponent');
    exprUtils = new ExprUtils(this.props.schema);
    return H.table({
      className: "table table-bordered"
    }, H.thead(null, H.tr(null, H.th({
      key: "name"
    }, "Choice"), H.th({
      key: "include"
    }, "Include if"))), H.tbody(null, _.map(this.props.enumValues, (function(_this) {
      return function(enumValue) {
        return H.tr({
          key: enumValue.id
        }, H.td({
          key: "name"
        }, exprUtils.localizeString(enumValue.name, _this.context.locale)), H.td({
          key: "value",
          style: {
            maxWidth: "30em"
          }
        }, R(ExprComponent, {
          schema: _this.props.schema,
          dataSource: _this.props.dataSource,
          table: _this.props.value.table,
          value: _this.props.value.values[enumValue.id],
          onChange: _this.handleValueChange.bind(null, enumValue.id),
          types: ['boolean']
        })));
      };
    })(this))));
  };

  BuildEnumsetExprComponent.prototype.render = function() {
    return R(RemovableComponent, {
      onRemove: this.props.onChange.bind(null, null)
    }, this.props.enumValues ? this.renderValues() : H.i(null, "Cannot display build enumset without known values"));
  };

  return BuildEnumsetExprComponent;

})(React.Component);
