"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var PropTypes, R, React, RemovableComponent;
PropTypes = require('prop-types');
React = require('react');
R = React.createElement; // Component with a remove x to the right

module.exports = RemovableComponent = function () {
  var RemovableComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(RemovableComponent, _React$Component);

    var _super = _createSuper(RemovableComponent);

    function RemovableComponent() {
      (0, _classCallCheck2["default"])(this, RemovableComponent);
      return _super.apply(this, arguments);
    }

    (0, _createClass2["default"])(RemovableComponent, [{
      key: "render",
      value: function render() {
        return R('div', {
          style: {
            display: "flex"
          },
          className: "hover-display-parent"
        }, R('div', {
          style: {
            flex: "1 1 auto"
          }
        }, this.props.children), this.props.onRemove ? R('div', {
          style: {
            flex: "0 0 auto",
            alignSelf: "center"
          },
          className: "hover-display-child"
        }, R('a', {
          onClick: this.props.onRemove,
          style: {
            fontSize: "80%",
            cursor: "pointer",
            marginLeft: 5
          }
        }, R('i', {
          className: "fa fa-remove"
        }))) : void 0);
      }
    }]);
    return RemovableComponent;
  }(React.Component);

  ;
  RemovableComponent.propTypes = {
    onRemove: PropTypes.func // Pass to put a remove link on right of specified item

  };
  return RemovableComponent;
}.call(void 0);