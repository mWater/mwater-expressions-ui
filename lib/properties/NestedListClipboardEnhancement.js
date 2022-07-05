"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
const lodash_1 = __importDefault(require("lodash"));
const prop_types_1 = __importDefault(require("prop-types"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const uuid_1 = __importDefault(require("uuid"));
// A wrapper for nested list for property editor
//
// The problem with nested list is that the the item component will need to render the list component
// passing back all the required props. Also, the events in the nensted list would need to
// be propagated back to the all the parent nodes.
//
// What this HOC does is to wrap the outermost list node, which will eventually handle the cut/copy/paste
// operation for the entire tree, so the children and nested nodes will just get the
// cut/copy/paste handlers provided by this one.
//
// Also exposes a clipboard context, which can be accessed by the child nodes.
//
function default_1(WrappedComponent) {
    var _a;
    return _a = class NestedListClipboardEnhancement extends react_1.default.Component {
            constructor(props) {
                super(props);
                this.handleCut = (listId, itemId) => {
                    return this.handleCopy(listId, itemId, true);
                };
                this.findItemById = (listId, itemId) => {
                    const value = lodash_1.default.cloneDeep(this.props.properties);
                    const list = lodash_1.default.find(value, { id: itemId });
                    if (list) {
                        // check in the root array first
                        return list;
                    }
                    let found = null;
                    function find(listId, itemId, items) {
                        for (let property of items) {
                            if (property.id === listId) {
                                return lodash_1.default.find(property.contents, { id: itemId });
                            }
                            else {
                                found = find(listId, itemId, lodash_1.default.filter(property.contents, { type: "section" }));
                                if (found) {
                                    return found;
                                }
                            }
                        }
                    }
                    // if not root then only iterate through section type properties
                    return find(listId, itemId, lodash_1.default.filter(value, { type: "section" }));
                };
                this.handleCopy = (listId, itemId, cut = false) => {
                    const property = this.findItemById(listId, itemId);
                    // Only change id if copy
                    if (!cut) {
                        // Id is used as key, so the id needs to be regenerated
                        if (this.props.propertyIdGenerator) {
                            property.id = this.props.propertyIdGenerator();
                        }
                        else {
                            property.id = "p" + uuid_1.default.v4().split("-")[0];
                        }
                    }
                    return this.setState({
                        clipboard: {
                            listId,
                            itemId,
                            property,
                            cut
                        }
                    });
                };
                this.handlePasteInto = (listId, itemId) => {
                    if (!this.state.clipboard) {
                        return;
                    }
                    const value = lodash_1.default.cloneDeep(this.props.properties);
                    let didPaste = false;
                    let didCut = false;
                    if (this.state.clipboard.cut) {
                        const cutIndex = lodash_1.default.findIndex(value, { id: this.state.clipboard.itemId });
                        if (cutIndex > -1) {
                            lodash_1.default.pullAt(value, cutIndex);
                            didCut = true;
                        }
                        else {
                            didCut = this.cut(this.state.clipboard.listId, this.state.clipboard.itemId, lodash_1.default.filter(value, { type: "section" }));
                        }
                    }
                    let pasteIndex = lodash_1.default.findIndex(value, { id: itemId }); // check in the root array first
                    if (pasteIndex > -1) {
                        if (!value[pasteIndex].contents) {
                            value[pasteIndex].contents = [];
                        }
                        value[pasteIndex].contents.push(this.state.clipboard.property);
                        didPaste = true;
                    }
                    else {
                        var pasteInto = (listId, itemId, items) => {
                            return (() => {
                                const result = [];
                                for (let property of items) {
                                    if (property.id === listId) {
                                        pasteIndex = lodash_1.default.findIndex(property.contents, { id: itemId });
                                        if (!property.contents[pasteIndex].contents) {
                                            property.contents[pasteIndex].contents = [];
                                        }
                                        property.contents[pasteIndex].contents.push(this.state.clipboard.property);
                                        result.push((didPaste = true));
                                    }
                                    else {
                                        result.push((didPaste = pasteInto(listId, itemId, lodash_1.default.filter(property.contents, { type: "section" }))));
                                    }
                                }
                                return result;
                            })();
                        };
                        pasteInto(listId, itemId, lodash_1.default.filter(value, { type: "section" }));
                    }
                    // Dont update state untill all required operations are successfull
                    // Required to avoid the conditions where user would cut and copy an item into its own children
                    if (didPaste) {
                        if (this.state.clipboard.cut && !didCut) {
                            return;
                        }
                        this.setState({ clipboard: null });
                        return this.props.onChange(value);
                    }
                };
                this.cut = (listId, itemId, items) => {
                    let didCut = false;
                    for (let property of items) {
                        if (property.id === listId) {
                            const cutIndex = lodash_1.default.findIndex(property.contents, { id: this.state.clipboard.itemId });
                            lodash_1.default.pullAt(property.contents, cutIndex);
                            didCut = true;
                        }
                        else {
                            didCut = this.cut(listId, itemId, lodash_1.default.filter(property.contents, { type: "section" }));
                        }
                    }
                    return didCut;
                };
                this.paste = (listId, itemId, items) => {
                    let didPaste = false;
                    for (let property of items) {
                        if (property.id === listId) {
                            const pasteIndex = lodash_1.default.findIndex(property.contents, { id: itemId });
                            property.contents.splice(pasteIndex, 0, this.state.clipboard.property);
                            didPaste = true;
                        }
                        else {
                            didPaste = this.paste(listId, itemId, lodash_1.default.filter(property.contents, { type: "section" }));
                        }
                    }
                    return didPaste;
                };
                this.handlePaste = (listId, itemId) => {
                    if (!this.state.clipboard) {
                        return;
                    }
                    const value = lodash_1.default.cloneDeep(this.props.properties);
                    let didPaste = false;
                    let didCut = false;
                    if (this.state.clipboard.cut) {
                        const cutIndex = lodash_1.default.findIndex(value, { id: this.state.clipboard.itemId });
                        if (cutIndex > -1) {
                            lodash_1.default.pullAt(value, cutIndex);
                            didCut = true;
                        }
                        else {
                            didCut = this.cut(this.state.clipboard.listId, this.state.clipboard.itemId, lodash_1.default.filter(value, { type: "section" }));
                        }
                    }
                    const pasteIndex = lodash_1.default.findIndex(value, { id: itemId }); // check in the root array first
                    if (pasteIndex > -1) {
                        value.splice(pasteIndex, 0, this.state.clipboard.property);
                        didPaste = true;
                    }
                    else {
                        didPaste = this.paste(listId, itemId, lodash_1.default.filter(value, { type: "section" }));
                    }
                    // Dont update state untill all required operations are successfull
                    // Required to avoid the conditions where user would cut and copy an item into its own children
                    if (didPaste) {
                        if (this.state.clipboard.cut && !didCut) {
                            return;
                        }
                        this.setState({ clipboard: null });
                        return this.props.onChange(value);
                    }
                };
                this.getChildContext = () => {
                    return {
                        clipboard: this.state.clipboard
                    };
                };
                this.state = {
                    clipboard: null
                };
            }
            render() {
                const newProps = {
                    onCut: this.handleCut,
                    onCopy: this.handleCopy,
                    onPaste: this.handlePaste,
                    onPasteInto: this.handlePasteInto
                };
                // Inject cut/copy/paste/pasteInto handlers and render the outermost list component
                return R(WrappedComponent, lodash_1.default.assign({}, this.props, newProps));
            }
        },
        _a.childContextTypes = { clipboard: prop_types_1.default.object },
        _a;
}
exports.default = default_1;
