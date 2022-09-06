"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const selection = __importStar(require("./saveSelection"));
// Content editable component with cursor restoring
class ContentEditableComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleInput = (ev) => {
            if (!this.editor) {
                return;
            }
            return this.props.onChange(this.editor);
        };
        this.handleBlur = (ev) => {
            var _a, _b;
            (_b = (_a = this.props).onBlur) === null || _b === void 0 ? void 0 : _b.call(_a, ev);
            // Cancel timer
            if (this.selSaver) {
                clearTimeout(this.selSaver);
                this.selSaver = null;
            }
            if (!this.editor) {
                return;
            }
            return this.props.onChange(this.editor);
        };
        this.handleFocus = (ev) => {
            var _a, _b;
            (_b = (_a = this.props).onFocus) === null || _b === void 0 ? void 0 : _b.call(_a, ev);
            // Start selection saver (blur is not reliable in Firefox)
            var saveRange = () => {
                this.range = selection.save(this.editor);
                this.selSaver = setTimeout(saveRange, 200);
            };
            if (!this.selSaver) {
                this.selSaver = setTimeout(saveRange, 200);
            }
        };
    }
    focus() {
        this.editor.focus();
    }
    pasteHTML(html) {
        this.editor.focus();
        // Restore caret
        if (this.range) {
            selection.restore(this.editor, this.range);
        }
        pasteHtmlAtCaret(html);
        return this.props.onChange(this.editor);
    }
    getSelectedHTML() {
        let container;
        let html = "";
        const sel = window.getSelection();
        if (sel.rangeCount) {
            container = document.createElement("div");
            for (let i = 0, end = sel.rangeCount, asc = 0 <= end; asc ? i < end : i > end; asc ? i++ : i--) {
                container.appendChild(sel.getRangeAt(i).cloneContents());
            }
        }
        html = container.innerHTML;
        return html;
    }
    shouldComponentUpdate(nextProps) {
        // Update if prop html has changed
        // Note: this used to check if inner html has changed (i.e. this.editor.innerHTML !== this.lastInnerHTML)
        // but that caused problems with delayed refreshes https://github.com/mWater/mwater-visualization/issues/460
        const changed = !this.editor || nextProps.html !== this.props.html;
        // if changed
        //   console.log nextProps.html
        //   console.log @props.html
        //   console.log @editor.innerHTML
        //   console.log @lastInnerHTML
        return changed;
    }
    componentWillUpdate() {
        // Save caret
        this.range = selection.save(this.editor);
    }
    componentDidMount() {
        if (this.editor) {
            // Set inner html
            this.editor.innerHTML = this.props.html;
            this.lastInnerHTML = this.editor.innerHTML;
        }
    }
    componentDidUpdate() {
        if (this.editor) {
            // Set inner html
            this.editor.innerHTML = this.props.html;
            this.lastInnerHTML = this.editor.innerHTML;
        }
        // Restore caret if still focused
        if (document.activeElement === this.editor && this.range) {
            selection.restore(this.editor, this.range);
        }
    }
    componentWillUnmount() {
        // Cancel timer
        if (this.selSaver) {
            clearTimeout(this.selSaver);
            this.selSaver = null;
        }
    }
    render() {
        return R("div", {
            contentEditable: true,
            spellCheck: true,
            ref: (c) => {
                this.editor = c;
            },
            onClick: this.props.onClick,
            style: this.props.style,
            onInput: this.handleInput,
            onFocus: this.handleFocus,
            onBlur: this.handleBlur
        });
    }
}
exports.default = ContentEditableComponent;
// http://stackoverflow.com/questions/6690752/insert-html-at-caret-in-a-contenteditable-div
// TODO selectPastedContent doesn't work
function pasteHtmlAtCaret(html) {
    let range = undefined;
    const sel = window.getSelection();
    if (sel.getRangeAt && sel.rangeCount) {
        range = sel.getRangeAt(0);
        range.deleteContents();
        // Create fragment to insert
        const el = document.createElement("div");
        el.innerHTML = html;
        const frag = document.createDocumentFragment();
        let node = undefined;
        let lastNode = undefined;
        while ((node = el.firstChild)) {
            lastNode = frag.appendChild(node);
        }
        const firstNode = frag.firstChild;
        range = range.cloneRange();
        range.insertNode(frag);
        range.collapse(true);
        sel.removeAllRanges();
        return sel.addRange(range);
    }
}
// if selectPastedContent
//       range.setStartBefore firstNode
//     else
//       range.collapse true
