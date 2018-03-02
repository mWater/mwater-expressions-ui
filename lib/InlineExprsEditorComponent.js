var ActionCancelModalComponent, ContentEditableComponent, ExprComponent, ExprInsertModalComponent, ExprUpdateModalComponent, ExprUtils, H, InlineExprsEditorComponent, PropTypes, R, React,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

PropTypes = require('prop-types');

React = require('react');

H = React.DOM;

R = React.createElement;

ExprComponent = require('./ExprComponent');

ExprUtils = require("mwater-expressions").ExprUtils;

ActionCancelModalComponent = require("react-library/lib/ActionCancelModalComponent");

ContentEditableComponent = require('./ContentEditableComponent');

// TODO perhaps use http://wadmiraal.net/lore/2012/06/14/contenteditable-hacks-returning-like-a-pro/

// Editor that is a text box with embeddable expressions
module.exports = InlineExprsEditorComponent = (function() {
  class InlineExprsEditorComponent extends React.Component {
    constructor() {
      super(...arguments);
      this.handleInsertClick = this.handleInsertClick.bind(this);
      this.handleInsert = this.handleInsert.bind(this);
      this.handleUpdate = this.handleUpdate.bind(this);
      this.handleClick = this.handleClick.bind(this);
      // Handle a change to the content editable element
      this.handleChange = this.handleChange.bind(this);
    }

    handleInsertClick() {
      boundMethodCheck(this, InlineExprsEditorComponent);
      return this.refs.insertModal.open();
    }

    handleInsert(expr) {
      boundMethodCheck(this, InlineExprsEditorComponent);
      if (expr) {
        return this.refs.contentEditable.pasteHTML(this.createExprHtml(expr));
      }
    }

    handleUpdate(expr, index) {
      var exprs;
      boundMethodCheck(this, InlineExprsEditorComponent);
      exprs = this.props.exprs.slice();
      exprs[index] = expr;
      return this.props.onChange(this.props.text, exprs);
    }

    handleClick(ev) {
      var index;
      boundMethodCheck(this, InlineExprsEditorComponent);
      // Get index of expression
      index = ev.target.dataset["index"];
      if (index && index.match(/^\d+$/)) {
        index = parseInt(index);
        return this.refs.updateModal.open(this.props.exprs[index], index);
      }
    }

    handleChange(elem) {
      var exprs, index, processNode, text, wasBr;
      boundMethodCheck(this, InlineExprsEditorComponent);
      
      // console.log "handleChange: #{elem.innerHTML}"

      // Walk DOM tree, adding strings and expressions
      text = "";
      exprs = [];
      // Keep track of <br> as a div after a br is not a new cr
      wasBr = false;
      // Which index of expression is current
      index = 0;
      processNode = (node, isFirst) => {
        var commentNode, i, len, nodeText, ref, ref1, ref2, results, subnode;
        if (node.nodeType === 1) { // Element
          // If br, add enter
          if ((ref = node.tagName) === 'br' || ref === 'BR') {
            text += '\n';
            wasBr = true;
            return;
          }
          // If expression, handle specially
          if (node.className && node.className.match(/inline-expr-block/)) {
            // Get expression decoded from comment which is first child
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
          // <div><br><div> is just simple \n
          if (node.tagName.toLowerCase() === "div" && node.innerHTML.toLowerCase() === "<br>") {
            text += "\n";
            wasBr = false;
            return;
          }
          // If div, add enter if not initial div
          if (!isFirst && !wasBr && ((ref1 = node.tagName) === 'div' || ref1 === 'DIV')) {
            text += "\n";
          }
          wasBr = false;
          ref2 = node.childNodes;
          // Recurse to children
          results = [];
          for (i = 0, len = ref2.length; i < len; i++) {
            subnode = ref2[i];
            results.push(processNode(subnode));
          }
          return results;
        } else if (node.nodeType === 3) {
          wasBr = false;
          // Append text, stripping \r\n if not multiline
          nodeText = node.nodeValue;
          if (!this.props.multiline) {
            nodeText = nodeText.replace(/\r?\n/g, " ");
          }
          return text += nodeText;
        }
      };
      processNode(elem, true);
      // Strip word joiner used to allow editing at end of string
      text = text.replace(/\u2060/g, '');
      // Enfore single line
      if (!this.props.multiline) {
        text = text.replace(/\r?\n/g, "");
      }
      // console.log "onChange: #{text}"
      return this.props.onChange(text, exprs);
    }

    // Create html for an expression
    createExprHtml(expr, index) {
      var exprUtils, summary;
      // Create expr utils
      exprUtils = new ExprUtils(this.props.schema);
      summary = exprUtils.summarizeExpr(expr) || "";
      // Limit length
      if (summary.length > 50) {
        summary = summary.substr(0, 50) + "...";
      }
      // Add as div with a comment field that encodes the content
      return '<div class="inline-expr-block" contentEditable="false" data-index="' + index + '"><!--' + encodeURIComponent(JSON.stringify(expr)) + '-->' + _.escape(summary) + '</div>&#x2060;';
    }

    createContentEditableHtml() {
      var html;
      // Escape HTML
      html = _.escape(this.props.text);
      // Replace {0}, {1}, etc with an inline div <div class="inline-expr"><!--encoded expression-->SUMMARY</div>
      html = html.replace(/\{(\d+)\}/g, (match, index) => {
        var expr;
        index = parseInt(index);
        expr = this.props.exprs[index];
        if (expr) {
          return this.createExprHtml(expr, index);
        }
        return "";
      });
      // Keep CR 
      if (this.props.multiline) {
        html = html.replace(/\r?\n/g, "<br>");
      }
      // Special case of trailing br (Chrome behaviour won't render)
      html = html.replace(/<br>$/, "<div><br></div>");
      // html = html.replace(/^<br>/, "<div><br></div>")

      // If empty, put placeholder
      if (html.length === 0) {
        html = '&#x2060;';
      }
      // console.log "createHtml: #{html}"
      return html;
    }

    renderInsertModal() {
      return R(ExprInsertModalComponent, {
        ref: "insertModal",
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        table: this.props.table,
        onInsert: this.handleInsert
      });
    }

    renderUpdateModal() {
      return R(ExprUpdateModalComponent, {
        ref: "updateModal",
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        table: this.props.table,
        onUpdate: this.handleUpdate
      });
    }

    render() {
      return H.div({
        style: {
          position: "relative"
        }
      }, this.renderInsertModal(), this.renderUpdateModal(), H.div({
        style: {
          paddingRight: 20
        }
      }, R(ContentEditableComponent, {
        ref: "contentEditable",
        html: this.createContentEditableHtml(),
        style: {
          whiteSpace: 'pre-wrap',
          padding: "6px 12px",
          border: "1px solid #ccc",
          borderRadius: 4,
          minHeight: (this.props.multiline && this.props.rows ? `${this.props.rows * 2.5}ex` : void 0)
        },
        onChange: this.handleChange,
        onClick: this.handleClick
      })), H.a({
        onClick: this.handleInsertClick,
        style: {
          cursor: "pointer",
          position: "absolute",
          right: 5,
          top: 8,
          fontStyle: "italic",
          color: "#337ab7"
        }
      }, "f", H.sub(null, "x")));
    }

  };

  InlineExprsEditorComponent.propTypes = {
    schema: PropTypes.object.isRequired, // Schema to use
    dataSource: PropTypes.object.isRequired, // Data source to use to get values
    table: PropTypes.string.isRequired, // Current table
    text: PropTypes.string, // Text with embedded expressions as {0}, {1}, etc.
    exprs: PropTypes.array, // Expressions that correspond to {0}, {1}, etc.
    onChange: PropTypes.func.isRequired, // Called with (text, exprs)
    multiline: PropTypes.bool, // Allow multiple lines
    rows: PropTypes.number // Optional number of lines
  };

  InlineExprsEditorComponent.defaultProps = {
    exprs: []
  };

  return InlineExprsEditorComponent;

}).call(this);

ExprInsertModalComponent = (function() {
  // Modal that displays an expression builder
  class ExprInsertModalComponent extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        open: false,
        expr: null
      };
    }

    open() {
      return this.setState({
        open: true,
        expr: null
      });
    }

    render() {
      if (!this.state.open) {
        return null;
      }
      return R(ActionCancelModalComponent, {
        size: "large",
        actionLabel: "Insert",
        onAction: () => {
          
          // Close first to avoid strange effects when mixed with pojoviews
          return this.setState({
            open: false
          }, () => {
            return this.props.onInsert(this.state.expr);
          });
        },
        onCancel: () => {
          return this.setState({
            open: false
          });
        },
        title: "Insert Expression"
      }, H.div({
        style: {
          paddingBottom: 200
        }
      }, R(ExprComponent, {
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        table: this.props.table,
        types: ['text', 'number', 'enum', 'date', 'datetime'],
        value: this.state.expr,
        onChange: (expr) => {
          return this.setState({
            expr: expr
          });
        }
      })));
    }

  };

  ExprInsertModalComponent.propTypes = {
    schema: PropTypes.object.isRequired, // Schema to use
    dataSource: PropTypes.object.isRequired, // Data source to use to get values
    table: PropTypes.string.isRequired, // Current table
    onInsert: PropTypes.func.isRequired // Called with expr to insert
  };

  return ExprInsertModalComponent;

}).call(this);

