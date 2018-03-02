var H, PropTypes, React, RemovableComponent;

PropTypes = require('prop-types');

React = require('react');

H = React.DOM;

// Component with a remove x to the right
module.exports = RemovableComponent = (function() {
  class RemovableComponent extends React.Component {
    render() {
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
    }

  };

  RemovableComponent.propTypes = {
    onRemove: PropTypes.func // Pass to put a remove link on right of specified item
  };

  return RemovableComponent;

}).call(this);
