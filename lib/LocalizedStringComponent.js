var H, LocalizedStringComponent, PropTypes, React,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

React = require('react');

H = React.DOM;

module.exports = LocalizedStringComponent = (function(superClass) {
  extend(LocalizedStringComponent, superClass);

  function LocalizedStringComponent() {
    return LocalizedStringComponent.__super__.constructor.apply(this, arguments);
  }

  LocalizedStringComponent.propTypes = {
    value: PropTypes.object
  };

  LocalizedStringComponent.prototype.render = function() {
    if (this.props.value) {
      return H.span(null, this.props.value[this.props.value._base || "en"]);
    } else {
      return null;
    }
  };

  return LocalizedStringComponent;

})(React.Component);
