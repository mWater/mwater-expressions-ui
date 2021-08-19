"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const ui = __importStar(require("react-library/lib/bootstrap"));
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
        return R(ui.FormGroup, { label: "ID", hasWarnings: !this.isValid(this.props.value) }, R("input", {
            type: "text",
            className: "form-control",
            value: this.props.value || "",
            onChange: this.handleChange
        }), R("p", { className: "help-block" }, "Lowercase, numbers and underscores"));
    }
}
exports.default = IdFieldComponent;
