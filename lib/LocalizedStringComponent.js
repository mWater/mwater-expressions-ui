"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var LocalizedStringComponent, PropTypes, R, React;
PropTypes = require('prop-types');
React = require('react');
R = React.createElement; // Displays a localized string (_base: "en", en: "apple", fr: "pomme", etc)

module.exports = LocalizedStringComponent = function () {
  var LocalizedStringComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2.default)(LocalizedStringComponent, _React$Component);

    function LocalizedStringComponent() {
      (0, _classCallCheck2.default)(this, LocalizedStringComponent);
      return (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(LocalizedStringComponent).apply(this, arguments));
    }

    (0, _createClass2.default)(LocalizedStringComponent, [{
      key: "render",
      value: function render() {
        if (this.props.value) {
          return R('span', null, this.props.value[this.props.value._base || "en"]);
        } else {
          return null;
        }
      }
    }]);
    return LocalizedStringComponent;
  }(React.Component);

  ;
  LocalizedStringComponent.propTypes = {
    value: PropTypes.object
  };
  return LocalizedStringComponent;
}.call(void 0);