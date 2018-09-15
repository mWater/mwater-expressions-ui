var DateTimePickerComponent, PropTypes, R, React, moment,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

React = require('react');

R = React.createElement;

moment = require('moment');

require("eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js");

module.exports = DateTimePickerComponent = (function(superClass) {
  extend(DateTimePickerComponent, superClass);

  function DateTimePickerComponent() {
    this.onChange = bind(this.onChange, this);
    return DateTimePickerComponent.__super__.constructor.apply(this, arguments);
  }

  DateTimePickerComponent.propTypes = {
    timepicker: PropTypes.bool,
    onChange: PropTypes.func,
    date: PropTypes.object,
    defaultDate: PropTypes.object
  };

  DateTimePickerComponent.defaultProps = {
    timepicker: false
  };

  DateTimePickerComponent.prototype.onChange = function(event) {
    var base;
    return typeof (base = this.props).onChange === "function" ? base.onChange(event.date) : void 0;
  };

  DateTimePickerComponent.prototype.componentDidMount = function() {
    var node, picker, pickerOptions;
    node = this.main;
    pickerOptions = {
      format: this.props.timepicker ? "YYYY-MM-DD HH-mm-ss" : "YYYY-MM-DD",
      inline: true,
      sideBySide: true
    };
    if (this.props.defaultDate) {
      pickerOptions.defaultDate = this.props.defaultDate;
    }
    picker = $(node).datetimepicker(pickerOptions);
    $(node).data("DateTimePicker").date(this.props.date || null);
    return $(node).on("dp.change", this.onChange);
  };

  DateTimePickerComponent.prototype.componentWillReceiveProps = function(nextProps) {
    var node;
    if (nextProps.date === null && this.props.date === null) {
      return;
    }
    if ((nextProps.date != null) && (this.props.date != null) && nextProps.date.isSame(this.props.date)) {
      return;
    }
    node = this.main;
    $(node).off("dp.change", this.onChange);
    $(node).data("DateTimePicker").date(nextProps.date || null);
    return $(node).on("dp.change", this.onChange);
  };

  DateTimePickerComponent.prototype.componentWillUnmount = function() {
    var node;
    node = this.main;
    return $(node).data("DateTimePicker").destroy();
  };

  DateTimePickerComponent.prototype.render = function() {
    return R('div', {
      ref: (function(_this) {
        return function(c) {
          return _this.main = c;
        };
      })(this)
    });
  };

  return DateTimePickerComponent;

})(React.Component);
