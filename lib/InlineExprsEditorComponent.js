"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var ActionCancelModalComponent,
    ContentEditableComponent,
    ExprComponent,
    ExprInsertModalComponent,
    ExprUpdateModalComponent,
    ExprUtils,
    InlineExprsEditorComponent,
    PropTypes,
    R,
    React,
    _,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

_ = require('lodash');
PropTypes = require('prop-types');
React = require('react');
R = React.createElement;
ExprComponent = require('./ExprComponent');
ExprUtils = require("mwater-expressions").ExprUtils;
ActionCancelModalComponent = require("react-library/lib/ActionCancelModalComponent");
ContentEditableComponent = require('./ContentEditableComponent'); // TODO perhaps use http://wadmiraal.net/lore/2012/06/14/contenteditable-hacks-returning-like-a-pro/
// Editor that is a text box with embeddable expressions

module.exports = InlineExprsEditorComponent = function () {
  var InlineExprsEditorComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(InlineExprsEditorComponent, _React$Component);

    var _super = _createSuper(InlineExprsEditorComponent);

    function InlineExprsEditorComponent() {
      var _this;

      (0, _classCallCheck2["default"])(this, InlineExprsEditorComponent);
      _this = _super.apply(this, arguments);
      _this.handleInsertClick = _this.handleInsertClick.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleInsert = _this.handleInsert.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleUpdate = _this.handleUpdate.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleClick = _this.handleClick.bind((0, _assertThisInitialized2["default"])(_this)); // Handle a change to the content editable element

      _this.handleChange = _this.handleChange.bind((0, _assertThisInitialized2["default"])(_this));
      return _this;
    }

    (0, _createClass2["default"])(InlineExprsEditorComponent, [{
      key: "handleInsertClick",
      value: function handleInsertClick() {
        boundMethodCheck(this, InlineExprsEditorComponent);
        return this.insertModal.open();
      }
    }, {
      key: "handleInsert",
      value: function handleInsert(expr) {
        boundMethodCheck(this, InlineExprsEditorComponent);

        if (expr) {
          return this.contentEditable.pasteHTML(this.createExprHtml(expr));
        }
      }
    }, {
      key: "handleUpdate",
      value: function handleUpdate(expr, index) {
        var exprs;
        boundMethodCheck(this, InlineExprsEditorComponent);
        exprs = this.props.exprs.slice();
        exprs[index] = expr;
        return this.props.onChange(this.props.text, exprs);
      }
    }, {
      key: "handleClick",
      value: function handleClick(ev) {
        var index;
        boundMethodCheck(this, InlineExprsEditorComponent); // Get index of expression

        index = ev.target.dataset["index"];

        if (index && index.match(/^\d+$/)) {
          index = parseInt(index);
          return this.updateModal.open(this.props.exprs[index], index);
        }
      }
    }, {
      key: "handleChange",
      value: function handleChange(elem) {
        var _this2 = this;

        var exprs, index, _processNode, text, wasBr;

        boundMethodCheck(this, InlineExprsEditorComponent); // console.log "handleChange: #{elem.innerHTML}"
        // Walk DOM tree, adding strings and expressions

        text = "";
        exprs = []; // Keep track of <br> as a div after a br is not a new cr

        wasBr = false; // Which index of expression is current

        index = 0;

        _processNode = function processNode(node, isFirst) {
          var commentNode, i, len, nodeText, ref, ref1, ref2, results, subnode;

          if (node.nodeType === 1) {
            // Element
            // If br, add enter
            if ((ref = node.tagName) === 'br' || ref === 'BR') {
              text += '\n';
              wasBr = true;
              return;
            } // If expression, handle specially


            if (node.className && node.className.match(/inline-expr-block/)) {
              // Get expression decoded from comment which is first child
              commentNode = _.find(node.childNodes, function (subnode) {
                return subnode.nodeType === 8;
              });

              if (commentNode) {
                text += "{" + index + "}";
                exprs.push(JSON.parse(decodeURIComponent(commentNode.nodeValue)));
                index += 1;
              }

              return;
            } // <div><br><div> is just simple \n


            if (node.tagName.toLowerCase() === "div" && node.innerHTML.toLowerCase() === "<br>") {
              text += "\n";
              wasBr = false;
              return;
            } // If div, add enter if not initial div


            if (!isFirst && !wasBr && ((ref1 = node.tagName) === 'div' || ref1 === 'DIV')) {
              text += "\n";
            }

            wasBr = false;
            ref2 = node.childNodes; // Recurse to children

            results = [];

            for (i = 0, len = ref2.length; i < len; i++) {
              subnode = ref2[i];
              results.push(_processNode(subnode));
            }

            return results;
          } else if (node.nodeType === 3) {
            wasBr = false; // Append text, stripping \r\n if not multiline

            nodeText = node.nodeValue;

            if (!_this2.props.multiline) {
              nodeText = nodeText.replace(/\r?\n/g, " ");
            }

            return text += nodeText;
          }
        };

        _processNode(elem, true); // Strip word joiner used to allow editing at end of string


        text = text.replace(/\u2060/g, ''); // Enfore single line

        if (!this.props.multiline) {
          text = text.replace(/\r?\n/g, "");
        } // console.log "onChange: #{text}"


        return this.props.onChange(text, exprs);
      } // Create html for an expression

    }, {
      key: "createExprHtml",
      value: function createExprHtml(expr, index) {
        var exprUtils, summary; // Create expr utils

        exprUtils = new ExprUtils(this.props.schema);
        summary = exprUtils.summarizeExpr(expr) || ""; // Limit length

        if (summary.length > 50) {
          summary = summary.substr(0, 50) + "...";
        } // Add as div with a comment field that encodes the content


        return '<div class="inline-expr-block" contentEditable="false" data-index="' + index + '"><!--' + encodeURIComponent(JSON.stringify(expr)) + '-->' + _.escape(summary) + '</div>&#x2060;';
      }
    }, {
      key: "createContentEditableHtml",
      value: function createContentEditableHtml() {
        var _this3 = this;

        var html; // Escape HTML

        html = _.escape(this.props.text); // Replace {0}, {1}, etc with an inline div <div class="inline-expr"><!--encoded expression-->SUMMARY</div>

        html = html.replace(/\{(\d+)\}/g, function (match, index) {
          var expr;
          index = parseInt(index);
          expr = _this3.props.exprs[index];

          if (expr) {
            return _this3.createExprHtml(expr, index);
          }

          return "";
        }); // Keep CR 

        if (this.props.multiline) {
          html = html.replace(/\r?\n/g, "<br>");
        } // Special case of trailing br (Chrome behaviour won't render)


        html = html.replace(/<br>$/, "<div><br></div>"); // html = html.replace(/^<br>/, "<div><br></div>")
        // If empty, put placeholder

        if (html.length === 0) {
          html = '&#x2060;';
        } // console.log "createHtml: #{html}"


        return html;
      }
    }, {
      key: "renderInsertModal",
      value: function renderInsertModal() {
        var _this4 = this;

        return R(ExprInsertModalComponent, {
          ref: function ref(c) {
            return _this4.insertModal = c;
          },
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: this.props.table,
          onInsert: this.handleInsert
        });
      }
    }, {
      key: "renderUpdateModal",
      value: function renderUpdateModal() {
        var _this5 = this;

        return R(ExprUpdateModalComponent, {
          ref: function ref(c) {
            return _this5.updateModal = c;
          },
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: this.props.table,
          onUpdate: this.handleUpdate
        });
      }
    }, {
      key: "render",
      value: function render() {
        var _this6 = this;

        return R('div', {
          style: {
            position: "relative"
          }
        }, this.renderInsertModal(), this.renderUpdateModal(), R('div', {
          style: {
            paddingRight: 20
          }
        }, R(ContentEditableComponent, {
          ref: function ref(c) {
            return _this6.contentEditable = c;
          },
          html: this.createContentEditableHtml(),
          style: {
            whiteSpace: 'pre-wrap',
            padding: "6px 12px",
            border: "1px solid #ccc",
            borderRadius: 4,
            minHeight: this.props.multiline && this.props.rows ? "".concat(this.props.rows * 2.5, "ex") : void 0
          },
          onChange: this.handleChange,
          onClick: this.handleClick
        })), R('a', {
          onClick: this.handleInsertClick,
          style: {
            cursor: "pointer",
            position: "absolute",
            right: 5,
            top: 8,
            fontStyle: "italic",
            color: "#337ab7"
          }
        }, "f", R('sub', null, "x")));
      }
    }]);
    return InlineExprsEditorComponent;
  }(React.Component);

  ;
  InlineExprsEditorComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    // Schema to use
    dataSource: PropTypes.object.isRequired,
    // Data source to use to get values
    table: PropTypes.string.isRequired,
    // Current table
    text: PropTypes.string,
    // Text with embedded expressions as {0}, {1}, etc.
    exprs: PropTypes.array,
    // Expressions that correspond to {0}, {1}, etc.
    onChange: PropTypes.func.isRequired,
    // Called with (text, exprs)
    multiline: PropTypes.bool,
    // Allow multiple lines
    rows: PropTypes.number // Optional number of lines

  };
  InlineExprsEditorComponent.defaultProps = {
    exprs: []
  };
  return InlineExprsEditorComponent;
}.call(void 0);

