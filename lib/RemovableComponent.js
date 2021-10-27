"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
// Component with a remove x to the right
class RemovableComponent extends react_1.default.Component {
    render() {
        return R("div", { style: { display: "flex" }, className: "hover-display-parent" }, R("div", { style: { flex: "1 1 auto" } }, this.props.children), this.props.onRemove
            ? R("div", { style: { flex: "0 0 auto", alignSelf: "center" }, className: "hover-display-child" }, R("a", {
                onClick: this.props.onRemove,
                style: { fontSize: "80%", cursor: "pointer", marginLeft: 5, color: "var(--bs-primary)" }
            }, R("i", { className: "fa fa-remove" })))
            : undefined);
    }
}
exports.default = RemovableComponent;
