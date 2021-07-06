let DateTimePickerComponent;
import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
const R = React.createElement;
import moment from 'moment';
import { default as DatePicker } from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import "./DateTimePickerComponent.css";

export default DateTimePickerComponent = (function() {
  DateTimePickerComponent = class DateTimePickerComponent extends React.Component {
    static initClass() {
      this.propTypes = {
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
  
      this.defaultProps =
        {timepicker: false};
    }

    render() {
      return R(DatePicker, {
        selected: this.props.date,
        showTimeSelect: this.props.timepicker,
        inline: true,
        showMonthDropdown: true,
        showYearDropdown: true,
        onChange: this.props.onChange
      }
      );
    }
  };
  DateTimePickerComponent.initClass();
  return DateTimePickerComponent;
})();

