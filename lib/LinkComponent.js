var LinkComponent, PropTypes, R, React, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

React = require('react');

R = React.createElement;

_ = require('lodash');

module.exports = LinkComponent = (function(superClass) {
  extend(LinkComponent, superClass);

  function LinkComponent() {
    this.renderDropdownItem = bind(this.renderDropdownItem, this);
    return LinkComponent.__super__.constructor.apply(this, arguments);
  }

  LinkComponent.propTypes = {
    onClick: PropTypes.func,
    onRemove: PropTypes.func,
    dropdownItems: PropTypes.array,
    onDropdownItemClicked: PropTypes.func
  };

  LinkComponent.prototype.renderRemove = function() {
    if (this.props.onRemove) {
      return R('span', {
        className: "link-component-remove",
        onClick: this.props.onRemove
      }, R('span', {
        className: "glyphicon glyphicon-remove"
      }));
    }
  };

  LinkComponent.prototype.renderDropdownItem = function(item) {
    var id, key, name;
    id = item.id || item.value;
    name = item.name || item.label;
    if (name == null) {
      return R('li', {
        className: "divider"
      });
    }
    key = id;
    if (!_.isString(key)) {
      key = JSON.stringify(key);
    }
    return R('li', {
      key: key
    }, R('a', {
      key: id,
      onClick: this.props.onDropdownItemClicked.bind(null, id)
    }, name));
  };

  LinkComponent.prototype.render = function() {
    var elem;
    elem = R('div', {
      className: "link-component",
      "data-toggle": "dropdown"
    }, R('div', {
      style: {
        display: "inline-block"
      },
      onClick: this.props.onClick
    }, this.props.children), this.renderRemove());
    if (this.props.dropdownItems) {
      return R('div', {
        className: "dropdown",
        style: {
          display: "inline-block"
        }
      }, elem, R('ul', {
        className: "dropdown-menu",
        style: {
          cursor: "pointer"
        }
      }, _.map(this.props.dropdownItems, this.renderDropdownItem)));
    } else {
      return elem;
    }
  };

  return LinkComponent;

})(React.Component);