ExprInsertModalComponent = function () {
  // Modal that displays an expression builder
  var ExprInsertModalComponent = /*#__PURE__*/function (_React$Component2) {
    (0, _inherits2["default"])(ExprInsertModalComponent, _React$Component2);

    var _super2 = _createSuper(ExprInsertModalComponent);

    function ExprInsertModalComponent(props) {
      var _this7;

      (0, _classCallCheck2["default"])(this, ExprInsertModalComponent);
      _this7 = _super2.call(this, props);
      _this7.state = {
        open: false,
        expr: null
      };
      return _this7;
    }

    (0, _createClass2["default"])(ExprInsertModalComponent, [{
      key: "open",
      value: function open() {
        return this.setState({
          open: true,
          expr: null
        });
      }
    }, {
      key: "render",
      value: function render() {
        var _this8 = this;

        if (!this.state.open) {
          return null;
        }

        return R(ActionCancelModalComponent, {
          size: "large",
          actionLabel: "Insert",
          onAction: function onAction() {
            // Close first to avoid strange effects when mixed with pojoviews
            return _this8.setState({
              open: false
            }, function () {
              return _this8.props.onInsert(_this8.state.expr);
            });
          },
          onCancel: function onCancel() {
            return _this8.setState({
              open: false
            });
          },
          title: "Insert Expression"
        }, R('div', {
          style: {
            paddingBottom: 200
          }
        }, R(ExprComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: this.props.table,
          types: ['text', 'number', 'enum', 'date', 'datetime'],
          value: this.state.expr,
          onChange: function onChange(expr) {
            return _this8.setState({
              expr: expr
            });
          }
        })));
      }
    }]);
    return ExprInsertModalComponent;
  }(React.Component);

  ;
  ExprInsertModalComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    // Schema to use
    dataSource: PropTypes.object.isRequired,
    // Data source to use to get values
    table: PropTypes.string.isRequired,
    // Current table
    onInsert: PropTypes.func.isRequired // Called with expr to insert

  };
  return ExprInsertModalComponent;
}.call(void 0);

