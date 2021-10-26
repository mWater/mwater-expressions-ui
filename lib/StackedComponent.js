"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CrossComponent_1 = __importDefault(require("react-library/lib/CrossComponent"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const width = 60;
// Displays a set of components vertically with lines connecting them
class StackedComponent extends react_1.default.Component {
    renderRow(item, i, first, last) {
        // Create row that has lines to the left
        return R("div", { style: { display: "flex" }, className: "hover-display-parent" }, R("div", { style: { flex: `0 0 ${width}px`, display: "flex" } }, R(CrossComponent_1.default, {
            n: !first ? "solid 1px #DDD" : undefined,
            e: "solid 1px #DDD",
            s: !last ? "solid 1px #DDD" : undefined,
            height: "auto"
        })), R("div", { style: { flex: "1 1 auto" } }, item.elem), item.onRemove
            ? R("div", { style: { flex: "0 0 auto", alignSelf: "center" }, className: "hover-display-child" }, R("a", {
                onClick: item.onRemove,
                style: { fontSize: "80%", cursor: "pointer", marginLeft: 5, color: "#337ab7" }
            }, R("i", { className: "fa fa-remove" })))
            : undefined);
    }
    render() {
        const rowElems = [];
        for (let i = 0; i < this.props.items.length; i++) {
            // If not first, add joiner
            const child = this.props.items[i];
            if (i > 0 && this.props.joinLabel) {
                rowElems.push(R("div", { style: { width, textAlign: "center" } }, this.props.joinLabel));
            }
            rowElems.push(this.renderRow(child, i, i === 0, i === this.props.items.length - 1));
        }
        return R("div", { style: { display: "flex", flexDirection: "column" } }, // Outer container
        rowElems);
    }
}
exports.default = StackedComponent;
