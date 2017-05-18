var H, IdFieldComponent, R, React, _, ui,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

R = React.createElement;

H = React.DOM;

_ = require('lodash');

ui = require('react-library/lib/bootstrap');

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
  }

  IdFieldComponent.prototype.isValid = function(string) {
    return /^[a-z][a-z_0-9]*$/.test(string);
  };

  IdFieldComponent.prototype.handleChange = function(ev) {
    return this.props.onChange(ev.target.value);
  };

  IdFieldComponent.prototype.render = function() {
    return R(ui.FormGroup, {
      label: "ID",
      hasWarnings: !this.isValid(this.props.value)
    }, H.input({
      type: "text",
      className: "form-control",
      value: this.props.value || "",
      onChange: this.handleChange
    }), H.p({
      className: "help-block"
    }, "Lowercase, numbers and underscores"));
  };

  return IdFieldComponent;

})(React.Component);
