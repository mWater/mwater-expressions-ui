"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var IdFieldComponent,
    PropTypes,
    R,
    React,
    _,
    ui,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

PropTypes = require('prop-types');
React = require('react');
R = React.createElement;
_ = require('lodash');
ui = require('react-library/lib/bootstrap');

module.exports = IdFieldComponent = function () {
  var IdFieldComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2.default)(IdFieldComponent, _React$Component);

    function IdFieldComponent(props) {
      var _this;

      (0, _classCallCheck2.default)(this, IdFieldComponent);
      _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(IdFieldComponent).call(this, props));
      _this.isValid = _this.isValid.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleChange = _this.handleChange.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      return _this;
    }

    (0, _createClass2.default)(IdFieldComponent, [{
      key: "isValid",
      value: function isValid(string) {
        boundMethodCheck(this, IdFieldComponent);
        return /^[a-z][a-z_0-9]*$/.test(string);
      }
    }, {
      key: "handleChange",
      value: function handleChange(ev) {
        boundMethodCheck(this, IdFieldComponent);
        return this.props.onChange(ev.target.value);
      }
    }, {
      key: "render",
      value: function render() {
        return R(ui.FormGroup, {
          label: "ID",
          hasWarnings: !this.isValid(this.props.value)
        }, R('input', {
          type: "text",
          className: "form-control",
          value: this.props.value || "",
          onChange: this.handleChange
        }), R('p', {
          className: "help-block"
        }, "Lowercase, numbers and underscores"));
      }
    }]);
    return IdFieldComponent;
  }(React.Component);

  ;
  IdFieldComponent.propTypes = {
    value: PropTypes.string,
    // The value
    onChange: PropTypes.func.isRequired // Called with new value

  };
  return IdFieldComponent;
}.call(void 0);