"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const prop_types_1 = __importDefault(require("prop-types"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
// Shows a tree that selects table + joins + expr of a scalar expression
// Supports some React context properties for special. See individual classes
class ScalarExprTreeComponent extends react_1.default.Component {
    render() {
        return R("div", { style: { overflowY: this.props.height ? "auto" : undefined, height: this.props.height } }, R(ScalarExprTreeTreeComponent, {
            tree: this.props.tree,
            onChange: this.props.onChange,
            filter: this.props.filter
        }));
    }
}
exports.default = ScalarExprTreeComponent;
class ScalarExprTreeTreeComponent extends react_1.default.Component {
    render() {
        const elems = [];
        // Get tree
        for (let i = 0; i < this.props.tree.length; i++) {
            const item = this.props.tree[i];
            if (item.children) {
                elems.push(R(ScalarExprTreeNodeComponent, {
                    key: item.key,
                    item,
                    prefix: this.props.prefix,
                    onChange: this.props.onChange,
                    filter: this.props.filter
                }));
            }
            else {
                elems.push(R(ScalarExprTreeLeafComponent, {
                    key: item.key,
                    item,
                    prefix: this.props.prefix,
                    onChange: this.props.onChange
                }));
            }
        }
        return R("div", null, elems);
    }
}
class ScalarExprTreeLeafComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleClick = () => {
            return this.props.onChange(this.props.item.value);
        };
    }
    render() {
        const style = {
            padding: 4,
            borderRadius: 4,
            cursor: "pointer",
            color: "var(--bs-primary)"
        };
        return R("div", { style, className: "hover-grey-background", onClick: this.handleClick, "data-key": this.props.item.key }, this.props.prefix ? R("span", { className: "text-muted" }, this.props.prefix) : undefined, this.props.item.name, this.props.item.desc
            ? R("span", { className: "text-muted", style: { fontSize: 12, paddingLeft: 3 } }, " - " + this.props.item.desc)
            : undefined);
    }
}
class ScalarExprTreeNodeComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.handleArrowClick = () => {
            if (this.state.collapse === "open") {
                return this.setState({ collapse: "closed" });
            }
            else if (this.state.collapse === "closed") {
                return this.setState({ collapse: "open" });
            }
        };
        this.handleItemClick = () => {
            // If no value, treat as arrow click
            if (!this.props.item.value) {
                return this.handleArrowClick();
            }
            else {
                return this.props.onChange(this.props.item.value);
            }
        };
        this.state = {
            collapse: this.props.item.initiallyOpen ? "open" : "closed"
        };
    }
    componentWillReceiveProps(nextProps) {
        // If initially open changed, then update collapse
        if (nextProps.item.initiallyOpen !== this.props.item.initiallyOpen) {
            return this.setState({ collapse: nextProps.item.initiallyOpen ? "open" : "closed" });
        }
    }
    render() {
        let children, prefix;
        let arrow = null;
        if (this.state.collapse === "closed") {
            arrow = R("i", { className: "fa fa-plus-square-o", style: { width: 15 } });
        }
        else if (this.state.collapse === "open") {
            arrow = R("i", { className: "fa fa-minus-square-o", style: { width: 15 } });
        }
        if (this.state.collapse === "open") {
            // Compute new prefix, adding when going into joins
            prefix = this.props.prefix || "";
            if (this.props.item.item.type === "join") {
                prefix = prefix + this.props.item.name + " > ";
            }
            // Render child items
            const childItems = this.props.item.children();
            children = lodash_1.default.map(childItems, (item) => {
                if (item.children) {
                    return R(ScalarExprTreeNodeComponent, {
                        key: item.key,
                        item,
                        prefix,
                        onChange: this.props.onChange,
                        filter: this.props.filter
                    });
                }
                else {
                    return R(ScalarExprTreeLeafComponent, { key: item.key, item, prefix, onChange: this.props.onChange });
                }
            });
            // Decorate children if section
            if (this.context.decorateScalarExprTreeSectionChildren && this.props.item.item.type === "section") {
                children = this.context.decorateScalarExprTreeSectionChildren({
                    children,
                    tableId: this.props.item.tableId,
                    section: this.props.item.item,
                    filter: this.props.filter
                });
            }
            // Pad left and give key
            children = R("div", { style: { paddingLeft: 18 }, key: "tree" }, children);
        }
        const color = this.props.item.value ? "var(--bs-primary)" : undefined;
        return R("div", null, R("div", {
            style: { cursor: "pointer", padding: 4, marginLeft: 20, position: "relative" },
            key: "item",
            className: this.props.item.value ? "hover-grey-background" : undefined
        }, R("span", {
            style: { color: "var(--bs-primary)", cursor: "pointer", position: "absolute", left: -15 },
            onClick: this.handleArrowClick
        }, arrow), R("div", { style: { color, display: "inline-block" }, onClick: this.handleItemClick }, this.props.prefix ? R("span", { className: "text-muted" }, this.props.prefix) : undefined, this.props.item.name, 
        // if @props.item.item.type == "join"
        //   R 'i', className: "fa fa-link", style: { paddingRight: 5, paddingLeft: 5 }
        this.props.item.desc
            ? R("span", { className: "text-muted", style: { fontSize: 12, paddingLeft: 3 } }, " - " + this.props.item.desc)
            : undefined)), children);
    }
}
ScalarExprTreeNodeComponent.contextTypes = 
// Should return decorated element
{ decorateScalarExprTreeSectionChildren: prop_types_1.default.func };
