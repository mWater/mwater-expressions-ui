import moment, { Moment } from "moment"
import React from "react"
const R = React.createElement
import { default as DatePicker } from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

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
      selected: this.props.date ? this.props.date.toDate() : undefined,
      showTimeSelect: this.props.timepicker,
      inline: true,
      showMonthDropdown: true,
      showYearDropdown: true,
      onChange: (date) => {
        this.props.onChange(date ? moment(date as Date) : undefined)
      }
    })
  }
}
