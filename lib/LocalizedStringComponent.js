var H, LocalizedStringComponent, PropTypes, React;

PropTypes = require('prop-types');

React = require('react');

H = React.DOM;

// Displays a localized string (_base: "en", en: "apple", fr: "pomme", etc)
module.exports = LocalizedStringComponent = (function() {
  class LocalizedStringComponent extends React.Component {
    render() {
      if (this.props.value) {
        return H.span(null, this.props.value[this.props.value._base || "en"]);
      } else {
        return null;
      }
    }

  };

  LocalizedStringComponent.propTypes = {
    value: PropTypes.object
  };

  return LocalizedStringComponent;

}).call(this);
