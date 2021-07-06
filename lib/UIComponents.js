"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ButtonToggleComponent = exports.ToggleEditComponent = exports.SwitchViewComponent = exports.OptionListComponent = exports.SectionComponent = void 0;
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let ButtonToggleComponent, OptionListComponent, SectionComponent, SwitchViewComponent, ToggleEditComponent;
const lodash_1 = __importDefault(require("lodash"));
const prop_types_1 = __importDefault(require("prop-types"));
const react_1 = __importDefault(require("react"));
const react_dom_1 = __importDefault(require("react-dom"));
const R = react_1.default.createElement;
const react_motion_1 = __importDefault(require("react-motion"));
const LinkComponent_1 = __importDefault(require("./LinkComponent"));
// Miscellaneous ui components
// Section with a title and icon
let _SectionComponent = (SectionComponent = (function () {
    var _a;
    SectionComponent = (_a = class SectionComponent extends react_1.default.Component {
            render() {
                return R("div", { style: { marginBottom: 15 } }, R("label", { className: "text-muted" }, R("span", { className: `glyphicon glyphicon-${this.props.icon}` }), " ", this.props.label), R("div", { style: { marginLeft: 10 } }, this.props.children));
            }
        },
        _a.propTypes = {
            icon: prop_types_1.default.string,
            label: prop_types_1.default.node
        },
        _a);
    return SectionComponent;
})());
exports.SectionComponent = _SectionComponent;
// List of options with a name and description each
let _OptionListComponent = (OptionListComponent = (function () {
    var _a;
    OptionListComponent = (_a = class OptionListComponent extends react_1.default.Component {
            render() {
                return R("div", null, R("div", { style: { color: "#AAA", fontStyle: "italic" }, key: "hint" }, this.props.hint), R("div", { className: "mwater-visualization-big-options", key: "options" }, lodash_1.default.map(this.props.items, (item) => {
                    return R(OptionComponent, { name: item.name, desc: item.desc, onClick: item.onClick, key: item.name });
                })));
            }
        },
        _a.propTypes = {
            items: prop_types_1.default.array.isRequired,
            hint: prop_types_1.default.string
        },
        _a);
    return OptionListComponent;
})());
exports.OptionListComponent = _OptionListComponent;
// Single option
class OptionComponent extends react_1.default.Component {
    render() {
        return R("div", { className: "mwater-visualization-big-option", onClick: this.props.onClick }, R("div", { style: { fontWeight: "bold" } }, this.props.name), R("div", { style: { color: "#888" } }, this.props.desc));
    }
}
// Switches views smoothly
let _SwitchViewComponent = (SwitchViewComponent = (function () {
    var _a;
    SwitchViewComponent = (_a = class SwitchViewComponent extends react_1.default.Component {
            constructor(props) {
                super(props);
                // Save components
                this.refCallback = (id, comp) => {
                    this.comps = this.comps || {};
                    return (this.comps[id] = comp);
                };
                this.state = {
                    measuring: false
                };
            }
            componentWillReceiveProps(nextProps) {
                // If view changes, measure all components
                if (nextProps.viewId !== this.props.viewId) {
                    return this.setState({ measuring: true });
                }
            }
            componentDidUpdate(prevProps, prevState) {
                // If measuring, get the heights to interpolate
                if (this.state.measuring) {
                    this.heights = {};
                    // Get heights
                    for (let id of lodash_1.default.keys(this.props.views)) {
                        this.heights[id] = react_dom_1.default.findDOMNode(this.comps[id]).clientHeight;
                    }
                    return this.setState({ measuring: false });
                }
            }
            render() {
                // Create the style object that has the opacity for each view
                let id;
                const style = {};
                for (id in this.props.views) {
                    const view = this.props.views[id];
                    style[id] = react_motion_1.default.spring(id === this.props.viewId ? 1 : 0);
                }
                return R(react_motion_1.default.Motion, { style }, (style) => {
                    // If measuring, display all positioned at top
                    if (this.state.measuring) {
                        return R("div", { style: { position: "relative" } }, lodash_1.default.map(lodash_1.default.keys(this.props.views), (v) => {
                            return R("div", {
                                style: { position: "absolute", top: 0, opacity: style[v] },
                                ref: this.refCallback.bind(null, v),
                                key: v
                            }, this.props.views[v]);
                        }));
                    }
                    // If transitioning
                    if (style[this.props.viewId] !== 1) {
                        // Calculate interpolated height
                        let height = 0;
                        for (id in style) {
                            const val = style[id];
                            height += val * this.heights[id];
                        }
                        return R("div", { style: { position: "relative", height } }, lodash_1.default.map(lodash_1.default.keys(this.props.views), (v) => {
                            return R("div", { style: { position: "absolute", top: 0, left: 0, right: 0, opacity: style[v] }, key: v }, this.props.views[v]);
                        }));
                    }
                    // Just display (but wrapped to keep same component)
                    return R("div", null, R("div", { key: this.props.viewId }, this.props.views[this.props.viewId]));
                });
            }
        },
        _a.propTypes = {
            views: prop_types_1.default.object.isRequired,
            viewId: prop_types_1.default.string.isRequired
        },
        _a);
    return SwitchViewComponent;
})());
exports.SwitchViewComponent = _SwitchViewComponent;
// Shows as editable link that can be clicked to open
// Editor can be node or can be function that takes onClose function as first parameter
let _ToggleEditComponent = (ToggleEditComponent = (function () {
    var _a;
    ToggleEditComponent = (_a = class ToggleEditComponent extends react_1.default.Component {
            constructor(props) {
                super(props);
                this.close = () => {
                    // Save height of editor
                    if (this.editorComp) {
                        this.editorHeight = react_dom_1.default.findDOMNode(this.editorComp).clientHeight;
                    }
                    return this.setState({ open: false });
                };
                this.open = () => {
                    return this.setState({ open: true });
                };
                this.handleToggle = () => {
                    return this.setState({ open: !this.state.open });
                };
                // Save editor comp
                this.editorRef = (editorComp) => {
                    return (this.editorComp = editorComp);
                };
                this.state = { open: props.initiallyOpen || false };
            }
            render() {
                let { editor } = this.props;
                if (lodash_1.default.isFunction(editor)) {
                    editor = editor(this.close);
                }
                const link = R(LinkComponent_1.default, { onClick: this.open, onRemove: this.props.onRemove }, this.props.label);
                const isOpen = this.state.open || this.props.forceOpen;
                return R(SwitchViewComponent, {
                    views: { editor, link },
                    viewId: isOpen ? "editor" : "link"
                });
            }
        },
        _a.propTypes = {
            forceOpen: prop_types_1.default.bool,
            initiallyOpen: prop_types_1.default.bool,
            label: prop_types_1.default.node.isRequired,
            editor: prop_types_1.default.any.isRequired,
            onRemove: prop_types_1.default.func
        },
        _a);
    return ToggleEditComponent;
})());
exports.ToggleEditComponent = _ToggleEditComponent;
// Switch between several values as a series of radio buttons
let _ButtonToggleComponent = (ButtonToggleComponent = (function () {
    var _a;
    ButtonToggleComponent = (_a = class ButtonToggleComponent extends react_1.default.Component {
            render() {
                return R("div", { className: "btn-group btn-group-xs" }, lodash_1.default.map(this.props.options, (option, i) => {
                    return R("button", {
                        type: "button",
                        className: option.value === this.props.value ? "btn btn-primary active" : "btn btn-default",
                        onClick: this.props.onChange.bind(null, option.value)
                    }, option.label);
                }));
            }
        },
        _a.propTypes = {
            value: prop_types_1.default.any,
            options: prop_types_1.default.arrayOf(prop_types_1.default.shape({
                label: prop_types_1.default.node.isRequired,
                value: prop_types_1.default.any
            })).isRequired,
            onChange: prop_types_1.default.func.isRequired
        },
        _a);
    return ButtonToggleComponent;
})());
exports.ButtonToggleComponent = _ButtonToggleComponent;
