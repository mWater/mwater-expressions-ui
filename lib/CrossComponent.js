var CrossComponent, H, React,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

module.exports = CrossComponent = (function(superClass) {
  extend(CrossComponent, superClass);

  function CrossComponent() {
    return CrossComponent.__super__.constructor.apply(this, arguments);
  }

  CrossComponent.propTypes = {
    n: React.PropTypes.string,
    e: React.PropTypes.string,
    s: React.PropTypes.string,
    w: React.PropTypes.string
  };

  CrossComponent.prototype.render = function() {
    return H.div({
      style: {
        display: "flex",
        flexDirection: "column",
        flex: "1 1 0px"
      }
    }, H.div({
      style: {
        display: "flex",
        flex: "1 1 0px",
        display: "flex"
      }
    }, H.div({
      style: {
        flex: "1 1 0px",
        borderRight: this.props.n
      }
    }), H.div({
      style: {
        flex: "1 1 0px",
        borderBottom: this.props.e
      }
    })), H.div({
      style: {
        display: "flex",
        flex: "1 1 0px",
        display: "flex"
      }
    }, H.div({
      style: {
        flex: "1 1 0px",
        borderRight: this.props.s
      }
    }), H.div({
      style: {
        flex: "1 1 0px",
        borderTop: this.props.w
      }
    })));
  };

  return CrossComponent;

})(React.Component);
