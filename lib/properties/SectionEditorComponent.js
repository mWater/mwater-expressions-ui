var H, IdFieldComponent, LocalizedStringEditorComp, PropertyListEditorComponent, R, React, SectionEditorComponent, _, ui,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

R = React.createElement;

H = React.DOM;

_ = require('lodash');

ui = require('react-library/lib/bootstrap');

LocalizedStringEditorComp = require('../LocalizedStringEditorComp');

PropertyListEditorComponent = require('./PropertyListEditorComponent');

IdFieldComponent = require('./IdFieldComponent');

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
    return H.div(null, _.includes(this.props.features, "idField") ? (R(IdFieldComponent, {
      value: this.props.property.id,
      onChange: (function(_this) {
        return function(value) {
          return _this.props.onChange(_.extend({}, _this.props.property, {
            id: value
          }));
        };
      })(this)
    }), R(ui.FormGroup, {
      label: "ID"
    }, H.input({
      type: "text",
      className: "form-control",
      value: this.props.property.id,
      onChange: (function(_this) {
        return function(ev) {
          return _this.props.onChange(_.extend({}, _this.props.property, {
            id: ev.target.value
          }));
        };
      })(this)
    }), H.p({
      className: "help-block"
    }, "Letters lowercase, numbers and _ only. No spaces or uppercase"))) : void 0, _.includes(this.props.features, "code") ? R(ui.FormGroup, {
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
    })) : void 0, R(ui.FormGroup, {
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
    })), R(ui.FormGroup, {
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
