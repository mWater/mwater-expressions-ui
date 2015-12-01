var CrossComponent, H, R, React, StackedComponent, width,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CrossComponent = require('react-library/lib/CrossComponent');

React = require('react');

H = React.DOM;

R = React.createElement;

width = 60;

module.exports = StackedComponent = (function(superClass) {
  extend(StackedComponent, superClass);

  function StackedComponent() {
    return StackedComponent.__super__.constructor.apply(this, arguments);
  }

  StackedComponent.propTypes = {
    joinLabel: React.PropTypes.node,
    items: React.PropTypes.arrayOf(React.PropTypes.shape({
      elem: React.PropTypes.node.isRequired,
      onRemove: React.PropTypes.func
    })).isRequired
  };

  StackedComponent.prototype.renderRow = function(item, i, first, last) {
    return H.div({
      style: {
        display: "flex"
      },
      className: "hover-display-parent"
    }, H.div({
      style: {
        flex: "0 0 " + width + "px",
        display: "flex"
      }
    }, R(CrossComponent, {
      n: !first ? "solid 1px #DDD" : void 0,
      e: "solid 1px #DDD",
      s: !last ? "solid 1px #DDD" : void 0
    })), H.div({
      style: {
        flex: "1 1 auto"
      }
    }, item.elem), item.onRemove ? H.div({
      style: {
        flex: "0 0 auto",
        alignSelf: "center"
      },
      className: "hover-display-child"
    }, H.a({
      onClick: item.onRemove,
      style: {
        fontSize: "80%",
        cursor: "pointer",
        marginLeft: 5
      }
    }, H.span({
      className: "glyphicon glyphicon-remove"
    }))) : void 0);
  };

  StackedComponent.prototype.render = function() {
    var child, i, j, len, ref, rowElems;
    rowElems = [];
    ref = this.props.items;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      child = ref[i];
      if (i > 0 && this.props.joinLabel) {
        rowElems.push(H.div({
          style: {
            width: width,
            textAlign: "center"
          }
        }, this.props.joinLabel));
      }
      rowElems.push(this.renderRow(child, i, i === 0, i === this.props.items.length - 1));
    }
    return H.div({
      style: {
        display: "flex",
        flexDirection: "column"
      }
    }, rowElems);
  };

  return StackedComponent;

})(React.Component);
