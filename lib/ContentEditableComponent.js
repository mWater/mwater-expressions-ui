var ContentEditableComponent, H, PropTypes, R, React, pasteHtmlAtCaret, selection,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

PropTypes = require('prop-types');

React = require('react');

H = React.DOM;

R = React.createElement;

selection = require('./saveSelection');

// Content editable component with cursor restoring
module.exports = ContentEditableComponent = (function() {
  class ContentEditableComponent extends React.Component {
    constructor() {
      super(...arguments);
      this.handleInput = this.handleInput.bind(this);
      this.handleBlur = this.handleBlur.bind(this);
      this.handleFocus = this.handleFocus.bind(this);
    }

    handleInput(ev) {
      boundMethodCheck(this, ContentEditableComponent);
      if (!this.refs.editor) {
        return;
      }
      return this.props.onChange(this.refs.editor);
    }

    handleBlur(ev) {
      var base;
      boundMethodCheck(this, ContentEditableComponent);
      if (typeof (base = this.props).onBlur === "function") {
        base.onBlur(ev);
      }
      // Cancel timer
      if (this.selSaver) {
        clearTimeout(this.selSaver);
        this.selSaver = null;
      }
      if (!this.refs.editor) {
        return;
      }
      return this.props.onChange(this.refs.editor);
    }

    handleFocus(ev) {
      var base, saveRange;
      boundMethodCheck(this, ContentEditableComponent);
      if (typeof (base = this.props).onFocus === "function") {
        base.onFocus(ev);
      }
      // Start selection saver (blur is not reliable in Firefox)
      saveRange = () => {
        this.range = selection.save(this.refs.editor);
        return this.selSaver = setTimeout(saveRange, 200);
      };
      if (!this.selSaver) {
        return this.selSaver = setTimeout(saveRange, 200);
      }
    }

    focus() {
      return this.refs.editor.focus();
    }

    pasteHTML(html) {
      this.refs.editor.focus();
      // Restore caret
      if (this.range) {
        selection.restore(this.refs.editor, this.range);
      }
      pasteHtmlAtCaret(html);
      return this.props.onChange(this.refs.editor);
    }

    getSelectedHTML() {
      var container, html, i, j, ref, sel;
      html = '';
      sel = window.getSelection();
      if (sel.rangeCount) {
        container = document.createElement("div");
        for (i = j = 0, ref = sel.rangeCount; (0 <= ref ? j < ref : j > ref); i = 0 <= ref ? ++j : --j) {
          container.appendChild(sel.getRangeAt(i).cloneContents());
        }
      }
      html = container.innerHTML;
      return html;
    }

    shouldComponentUpdate(nextProps) {
      var changed;
      // Update if prop html has changed, or if inner html has changed
      changed = !this.refs.editor || nextProps.html !== this.props.html || this.refs.editor.innerHTML !== this.lastInnerHTML;
      // if changed
      //   console.log nextProps.html
      //   console.log @props.html 
      //   console.log @refs.editor.innerHTML 
      //   console.log @lastInnerHTML
      return changed;
    }

    componentWillUpdate() {
      // Save caret
      return this.range = selection.save(this.refs.editor);
    }

    componentDidMount() {
      if (this.refs.editor) {
        // Set inner html
        this.refs.editor.innerHTML = this.props.html;
        return this.lastInnerHTML = this.refs.editor.innerHTML;
      }
    }

    componentDidUpdate() {
      if (this.refs.editor) {
        // Set inner html
        this.refs.editor.innerHTML = this.props.html;
        this.lastInnerHTML = this.refs.editor.innerHTML;
      }
      // Restore caret if still focused
      if (document.activeElement === this.refs.editor && this.range) {
        return selection.restore(this.refs.editor, this.range);
      }
    }

    componentWillUnmount() {
      // Cancel timer
      if (this.selSaver) {
        clearTimeout(this.selSaver);
        return this.selSaver = null;
      }
    }

    render() {
      return H.div({
        contentEditable: true,
        spellCheck: true,
        ref: "editor",
        onClick: this.props.onClick,
        style: this.props.style,
        onInput: this.handleInput,
        onFocus: this.handleFocus,
        onBlur: this.handleBlur
      });
    }

  };

  ContentEditableComponent.propTypes = {
    html: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired, // Called with element
    style: PropTypes.object, // Style to add to div
    onClick: PropTypes.func, // Set to catch click events
    onFocus: PropTypes.func, // Set to catch focus events
    onBlur: PropTypes.func // Set to catch blur events
  };

  return ContentEditableComponent;

}).call(this);

// http://stackoverflow.com/questions/6690752/insert-html-at-caret-in-a-contenteditable-div
// TODO selectPastedContent doesn't work
pasteHtmlAtCaret = function(html) {
  var el, firstNode, frag, lastNode, node, range, sel;
  range = void 0;
  sel = window.getSelection();
  if (sel.getRangeAt && sel.rangeCount) {
    range = sel.getRangeAt(0);
    range.deleteContents();
    // Create fragment to insert  
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
};

// if selectPastedContent
//       range.setStartBefore firstNode
//     else
//       range.collapse true
