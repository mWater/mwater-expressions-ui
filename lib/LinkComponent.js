var H, LinkComponent, PropTypes, React, _,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

PropTypes = require('prop-types');

React = require('react');

H = React.DOM;

_ = require('lodash');

// Component that is blue to show that it is a link and responds to clicks
// Also has a dropdown component if dropdown items are specified
module.exports = LinkComponent = (function() {
  class LinkComponent extends React.Component {
    constructor() {
      super(...arguments);
      this.renderDropdownItem = this.renderDropdownItem.bind(this);
    }

    renderRemove() {
      if (this.props.onRemove) {
        return H.span({
          className: "link-component-remove",
          onClick: this.props.onRemove
        }, H.span({
          className: "glyphicon glyphicon-remove"
        }));
      }
    }

    renderDropdownItem(item) {
      var id, key, name;
      boundMethodCheck(this, LinkComponent);
      id = item.id || item.value;
      name = item.name || item.label;
      
      // Handle divider
      if (name == null) {
        return H.li({
          className: "divider"
        });
      }
      // Get a string key
      key = id;
      if (!_.isString(key)) {
        key = JSON.stringify(key);
      }
      return H.li({
        key: key
      }, H.a({
        key: id,
        onClick: this.props.onDropdownItemClicked.bind(null, id)
      }, name));
    }

    render() {
      var elem;
      elem = H.div({
        className: "link-component",
        "data-toggle": "dropdown"
      }, H.div({
        style: {
          display: "inline-block"
        },
        onClick: this.props.onClick
      }, this.props.children), this.renderRemove());
      // If dropdown
      if (this.props.dropdownItems) {
        return H.div({
          className: "dropdown",
          style: {
            display: "inline-block"
          }
        }, elem, H.ul({
          className: "dropdown-menu",
          style: {
            cursor: "pointer"
          }
        }, _.map(this.props.dropdownItems, this.renderDropdownItem)));
      } else {
        return elem;
      }
    }

  };

  LinkComponent.propTypes = {
    onClick: PropTypes.func, // Called on click
    onRemove: PropTypes.func, // Adds an x if specified 
    dropdownItems: PropTypes.array, // Array of { id, name } or { value, label } to display as dropdown. Null name/label is a separator
    onDropdownItemClicked: PropTypes.func // Called with id/value of dropdown item
  };

  return LinkComponent;

}).call(this);
