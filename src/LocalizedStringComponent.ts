// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let LocalizedStringComponent;
import PropTypes from 'prop-types';
import React from 'react';
const R = React.createElement;

// Displays a localized string (_base: "en", en: "apple", fr: "pomme", etc)
export default LocalizedStringComponent = (function() {
  LocalizedStringComponent = class LocalizedStringComponent extends React.Component {
    static initClass() { 
      this.propTypes =
        {value: PropTypes.object};
    }

    render() {
      if (this.props.value) {
        return R('span', null, this.props.value[this.props.value._base || "en"]);
      } else {
        return null;
      }
    }
  };
  LocalizedStringComponent.initClass();
  return LocalizedStringComponent;
})();
