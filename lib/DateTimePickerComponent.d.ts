import { Moment } from "moment";
import React from "react";
import { default as DatePicker } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
export interface DateTimePickerComponentProps {
    /** do we need time picker? */
    timepicker?: boolean;
    /** date as moment */
    date?: Moment;
    /** callback on date change */
    onChange: (date?: Moment) => void;
}
export default class DateTimePickerComponent extends React.Component<DateTimePickerComponentProps> {
    render(): React.CElement<import("react-datepicker").ReactDatePickerProps<string, boolean | undefined>, DatePicker<string, boolean | undefined>>;
}
