var EnumSetComponent, ExprUtils, H, React, ReactSelect, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

ReactSelect = require('react-select');

_ = require('lodash');

ExprUtils = require("mwater-expressions").ExprUtils;

module.exports = EnumSetComponent = (function(superClass) {
  extend(EnumSetComponent, superClass);

  function EnumSetComponent() {
    this.handleChange = bind(this.handleChange, this);
    return EnumSetComponent.__super__.constructor.apply(this, arguments);
  }

  EnumSetComponent.propTypes = {
    value: React.PropTypes.object,
    onChange: React.PropTypes.func.isRequired,
    enumValues: React.PropTypes.array.isRequired
  };

  EnumSetComponent.contextTypes = {
    locale: React.PropTypes.string
  };

  EnumSetComponent.prototype.handleChange = function(val) {
    var value;
    value = val ? val.split("\n") : [];
    value = _.map(value, JSON.parse);
    return this.props.onChange({
      type: "literal",
      valueType: "enumset",
      value: value
    });
  };

  EnumSetComponent.prototype.render = function() {
    var options, value;
    value = null;
    if (this.props.value && this.props.value.value.length > 0) {
      value = _.map(this.props.value.value, JSON.stringify).join("\n");
    }
    options = _.map(this.props.enumValues, (function(_this) {
      return function(val) {
        return {
          value: JSON.stringify(val.id),
          label: ExprUtils.localizeString(val.name, _this.context.locale)
        };
      };
    })(this));
    return H.div({
      style: {
        width: "100%"
      }
    }, React.createElement(ReactSelect, {
      value: value,
      multi: true,
      delimiter: "\n",
      options: options,
      onChange: this.handleChange
    }));
  };

  return EnumSetComponent;

})(React.Component);
