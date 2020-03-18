"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var $, DatePicker, DateTimePickerComponent, PropTypes, R, React, moment;
$ = require('jquery');
PropTypes = require('prop-types');
React = require('react');
R = React.createElement;
moment = require('moment');
DatePicker = require('react-datepicker').default;

require("react-datepicker/dist/react-datepicker.css");

require("./DateTimePickerComponent.css");

module.exports = DateTimePickerComponent = function () {
  var DateTimePickerComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2.default)(DateTimePickerComponent, _React$Component);

    function DateTimePickerComponent() {
      (0, _classCallCheck2.default)(this, DateTimePickerComponent);
      return (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(DateTimePickerComponent).apply(this, arguments));
    }

    (0, _createClass2.default)(DateTimePickerComponent, [{
      key: "render",
      value: function render() {
        var _this = this;

        return R(DatePicker, {
          selected: this.props.date ? this.props.date.toDate() : null,
          showTimeSelect: this.props.timepicker,
          inline: true,
          showMonthDropdown: true,
          showYearDropdown: true,
          onChange: function onChange(v) {
            return _this.props.onChange(v ? moment(v) : null);
          }
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