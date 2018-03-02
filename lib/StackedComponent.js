var CrossComponent, H, PropTypes, R, React, StackedComponent, width;

PropTypes = require('prop-types');

CrossComponent = require('react-library/lib/CrossComponent');

React = require('react');

H = React.DOM;

R = React.createElement;

width = 60;

// Displays a set of components vertically with lines connecting them
module.exports = StackedComponent = (function() {
  class StackedComponent extends React.Component {
    renderRow(item, i, first, last) {
      // Create row that has lines to the left
      return H.div({
        style: {
          display: "flex"
        },
        className: "hover-display-parent"
      }, H.div({
        style: {
          flex: `0 0 ${width}px`,
          display: "flex"
        }
      }, R(CrossComponent, {
        n: !first ? "solid 1px #DDD" : void 0,
        e: "solid 1px #DDD",
        s: !last ? "solid 1px #DDD" : void 0,
        height: "auto"
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
    }

    render() {
      var child, i, j, len, ref, rowElems;
      rowElems = [];
      ref = this.props.items;
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        child = ref[i];
        // If not first, add joiner
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
          flexDirection: "column" // Outer container
        }
      }, rowElems);
    }

  };

  StackedComponent.propTypes = {
    joinLabel: PropTypes.node, // Label between connections
    items: PropTypes.arrayOf(PropTypes.shape({
      elem: PropTypes.node.isRequired, // Elem to display
      onRemove: PropTypes.func // Pass to put a remove link on right of specified item
    })).isRequired
  };

  return StackedComponent;

}).call(this);