ExprUpdateModalComponent = function () {
  // Modal that displays an expression builder
  var ExprUpdateModalComponent = /*#__PURE__*/function (_React$Component3) {
    (0, _inherits2["default"])(ExprUpdateModalComponent, _React$Component3);

    var _super3 = _createSuper(ExprUpdateModalComponent);

    function ExprUpdateModalComponent(props) {
      var _this9;

      (0, _classCallCheck2["default"])(this, ExprUpdateModalComponent);
      _this9 = _super3.call(this, props);
      _this9.state = {
        open: false,
        expr: null,
        index: null
      };
      return _this9;
    }

    (0, _createClass2["default"])(ExprUpdateModalComponent, [{
      key: "open",
      value: function open(expr, index) {
        return this.setState({
          open: true,
          expr: expr,
          index: index
        });
      }
    }, {
      key: "render",
      value: function render() {
        var _this10 = this;

        if (!this.state.open) {
          return null;
        }

        return R(ActionCancelModalComponent, {
          size: "large",
          actionLabel: "Update",
          onAction: function onAction() {
            // Close first to avoid strange effects when mixed with pojoviews
            return _this10.setState({
              open: false
            }, function () {
              return _this10.props.onUpdate(_this10.state.expr, _this10.state.index);
            });
          },
          onCancel: function onCancel() {
            return _this10.setState({
              open: false
            });
          },
          title: "Update Expression"
        }, R('div', {
          style: {
            paddingBottom: 200
          }
        }, R(ExprComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: this.props.table,
          types: ['text', 'number', 'enum', 'date', 'datetime'],
          value: this.state.expr,
          onChange: function onChange(expr) {
            return _this10.setState({
              expr: expr
            });
          }
        })));
      }
    }]);
    return ExprUpdateModalComponent;
  }(React.Component);

  ;
  ExprUpdateModalComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    // Schema to use
    dataSource: PropTypes.object.isRequired,
    // Data source to use to get values
    table: PropTypes.string.isRequired,
    // Current table
    onUpdate: PropTypes.func.isRequired // Called with expr to update

  };
  return ExprUpdateModalComponent;
}.call(void 0);