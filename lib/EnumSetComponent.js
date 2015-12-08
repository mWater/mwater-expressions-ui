var EnumArrComponent, H, React, ReactSelect, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

ReactSelect = require('react-select');

_ = require('lodash');

module.exports = EnumArrComponent = (function(superClass) {
  extend(EnumArrComponent, superClass);

  function EnumArrComponent() {
    this.handleChange = bind(this.handleChange, this);
    return EnumArrComponent.__super__.constructor.apply(this, arguments);
  }

  EnumArrComponent.propTypes = {
    value: React.PropTypes.object,
    onChange: React.PropTypes.func.isRequired,
    enumValues: React.PropTypes.array.isRequired
  };

  EnumArrComponent.prototype.handleChange = function(val) {
    var value;
    value = val ? val.split("\n") : [];
    value = _.map(value, JSON.parse);
    return this.props.onChange({
      type: "literal",
      valueType: "enumset",
      value: value
    });
  };

  EnumArrComponent.prototype.render = function() {
    var options, value;
    value = null;
    if (this.props.value && this.props.value.value.length > 0) {
      value = _.map(this.props.value.value, JSON.stringify).join("\n");
    }
    options = _.map(this.props.enumValues, function(val) {
      return {
        value: JSON.stringify(val.id),
        label: val.name
      };
    });
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

  return EnumArrComponent;

})(React.Component);
