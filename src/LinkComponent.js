let LinkComponent;
import PropTypes from 'prop-types';
import React from 'react';
const R = React.createElement;
import _ from 'lodash';

// Component that is blue to show that it is a link and responds to clicks
// Also has a dropdown component if dropdown items are specified
export default LinkComponent = (function() {
  LinkComponent = class LinkComponent extends React.Component {
    constructor(...args) {
      super(...args);
      this.renderDropdownItem = this.renderDropdownItem.bind(this);
    }

    static initClass() {
      this.propTypes = {
        onClick: PropTypes.func, // Called on click
        onRemove: PropTypes.func, // Adds an x if specified 
        dropdownItems: PropTypes.array, // Array of { id, name } or { value, label } to display as dropdown. Null name/label is a separator
        onDropdownItemClicked: PropTypes.func
      };
       // Called with id/value of dropdown item
    }

    renderRemove() {
      if (this.props.onRemove) {
        return R('span', {className: "link-component-remove", onClick: this.props.onRemove},
          R('i', {className: "fa fa-remove"}));
      }
    }

    renderDropdownItem(item) {
      const id = item.id || item.value;
      const name = item.name || item.label;
    
      // Handle divider
      if ((name == null)) {
        return R('li', {className: "divider"});
      }

      // Get a string key
      let key = id;
      if (!_.isString(key)) {
        key = JSON.stringify(key);
      }

      return R('li', {key},
        R('a', {key: id, onClick: this.props.onDropdownItemClicked.bind(null, id)}, name));
    }

    render() {
      // Simple case
      if (!this.props.onClick && !this.props.onRemove && (!this.props.dropdownItems || (this.props.dropdownItems.length === 0))) {
        return R('div', {className: "link-component-readonly"}, this.props.children);
      }

      const elem = R('div', {className: "link-component", "data-toggle": "dropdown"}, 
        R('div', {style: { display: "inline-block" }, onClick: this.props.onClick}, 
          this.props.children),
        this.renderRemove());

      // If dropdown
      if (this.props.dropdownItems) {
        return R('div', {className: "dropdown", style: { display: "inline-block" }},
          elem,
          R('ul', {className: "dropdown-menu", style: { cursor: "pointer" }},
            _.map(this.props.dropdownItems, this.renderDropdownItem))
        );
      } else {
        return elem;
      }
    }
  };
  LinkComponent.initClass();
  return LinkComponent;
})();

