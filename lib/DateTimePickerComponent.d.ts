import React from "react";
import "react-datepicker/dist/react-datepicker.css";
import "./DateTimePickerComponent.css";
export interface DateTimePickerComponentProps {
    /** do we need time picker? */
    timepicker?: boolean;
    /** callback on date change */
    onChange?: any;
    /** date as moment */
    date?: any;
    /** default date as moment */
    defaultDate?: any;
}
export default class DateTimePickerComponent extends React.Component<DateTimePickerComponentProps> {
    static defaultProps: {
        timepicker: boolean;
    };
    render(): React.CElement<{
        selected: any;
        showTimeSelect: boolean | undefined;
        inline: boolean;
        showMonthDropdown: boolean;
        showYearDropdown: boolean;
        onChange: any;
    }, React.Component<{
        selected: any;
        showTimeSelect: boolean | undefined;
        inline: boolean;
        showMonthDropdown: boolean;
        showYearDropdown: boolean;
        onChange: any;
    }, any, any>>;
}
