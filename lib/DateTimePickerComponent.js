"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const react_datepicker_1 = __importDefault(require("react-datepicker"));
require("react-datepicker/dist/react-datepicker.css");
class DateTimePickerComponent extends react_1.default.Component {
    render() {
        return R(react_datepicker_1.default, {
            selected: this.props.date ? this.props.date.toDate() : undefined,
            showTimeSelect: this.props.timepicker,
            inline: true,
            showMonthDropdown: true,
            showYearDropdown: true,
            onChange: (date) => {
                this.props.onChange(date ? (0, moment_1.default)(date) : undefined);
            }
        });
    }
}
exports.default = DateTimePickerComponent;
