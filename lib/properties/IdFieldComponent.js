"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const bootstrap_1 = __importDefault(require("react-library/lib/bootstrap"));
class IdFieldComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.isValid = (string) => {
            return /^[a-z][a-z_0-9]*$/.test(string);
        };
        this.handleChange = (ev) => {
            return this.props.onChange(ev.target.value);
        };
    }
    render() {
        return R(bootstrap_1.default.FormGroup, { label: "ID", hasWarnings: !this.isValid(this.props.value) }, R("input", {
            type: "text",
            className: "form-control",
            value: this.props.value || "",
            onChange: this.handleChange
        }), R("p", { className: "help-block" }, "Lowercase, numbers and underscores"));
    }
}
exports.default = IdFieldComponent;
