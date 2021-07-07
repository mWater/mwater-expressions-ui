"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var LinkComponent,
    PropTypes,
    R,
    React,
    _,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

PropTypes = require('prop-types');
React = require('react');
R = React.createElement;
_ = require('lodash'); // Component that is blue to show that it is a link and responds to clicks
// Also has a dropdown component if dropdown items are specified

module.exports = LinkComponent = function () {
  var LinkComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(LinkComponent, _React$Component);

    var _super = _createSuper(LinkComponent);

    function LinkComponent() {
      var _this;

      (0, _classCallCheck2["default"])(this, LinkComponent);
      _this = _super.apply(this, arguments);
      _this.renderDropdownItem = _this.renderDropdownItem.bind((0, _assertThisInitialized2["default"])(_this));
      return _this;
    }

    (0, _createClass2["default"])(LinkComponent, [{
      key: "renderRemove",
      value: function renderRemove() {
        if (this.props.onRemove) {
          return R('span', {
            className: "link-component-remove",
            onClick: this.props.onRemove
          }, R('i', {
            className: "fa fa-remove"
          }));
        }
      }
    }, {
      key: "renderDropdownItem",
      value: function renderDropdownItem(item) {
        var id, key, name;
        boundMethodCheck(this, LinkComponent);
        id = item.id || item.value;
        name = item.name || item.label; // Handle divider

        if (name == null) {
          return R('li', {
            className: "divider"
          });
        } // Get a string key


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
      }
    }, {
      key: "render",
      value: function render() {
        var elem; // Simple case

        if (!this.props.onClick && !this.props.onRemove && (!this.props.dropdownItems || this.props.dropdownItems.length === 0)) {
          return R('div', {
            className: "link-component-readonly"
          }, this.props.children);
        }

        elem = R('div', {
          className: "link-component",
          "data-toggle": "dropdown"
        }, R('div', {
          style: {
            display: "inline-block"
          },
          onClick: this.props.onClick
        }, this.props.children), this.renderRemove()); // If dropdown

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
      }
    }]);
    return LinkComponent;
  }(React.Component);

  ;
  LinkComponent.propTypes = {
    onClick: PropTypes.func,
    // Called on click
    onRemove: PropTypes.func,
    // Adds an x if specified 
    dropdownItems: PropTypes.array,
    // Array of { id, name } or { value, label } to display as dropdown. Null name/label is a separator
    onDropdownItemClicked: PropTypes.func // Called with id/value of dropdown item

  };
  return LinkComponent;
}.call(void 0);