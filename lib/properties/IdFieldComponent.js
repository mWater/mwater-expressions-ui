var FormGroupComponent, H, IdFieldComponent, R, React, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

R = React.createElement;

H = React.DOM;

_ = require('lodash');

FormGroupComponent = require('./FormGroupComponent');

module.exports = IdFieldComponent = (function(superClass) {
  extend(IdFieldComponent, superClass);

  IdFieldComponent.propTypes = {
    value: React.PropTypes.string,
    onChange: React.PropTypes.func.isRequired
  };

  function IdFieldComponent(props) {
    this.handleChange = bind(this.handleChange, this);
    this.isValid = bind(this.isValid, this);
    IdFieldComponent.__super__.constructor.call(this, props);
    this.state = {
      value: this.props.value,
      valid: this.isValid(props.value)
    };
  }

  IdFieldComponent.prototype.isValid = function(string) {
    return /^[a-z][a-z_0-9]*$/.test(string);
  };

  IdFieldComponent.prototype.handleChange = function(ev) {
    this.setState({
      value: ev.target.value,
      valid: this.isValid(ev.target.value)
    });
    if (this.state.valid) {
      return this.props.onChange(ev.target.value);
    }
  };

  IdFieldComponent.prototype.render = function() {
    return R(FormGroupComponent, {
      label: "ID",
      hasErrors: !this.state.valid
    }, H.input({
      type: "text",
      className: "form-control",
      value: this.state.value || "",
      onChange: this.handleChange
    }), H.p({
      className: "help-block"
    }, "Lowercase, numbers and underscores"));
  };

  return IdFieldComponent;

})(React.Component);
