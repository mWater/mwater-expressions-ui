var DateTimePickerComponent, H, PropTypes, R, React, moment,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

PropTypes = require('prop-types');

React = require('react');

R = React.createElement;

H = React.DOM;

moment = require('moment');

require("eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js");

module.exports = DateTimePickerComponent = (function() {
  class DateTimePickerComponent extends React.Component {
    constructor() {
      super(...arguments);
      this.onChange = this.onChange.bind(this);
    }

    onChange(event) {
      var base;
      boundMethodCheck(this, DateTimePickerComponent);
      return typeof (base = this.props).onChange === "function" ? base.onChange(event.date) : void 0;
    }

    componentDidMount() {
      var node, picker, pickerOptions;
      node = this.refs.main;
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
    }

    componentWillReceiveProps(nextProps) {
      var node;
      // If unchanged
      if (nextProps.date === null && this.props.date === null) {
        return;
      }
      if ((nextProps.date != null) && (this.props.date != null) && nextProps.date.isSame(this.props.date)) {
        return;
      }
      node = this.refs.main;
      $(node).off("dp.change", this.onChange);
      $(node).data("DateTimePicker").date(nextProps.date || null);
      return $(node).on("dp.change", this.onChange);
    }

    componentWillUnmount() {
      var node;
      node = this.refs.main;
      return $(node).data("DateTimePicker").destroy();
    }

    render() {
      return H.div({
        ref: "main"
      });
    }

  };

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

}).call(this);
