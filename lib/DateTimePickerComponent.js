"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var $, DatePicker, DateTimePickerComponent, PropTypes, R, React, moment;
$ = require('jquery');
PropTypes = require('prop-types');
React = require('react');
R = React.createElement;
moment = require('moment');
DatePicker = require('react-datepicker')["default"];

require("react-datepicker/dist/react-datepicker.css");

require("./DateTimePickerComponent.css");

module.exports = DateTimePickerComponent = function () {
  var DateTimePickerComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(DateTimePickerComponent, _React$Component);

    var _super = _createSuper(DateTimePickerComponent);

    function DateTimePickerComponent() {
      (0, _classCallCheck2["default"])(this, DateTimePickerComponent);
      return _super.apply(this, arguments);
    }

    (0, _createClass2["default"])(DateTimePickerComponent, [{
      key: "render",
      value: function render() {
        return R(DatePicker, {
          selected: this.props.date,
          showTimeSelect: this.props.timepicker,
          inline: true,
          showMonthDropdown: true,
          showYearDropdown: true,
          onChange: this.props.onChange
        });
      }
    }]);
    return DateTimePickerComponent;
  }(React.Component);

  ;
  DateTimePickerComponent.propTypes = {
    // do we need time picker?
    timepicker: PropTypes.bool,
    // callback on date change
    // argument: moment object for currently selected datetime
    onChange: PropTypes.func,
    // date as moment
    date: PropTypes.object,
    // default date as moment 
    defaultDate: PropTypes.object
  };
  DateTimePickerComponent.defaultProps = {
    timepicker: false
  };
  return DateTimePickerComponent;
}.call(void 0);