ExprUpdateModalComponent = (function() {
  
  // Modal that displays an expression builder
  class ExprUpdateModalComponent extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        open: false,
        expr: null,
        index: null
      };
    }

    open(expr, index) {
      return this.setState({
        open: true,
        expr: expr,
        index: index
      });
    }

    render() {
      if (!this.state.open) {
        return null;
      }
      return R(ActionCancelModalComponent, {
        size: "large",
        actionLabel: "Update",
        onAction: () => {
          
          // Close first to avoid strange effects when mixed with pojoviews
          return this.setState({
            open: false
          }, () => {
            return this.props.onUpdate(this.state.expr, this.state.index);
          });
        },
        onCancel: () => {
          return this.setState({
            open: false
          });
        },
        title: "Update Expression"
      }, H.div({
        style: {
          paddingBottom: 200
        }
      }, R(ExprComponent, {
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        table: this.props.table,
        types: ['text', 'number', 'enum', 'date', 'datetime'],
        value: this.state.expr,
        onChange: (expr) => {
          return this.setState({
            expr: expr
          });
        }
      })));
    }

  };

  ExprUpdateModalComponent.propTypes = {
    schema: PropTypes.object.isRequired, // Schema to use
    dataSource: PropTypes.object.isRequired, // Data source to use to get values
    table: PropTypes.string.isRequired, // Current table
    onUpdate: PropTypes.func.isRequired // Called with expr to update
  };

  return ExprUpdateModalComponent;

}).call(this);
