"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var ContentEditableComponent,
    PropTypes,
    R,
    React,
    pasteHtmlAtCaret,
    selection,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

PropTypes = require('prop-types');
React = require('react');
R = React.createElement;
selection = require('./saveSelection'); // Content editable component with cursor restoring

module.exports = ContentEditableComponent = function () {
  var ContentEditableComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(ContentEditableComponent, _React$Component);

    var _super = _createSuper(ContentEditableComponent);

    function ContentEditableComponent() {
      var _this;

      (0, _classCallCheck2["default"])(this, ContentEditableComponent);
      _this = _super.apply(this, arguments);
      _this.handleInput = _this.handleInput.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleBlur = _this.handleBlur.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleFocus = _this.handleFocus.bind((0, _assertThisInitialized2["default"])(_this));
      return _this;
    }

    (0, _createClass2["default"])(ContentEditableComponent, [{
      key: "handleInput",
      value: function handleInput(ev) {
        boundMethodCheck(this, ContentEditableComponent);

        if (!this.editor) {
          return;
        }

        return this.props.onChange(this.editor);
      }
    }, {
      key: "handleBlur",
      value: function handleBlur(ev) {
        var base;
        boundMethodCheck(this, ContentEditableComponent);

        if (typeof (base = this.props).onBlur === "function") {
          base.onBlur(ev);
        } // Cancel timer


        if (this.selSaver) {
          clearTimeout(this.selSaver);
          this.selSaver = null;
        }

        if (!this.editor) {
          return;
        }

        return this.props.onChange(this.editor);
      }
    }, {
      key: "handleFocus",
      value: function handleFocus(ev) {
        var _this2 = this;

        var base, _saveRange;

        boundMethodCheck(this, ContentEditableComponent);

        if (typeof (base = this.props).onFocus === "function") {
          base.onFocus(ev);
        } // Start selection saver (blur is not reliable in Firefox)


        _saveRange = function saveRange() {
          _this2.range = selection.save(_this2.editor);
          return _this2.selSaver = setTimeout(_saveRange, 200);
        };

        if (!this.selSaver) {
          return this.selSaver = setTimeout(_saveRange, 200);
        }
      }
    }, {
      key: "focus",
      value: function focus() {
        return this.editor.focus();
      }
    }, {
      key: "pasteHTML",
      value: function pasteHTML(html) {
        this.editor.focus(); // Restore caret

        if (this.range) {
          selection.restore(this.editor, this.range);
        }

        pasteHtmlAtCaret(html);
        return this.props.onChange(this.editor);
      }
    }, {
      key: "getSelectedHTML",
      value: function getSelectedHTML() {
        var container, html, i, j, ref, sel;
        html = '';
        sel = window.getSelection();

        if (sel.rangeCount) {
          container = document.createElement("div");

          for (i = j = 0, ref = sel.rangeCount; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
            container.appendChild(sel.getRangeAt(i).cloneContents());
          }
        }

        html = container.innerHTML;
        return html;
      }
    }, {
      key: "shouldComponentUpdate",
      value: function shouldComponentUpdate(nextProps) {
        var changed; // Update if prop html has changed, or if inner html has changed

        changed = !this.editor || nextProps.html !== this.props.html || this.editor.innerHTML !== this.lastInnerHTML; // if changed
        //   console.log nextProps.html
        //   console.log @props.html 
        //   console.log @editor.innerHTML 
        //   console.log @lastInnerHTML

        return changed;
      }
    }, {
      key: "componentWillUpdate",
      value: function componentWillUpdate() {
        // Save caret
        return this.range = selection.save(this.editor);
      }
    }, {
      key: "componentDidMount",
      value: function componentDidMount() {
        if (this.editor) {
          // Set inner html
          this.editor.innerHTML = this.props.html;
          return this.lastInnerHTML = this.editor.innerHTML;
        }
      }
    }, {
      key: "componentDidUpdate",
      value: function componentDidUpdate() {
        if (this.editor) {
          // Set inner html
          this.editor.innerHTML = this.props.html;
          this.lastInnerHTML = this.editor.innerHTML;
        } // Restore caret if still focused


        if (document.activeElement === this.editor && this.range) {
          return selection.restore(this.editor, this.range);
        }
      }
    }, {
      key: "componentWillUnmount",
      value: function componentWillUnmount() {
        // Cancel timer
        if (this.selSaver) {
          clearTimeout(this.selSaver);
          return this.selSaver = null;
        }
      }
    }, {
      key: "render",
      value: function render() {
        var _this3 = this;

        return R('div', {
          contentEditable: true,
          spellCheck: true,
          ref: function ref(c) {
            return _this3.editor = c;
          },
          onClick: this.props.onClick,
          style: this.props.style,
          onInput: this.handleInput,
          onFocus: this.handleFocus,
          onBlur: this.handleBlur
        });
      }
    }]);
    return ContentEditableComponent;
  }(React.Component);

  ;
  ContentEditableComponent.propTypes = {
    html: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    // Called with element
    style: PropTypes.object,
    // Style to add to div
    onClick: PropTypes.func,
    // Set to catch click events
    onFocus: PropTypes.func,
    // Set to catch focus events
    onBlur: PropTypes.func // Set to catch blur events

  };
  return ContentEditableComponent;
}.call(void 0); // http://stackoverflow.com/questions/6690752/insert-html-at-caret-in-a-contenteditable-div
// TODO selectPastedContent doesn't work


pasteHtmlAtCaret = function pasteHtmlAtCaret(html) {
  var el, firstNode, frag, lastNode, node, range, sel;
  range = void 0;
  sel = window.getSelection();

  if (sel.getRangeAt && sel.rangeCount) {
    range = sel.getRangeAt(0);
    range.deleteContents(); // Create fragment to insert  

    el = document.createElement('div');
    el.innerHTML = html;
    frag = document.createDocumentFragment();
    node = void 0;
    lastNode = void 0;

    while (node = el.firstChild) {
      lastNode = frag.appendChild(node);
    }

    firstNode = frag.firstChild;
    range = range.cloneRange();
    range.insertNode(frag);
    range.collapse(true);
    sel.removeAllRanges();
    return sel.addRange(range);
  }
}; // if selectPastedContent
//       range.setStartBefore firstNode
//     else
//       range.collapse true