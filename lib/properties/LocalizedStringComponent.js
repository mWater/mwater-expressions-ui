"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
// Displays a localized string (_base: "en", en: "apple", fr: "pomme", etc)
class LocalizedStringComponent extends react_1.default.Component {
    render() {
        if (this.props.value) {
            return R("span", null, this.props.value[this.props.value._base || "en"]);
        }
        else {
            return null;
        }
    }
}
exports.default = LocalizedStringComponent;
