let ContentEditableComponent;
import PropTypes from 'prop-types';
import React from 'react';
const R = React.createElement;
import selection from './saveSelection';

// Content editable component with cursor restoring
export default ContentEditableComponent = (function() {
  ContentEditableComponent = class ContentEditableComponent extends React.Component {
    constructor(...args) {
      super(...args);
      this.handleInput = this.handleInput.bind(this);
      this.handleBlur = this.handleBlur.bind(this);
      this.handleFocus = this.handleFocus.bind(this);
    }

    static initClass() {
      this.propTypes = {
        html: PropTypes.string.isRequired,
        onChange: PropTypes.func.isRequired,  // Called with element
        style: PropTypes.object, // Style to add to div
        onClick: PropTypes.func,  // Set to catch click events
        onFocus: PropTypes.func,  // Set to catch focus events
        onBlur: PropTypes.func
      };
        // Set to catch blur events
    }

    handleInput(ev) { 
      if (!this.editor) {
        return; 
      }

      return this.props.onChange(this.editor);
    }

    handleBlur(ev) {
      this.props.onBlur?.(ev);

      // Cancel timer
      if (this.selSaver) {
        clearTimeout(this.selSaver);
        this.selSaver = null;
      }

      if (!this.editor) {
        return; 
      }

      return this.props.onChange(this.editor);
    }

    handleFocus(ev) {
      this.props.onFocus?.(ev);

      // Start selection saver (blur is not reliable in Firefox)
      var saveRange = () => {
        this.range = selection.save(this.editor);
        return this.selSaver = setTimeout(saveRange, 200);
      };

      if (!this.selSaver) {
        return this.selSaver = setTimeout(saveRange, 200);
      }
    }

    focus() {
      return this.editor.focus();
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
      let html = '';
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
      // Update if prop html has changed, or if inner html has changed
      const changed = !this.editor || (nextProps.html !== this.props.html) || (this.editor.innerHTML !== this.lastInnerHTML);
      // if changed
      //   console.log nextProps.html
      //   console.log @props.html 
      //   console.log @editor.innerHTML 
      //   console.log @lastInnerHTML
      return changed;
    }
 
    componentWillUpdate() {
      // Save caret
      return this.range = selection.save(this.editor);
    }
    
    componentDidMount() {
      if (this.editor) {
        // Set inner html
        this.editor.innerHTML = this.props.html;
        return this.lastInnerHTML = this.editor.innerHTML;
      }
    }

    componentDidUpdate() {
      if (this.editor) {
        // Set inner html
        this.editor.innerHTML = this.props.html;
        this.lastInnerHTML = this.editor.innerHTML;
      }

      // Restore caret if still focused
      if ((document.activeElement === this.editor) && this.range) {
        return selection.restore(this.editor, this.range);
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
      return R('div', { 
        contentEditable: true,
        spellCheck: true,
        ref: c => { return this.editor = c; },
        onClick: this.props.onClick,
        style: this.props.style,
        onInput: this.handleInput,
        onFocus: this.handleFocus,
        onBlur: this.handleBlur
      }
      );
    }
  };
  ContentEditableComponent.initClass();
  return ContentEditableComponent;
})();


// http://stackoverflow.com/questions/6690752/insert-html-at-caret-in-a-contenteditable-div
// TODO selectPastedContent doesn't work
var pasteHtmlAtCaret = function(html) {
  let range = undefined;
  const sel = window.getSelection();

  if (sel.getRangeAt && sel.rangeCount) {
    range = sel.getRangeAt(0);
    range.deleteContents();

    // Create fragment to insert  
    const el = document.createElement('div');
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
};

// if selectPastedContent
//       range.setStartBefore firstNode
//     else
//       range.collapse true