var H, React, RemovableComponent,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

module.exports = RemovableComponent = (function(superClass) {
  extend(RemovableComponent, superClass);

  function RemovableComponent() {
    return RemovableComponent.__super__.constructor.apply(this, arguments);
  }

  RemovableComponent.propTypes = {
    onRemove: React.PropTypes.func
  };

  RemovableComponent.prototype.render = function() {
    return H.div({
      style: {
        display: "flex"
      },
      className: "hover-display-parent"
    }, H.div({
      style: {
        flex: "1 1 auto"
      }
    }, this.props.children), this.props.onRemove ? H.div({
      style: {
        flex: "0 0 auto",
        alignSelf: "center"
      },
      className: "hover-display-child"
    }, H.a({
      onClick: this.props.onRemove,
      style: {
        fontSize: "80%",
        cursor: "pointer",
        marginLeft: 5
      }
    }, H.span({
      className: "glyphicon glyphicon-remove"
    }))) : void 0);
  };

  return RemovableComponent;

})(React.Component);
