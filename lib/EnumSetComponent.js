var EnumSetComponent, ExprUtils, H, PropTypes, React, ReactSelect, _,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

PropTypes = require('prop-types');

React = require('react');

H = React.DOM;

ReactSelect = require('react-select');

_ = require('lodash');

ExprUtils = require("mwater-expressions").ExprUtils;

// Component which displays an array of enums
module.exports = EnumSetComponent = (function() {
  class EnumSetComponent extends React.Component {
    constructor() {
      super(...arguments);
      this.handleChange = this.handleChange.bind(this);
    }

    handleChange(val) {
      var value;
      boundMethodCheck(this, EnumSetComponent);
      value = val ? val.split("\n") : [];
      value = _.map(value, JSON.parse);
      if (value.length > 0) {
        return this.props.onChange({
          type: "literal",
          valueType: "enumset",
          value: value
        });
      } else {
        return this.props.onChange(null);
      }
    }

    render() {
      var options, value;
      value = null;
      if (this.props.value && this.props.value.value.length > 0) {
        value = _.map(this.props.value.value, JSON.stringify).join("\n");
      }
      // Use JSON to allow non-strings as ids
      options = _.map(this.props.enumValues, (val) => {
        return {
          value: JSON.stringify(val.id),
          label: ExprUtils.localizeString(val.name, this.context.locale)
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
    }

  };

  EnumSetComponent.propTypes = {
    value: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    enumValues: PropTypes.array.isRequired // Array of id and name (localized string)
  };

  EnumSetComponent.contextTypes = {
    locale: PropTypes.string // e.g. "en"
  };

  return EnumSetComponent;

}).call(this);
