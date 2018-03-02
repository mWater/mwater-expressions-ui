var H, IdFieldComponent, PropTypes, R, React, _, ui,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

PropTypes = require('prop-types');

React = require('react');

R = React.createElement;

H = React.DOM;

_ = require('lodash');

ui = require('react-library/lib/bootstrap');

module.exports = IdFieldComponent = (function() {
  class IdFieldComponent extends React.Component {
    constructor(props) {
      super(props);
      this.isValid = this.isValid.bind(this);
      this.handleChange = this.handleChange.bind(this);
    }

    isValid(string) {
      boundMethodCheck(this, IdFieldComponent);
      return /^[a-z][a-z_0-9]*$/.test(string);
    }

    handleChange(ev) {
      boundMethodCheck(this, IdFieldComponent);
      return this.props.onChange(ev.target.value);
    }

    render() {
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
    }

  };

  IdFieldComponent.propTypes = {
    value: PropTypes.string, // The value
    onChange: PropTypes.func.isRequired // Called with new value
  };

  return IdFieldComponent;

}).call(this);
