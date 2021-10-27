"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const lodash_1 = __importDefault(require("lodash"));
// Component that is blue to show that it is a link and responds to clicks
// Also has a dropdown component if dropdown items are specified
class LinkComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.renderDropdownItem = (item) => {
            const id = item.id || item.value;
            const name = item.name || item.label;
            // Handle divider
            if (name == null) {
                return R("li", { className: "divider" });
            }
            // Get a string key
            let key = id;
            if (!lodash_1.default.isString(key)) {
                key = JSON.stringify(key);
            }
            return R("li", { key }, R("a", { key: id, className: "dropdown-item", onClick: this.props.onDropdownItemClicked.bind(null, id) }, name));
        };
    }
    renderRemove() {
        if (this.props.onRemove) {
            return R("span", { className: "link-component-remove", onClick: this.props.onRemove }, R("i", { className: "fa fa-remove" }));
        }
    }
    render() {
        // Simple case
        if (!this.props.onClick &&
            !this.props.onRemove &&
            (!this.props.dropdownItems || this.props.dropdownItems.length === 0)) {
            return R("div", { className: "link-component-readonly" }, this.props.children);
        }
        const elem = R("div", { className: "link-component", "data-bs-toggle": "dropdown" }, R("div", { style: { display: "inline-block" }, onClick: this.props.onClick }, this.props.children), this.renderRemove());
        // If dropdown
        if (this.props.dropdownItems) {
            return R("div", { className: "dropdown", style: { display: "inline-block" } }, elem, R("ul", { className: "dropdown-menu", style: { cursor: "pointer" } }, lodash_1.default.map(this.props.dropdownItems, this.renderDropdownItem)));
        }
        else {
            return elem;
        }
    }
}
exports.default = LinkComponent;
