var DropdownComponent, H, R, React,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

R = React.createElement;

H = React.DOM;

module.exports = DropdownComponent = (function(superClass) {
  extend(DropdownComponent, superClass);

  function DropdownComponent() {
    return DropdownComponent.__super__.constructor.apply(this, arguments);
  }

  DropdownComponent.propTypes = {
    dropdown: React.PropTypes.node
  };

  DropdownComponent.prototype.render = function() {
    return H.div({
      className: "dropdown " + (this.props.dropdown ? "open" : "")
    }, this.props.children, this.props.dropdown ? H.div({
      className: "dropdown-menu",
      style: {
        minWidth: 500
      }
    }, this.props.dropdown) : void 0);
  };

  return DropdownComponent;

})(React.Component);
