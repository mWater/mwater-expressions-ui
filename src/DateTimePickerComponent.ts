import React from "react"
const R = React.createElement
import { default as DatePicker } from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import "./DateTimePickerComponent.css"

export interface DateTimePickerComponentProps {
  /** do we need time picker? */
  timepicker?: boolean
  /** callback on date change */
  onChange?: any
  /** date as moment */
  date?: any
  /** default date as moment */
  defaultDate?: any
}

export default class DateTimePickerComponent extends React.Component<DateTimePickerComponentProps> {
  static defaultProps = { timepicker: false }

  render() {
    return R(DatePicker, {
      selected: this.props.date,
      showTimeSelect: this.props.timepicker,
      inline: true,
      showMonthDropdown: true,
      showYearDropdown: true,
      onChange: this.props.onChange
    })
  }
}
