"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const react_datepicker_1 = __importDefault(require("react-datepicker"));
require("react-datepicker/dist/react-datepicker.css");
require("./DateTimePickerComponent.css");
class DateTimePickerComponent extends react_1.default.Component {
    render() {
        return R(react_datepicker_1.default, {
            selected: this.props.date,
            showTimeSelect: this.props.timepicker,
            inline: true,
            showMonthDropdown: true,
            showYearDropdown: true,
            onChange: this.props.onChange
        });
    }
}
exports.default = DateTimePickerComponent;
DateTimePickerComponent.defaultProps = { timepicker: false };
