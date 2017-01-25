var FormGroupComponent, H, R, React, _, classNames,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

R = React.createElement;

H = React.DOM;

_ = require('lodash');

classNames = require('classnames');

module.exports = FormGroupComponent = (function(superClass) {
  extend(FormGroupComponent, superClass);

  function FormGroupComponent() {
    return FormGroupComponent.__super__.constructor.apply(this, arguments);
  }

  FormGroupComponent.prototype.render = function() {
    var classes;
    classes = {
      "form-group": true,
      "has-error": this.props.hasErrors,
      "has-warning": this.props.hasWarnings,
      "has-success": this.props.hasSuccess
    };
    return H.div({
      className: classNames(classes)
    }, H.label(null, this.props.label), this.props.children);
  };

  return FormGroupComponent;

})(React.Component);
