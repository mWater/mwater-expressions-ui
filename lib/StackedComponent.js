"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var CrossComponent, PropTypes, R, React, StackedComponent, width;
PropTypes = require('prop-types');
CrossComponent = require('react-library/lib/CrossComponent');
React = require('react');
R = React.createElement;
width = 60; // Displays a set of components vertically with lines connecting them

module.exports = StackedComponent = function () {
  var StackedComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(StackedComponent, _React$Component);

    var _super = _createSuper(StackedComponent);

    function StackedComponent() {
      (0, _classCallCheck2["default"])(this, StackedComponent);
      return _super.apply(this, arguments);
    }

    (0, _createClass2["default"])(StackedComponent, [{
      key: "renderRow",
      value: function renderRow(item, i, first, last) {
        // Create row that has lines to the left
        return R('div', {
          style: {
            display: "flex"
          },
          className: "hover-display-parent"
        }, R('div', {
          style: {
            flex: "0 0 ".concat(width, "px"),
            display: "flex"
          }
        }, R(CrossComponent, {
          n: !first ? "solid 1px #DDD" : void 0,
          e: "solid 1px #DDD",
          s: !last ? "solid 1px #DDD" : void 0,
          height: "auto"
        })), R('div', {
          style: {
            flex: "1 1 auto"
          }
        }, item.elem), item.onRemove ? R('div', {
          style: {
            flex: "0 0 auto",
            alignSelf: "center"
          },
          className: "hover-display-child"
        }, R('a', {
          onClick: item.onRemove,
          style: {
            fontSize: "80%",
            cursor: "pointer",
            marginLeft: 5
          }
        }, R('i', {
          className: "fa fa-remove"
        }))) : void 0);
      }
    }, {
      key: "render",
      value: function render() {
        var child, i, j, len, ref, rowElems;
        rowElems = [];
        ref = this.props.items;

        for (i = j = 0, len = ref.length; j < len; i = ++j) {
          child = ref[i]; // If not first, add joiner

          if (i > 0 && this.props.joinLabel) {
            rowElems.push(R('div', {
              style: {
                width: width,
                textAlign: "center"
              }
            }, this.props.joinLabel));
          }

          rowElems.push(this.renderRow(child, i, i === 0, i === this.props.items.length - 1));
        }

        return R('div', {
          style: {
            display: "flex",
            flexDirection: "column" // Outer container

          }
        }, rowElems);
      }
    }]);
    return StackedComponent;
  }(React.Component);

  ;
  StackedComponent.propTypes = {
    joinLabel: PropTypes.node,
    // Label between connections
    items: PropTypes.arrayOf(PropTypes.shape({
      elem: PropTypes.node.isRequired,
      // Elem to display
      onRemove: PropTypes.func // Pass to put a remove link on right of specified item

    })).isRequired
  };
  return StackedComponent;
}.call(void 0);