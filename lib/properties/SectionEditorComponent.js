var H, IdFieldComponent, LocalizedStringEditorComp, PropTypes, R, React, SectionEditorComponent, _, ui;

PropTypes = require('prop-types');

React = require('react');

R = React.createElement;

H = React.DOM;

_ = require('lodash');

ui = require('react-library/lib/bootstrap');

LocalizedStringEditorComp = require('../LocalizedStringEditorComp');

IdFieldComponent = require('./IdFieldComponent');

// edit section
module.exports = SectionEditorComponent = (function() {
  class SectionEditorComponent extends React.Component {
    render() {
      // todo: validate id
      // Sections need an id
      return H.div(null, _.includes(this.props.features, "idField") ? (R(IdFieldComponent, {
        value: this.props.property.id,
        onChange: (value) => {
          return this.props.onChange(_.extend({}, this.props.property, {
            id: value
          }));
        }
      }), R(ui.FormGroup, {
        label: "ID"
      }, H.input({
        type: "text",
        className: "form-control",
        value: this.props.property.id,
        onChange: (ev) => {
          return this.props.onChange(_.extend({}, this.props.property, {
            id: ev.target.value
          }));
        }
      }), H.p({
        className: "help-block"
      }, "Letters lowercase, numbers and _ only. No spaces or uppercase"))) : void 0, _.includes(this.props.features, "code") ? R(ui.FormGroup, {
        label: "Code"
      }, H.input({
        type: "text",
        className: "form-control",
        value: this.props.property.code,
        onChange: (ev) => {
          return this.props.onChange(_.extend({}, this.props.property, {
            code: ev.target.value
          }));
        }
      })) : void 0, R(ui.FormGroup, {
        label: "Name"
      }, R(LocalizedStringEditorComp, {
        value: this.props.property.name,
        onChange: (value) => {
          return this.props.onChange(_.extend({}, this.props.property, {
            name: value
          }));
        }
      })), R(ui.FormGroup, {
        label: "Description"
      }, R(LocalizedStringEditorComp, {
        value: this.props.property.desc,
        onChange: (value) => {
          return this.props.onChange(_.extend({}, this.props.property, {
            desc: value
          }));
        }
      })));
    }

  };

  SectionEditorComponent.propTypes = {
    property: PropTypes.object.isRequired, // The property being edited
    onChange: PropTypes.func.isRequired, // Function called when anything is changed in the editor
    features: PropTypes.array // Features to be enabled apart from the default features
  };

  SectionEditorComponent.defaultProps = {
    features: []
  };

  return SectionEditorComponent;

}).call(this);
