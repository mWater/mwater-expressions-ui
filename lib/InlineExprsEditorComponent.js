var ActionCancelModalComponent, ContentEditableComponent, ExprComponent, ExprInsertModalComponent, ExprUpdateModalComponent, ExprUtils, InlineExprsEditorComponent, PropTypes, R, React,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

React = require('react');

R = React.createElement;

ExprComponent = require('./ExprComponent');

ExprUtils = require("mwater-expressions").ExprUtils;

ActionCancelModalComponent = require("react-library/lib/ActionCancelModalComponent");

ContentEditableComponent = require('./ContentEditableComponent');

module.exports = InlineExprsEditorComponent = (function(superClass) {
  extend(InlineExprsEditorComponent, superClass);

  function InlineExprsEditorComponent() {
    this.handleChange = bind(this.handleChange, this);
    this.handleClick = bind(this.handleClick, this);
    this.handleUpdate = bind(this.handleUpdate, this);
    this.handleInsert = bind(this.handleInsert, this);
    this.handleInsertClick = bind(this.handleInsertClick, this);
    return InlineExprsEditorComponent.__super__.constructor.apply(this, arguments);
  }

  InlineExprsEditorComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    table: PropTypes.string.isRequired,
    text: PropTypes.string,
    exprs: PropTypes.array,
    onChange: PropTypes.func.isRequired,
    multiline: PropTypes.bool,
    rows: PropTypes.number
  };

  InlineExprsEditorComponent.defaultProps = {
    exprs: []
  };

  InlineExprsEditorComponent.prototype.handleInsertClick = function() {
    return this.insertModal.open();
  };

  InlineExprsEditorComponent.prototype.handleInsert = function(expr) {
    if (expr) {
      return this.contentEditable.pasteHTML(this.createExprHtml(expr));
    }
  };

  InlineExprsEditorComponent.prototype.handleUpdate = function(expr, index) {
    var exprs;
    exprs = this.props.exprs.slice();
    exprs[index] = expr;
    return this.props.onChange(this.props.text, exprs);
  };

  InlineExprsEditorComponent.prototype.handleClick = function(ev) {
    var index;
    index = ev.target.dataset["index"];
    if (index && index.match(/^\d+$/)) {
      index = parseInt(index);
      return this.updateModal.open(this.props.exprs[index], index);
    }
  };

  InlineExprsEditorComponent.prototype.handleChange = function(elem) {
    var exprs, index, processNode, text, wasBr;
    text = "";
    exprs = [];
    wasBr = false;
    index = 0;
    processNode = (function(_this) {
      return function(node, isFirst) {
        var commentNode, i, len, nodeText, ref, ref1, ref2, results, subnode;
        if (node.nodeType === 1) {
          if ((ref = node.tagName) === 'br' || ref === 'BR') {
            text += '\n';
            wasBr = true;
            return;
          }
          if (node.className && node.className.match(/inline-expr-block/)) {
            commentNode = _.find(node.childNodes, function(subnode) {
              return subnode.nodeType === 8;
            });
            if (commentNode) {
              text += "{" + index + "}";
              exprs.push(JSON.parse(decodeURIComponent(commentNode.nodeValue)));
              index += 1;
            }
            return;
          }
          if (node.tagName.toLowerCase() === "div" && node.innerHTML.toLowerCase() === "<br>") {
            text += "\n";
            wasBr = false;
            return;
          }
          if (!isFirst && !wasBr && ((ref1 = node.tagName) === 'div' || ref1 === 'DIV')) {
            text += "\n";
          }
          wasBr = false;
          ref2 = node.childNodes;
          results = [];
          for (i = 0, len = ref2.length; i < len; i++) {
            subnode = ref2[i];
            results.push(processNode(subnode));
          }
          return results;
        } else if (node.nodeType === 3) {
          wasBr = false;
          nodeText = node.nodeValue;
          if (!_this.props.multiline) {
            nodeText = nodeText.replace(/\r?\n/g, " ");
          }
          return text += nodeText;
        }
      };
    })(this);
    processNode(elem, true);
    text = text.replace(/\u2060/g, '');
    if (!this.props.multiline) {
      text = text.replace(/\r?\n/g, "");
    }
    return this.props.onChange(text, exprs);
  };

  InlineExprsEditorComponent.prototype.createExprHtml = function(expr, index) {
    var exprUtils, summary;
    exprUtils = new ExprUtils(this.props.schema);
    summary = exprUtils.summarizeExpr(expr) || "";
    if (summary.length > 50) {
      summary = summary.substr(0, 50) + "...";
    }
    return '<div class="inline-expr-block" contentEditable="false" data-index="' + index + '"><!--' + encodeURIComponent(JSON.stringify(expr)) + '-->' + _.escape(summary) + '</div>&#x2060;';
  };

  InlineExprsEditorComponent.prototype.createContentEditableHtml = function() {
    var html;
    html = _.escape(this.props.text);
    html = html.replace(/\{(\d+)\}/g, (function(_this) {
      return function(match, index) {
        var expr;
        index = parseInt(index);
        expr = _this.props.exprs[index];
        if (expr) {
          return _this.createExprHtml(expr, index);
        }
        return "";
      };
    })(this));
    if (this.props.multiline) {
      html = html.replace(/\r?\n/g, "<br>");
    }
    html = html.replace(/<br>$/, "<div><br></div>");
    if (html.length === 0) {
      html = '&#x2060;';
    }
    return html;
  };

  InlineExprsEditorComponent.prototype.renderInsertModal = function() {
    return R(ExprInsertModalComponent, {
      ref: ((function(_this) {
        return function(c) {
          return _this.insertModal = c;
        };
      })(this)),
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.table,
      onInsert: this.handleInsert
    });
  };

  InlineExprsEditorComponent.prototype.renderUpdateModal = function() {
    return R(ExprUpdateModalComponent, {
      ref: ((function(_this) {
        return function(c) {
          return _this.updateModal = c;
        };
      })(this)),
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.table,
      onUpdate: this.handleUpdate
    });
  };

  InlineExprsEditorComponent.prototype.render = function() {
    return R('div', {
      style: {
        position: "relative"
      }
    }, this.renderInsertModal(), this.renderUpdateModal(), R('div', {
      style: {
        paddingRight: 20
      }
    }, R(ContentEditableComponent, {
      ref: (function(_this) {
        return function(c) {
          return _this.contentEditable = c;
        };
      })(this),
      html: this.createContentEditableHtml(),
      style: {
        whiteSpace: 'pre-wrap',
        padding: "6px 12px",
        border: "1px solid #ccc",
        borderRadius: 4,
        minHeight: (this.props.multiline && this.props.rows ? (this.props.rows * 2.5) + "ex" : void 0)
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
  };

  return InlineExprsEditorComponent;

})(React.Component);

ExprInsertModalComponent = (function(superClass) {
  extend(ExprInsertModalComponent, superClass);

  ExprInsertModalComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    table: PropTypes.string.isRequired,
    onInsert: PropTypes.func.isRequired
  };

  function ExprInsertModalComponent(props) {
    ExprInsertModalComponent.__super__.constructor.call(this, props);
    this.state = {
      open: false,
      expr: null
    };
  }

  ExprInsertModalComponent.prototype.open = function() {
    return this.setState({
      open: true,
      expr: null
    });
  };

  ExprInsertModalComponent.prototype.render = function() {
    if (!this.state.open) {
      return null;
    }
    return R(ActionCancelModalComponent, {
      size: "large",
      actionLabel: "Insert",
      onAction: (function(_this) {
        return function() {
          return _this.setState({
            open: false
          }, function() {
            return _this.props.onInsert(_this.state.expr);
          });
        };
      })(this),
      onCancel: (function(_this) {
        return function() {
          return _this.setState({
            open: false
          });
        };
      })(this),
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
      onChange: (function(_this) {
        return function(expr) {
          return _this.setState({
            expr: expr
          });
        };
      })(this)
    })));
  };

  return ExprInsertModalComponent;

})(React.Component);

ExprUpdateModalComponent = (function(superClass) {
  extend(ExprUpdateModalComponent, superClass);

  ExprUpdateModalComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    table: PropTypes.string.isRequired,
    onUpdate: PropTypes.func.isRequired
  };

  function ExprUpdateModalComponent(props) {
    ExprUpdateModalComponent.__super__.constructor.call(this, props);
    this.state = {
      open: false,
      expr: null,
      index: null
    };
  }

  ExprUpdateModalComponent.prototype.open = function(expr, index) {
    return this.setState({
      open: true,
      expr: expr,
      index: index
    });
  };

  ExprUpdateModalComponent.prototype.render = function() {
    if (!this.state.open) {
      return null;
    }
    return R(ActionCancelModalComponent, {
      size: "large",
      actionLabel: "Update",
      onAction: (function(_this) {
        return function() {
          return _this.setState({
            open: false
          }, function() {
            return _this.props.onUpdate(_this.state.expr, _this.state.index);
          });
        };
      })(this),
      onCancel: (function(_this) {
        return function() {
          return _this.setState({
            open: false
          });
        };
      })(this),
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
      onChange: (function(_this) {
        return function(expr) {
          return _this.setState({
            expr: expr
          });
        };
      })(this)
    })));
  };

  return ExprUpdateModalComponent;

})(React.Component);
