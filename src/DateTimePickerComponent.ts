import { Moment } from "moment"
import React from "react"
const R = React.createElement
import { default as DatePicker } from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import "./DateTimePickerComponent.css"

export interface DateTimePickerComponentProps {
  /** do we need time picker? */
  timepicker?: boolean

  /** date as moment */
  date?: Moment

  /** callback on date change */
  onChange: (date?: Moment) => void
}

export default class DateTimePickerComponent extends React.Component<DateTimePickerComponentProps> {
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
