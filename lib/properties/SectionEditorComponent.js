var FormGroupComponent, H, LocalizedStringEditorComp, PropertyListEditorComponent, R, React, SectionEditorComponent, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

R = React.createElement;

H = React.DOM;

_ = require('lodash');

LocalizedStringEditorComp = require('../LocalizedStringEditorComp');

PropertyListEditorComponent = require('./PropertyListEditorComponent');

module.exports = SectionEditorComponent = (function(superClass) {
  extend(SectionEditorComponent, superClass);

  function SectionEditorComponent() {
    return SectionEditorComponent.__super__.constructor.apply(this, arguments);
  }

  SectionEditorComponent.propTypes = {
    property: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired,
    features: React.PropTypes.array
  };

  SectionEditorComponent.defaultProps = {
    features: []
  };

  SectionEditorComponent.prototype.render = function() {
    return H.div(null, _.includes(this.props.features, "code") ? R(FormGroupComponent, {
      label: "Code"
    }, H.input({
      type: "text",
      className: "form-control",
      value: this.props.property.code,
      onChange: (function(_this) {
        return function(ev) {
          return _this.props.onChange(_.extend({}, _this.props.property, {
            code: ev.target.value
          }));
        };
      })(this)
    })) : void 0, R(FormGroupComponent, {
      label: "Name"
    }, R(LocalizedStringEditorComp, {
      value: this.props.property.name,
      onChange: (function(_this) {
        return function(value) {
          return _this.props.onChange(_.extend({}, _this.props.property, {
            name: value
          }));
        };
      })(this)
    })), R(FormGroupComponent, {
      label: "Description"
    }, R(LocalizedStringEditorComp, {
      value: this.props.property.desc,
      onChange: (function(_this) {
        return function(value) {
          return _this.props.onChange(_.extend({}, _this.props.property, {
            desc: value
          }));
        };
      })(this)
    })));
  };

  return SectionEditorComponent;

})(React.Component);

FormGroupComponent = (function(superClass) {
  extend(FormGroupComponent, superClass);

  function FormGroupComponent() {
    return FormGroupComponent.__super__.constructor.apply(this, arguments);
  }

  FormGroupComponent.prototype.render = function() {
    return H.div({
      className: "form-group"
    }, H.label(null, this.props.label), this.props.children);
  };

  return FormGroupComponent;

})(React.Component);
