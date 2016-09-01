var ContentEditableComponent, H, R, React, pasteHtmlAtCaret, selection,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

R = React.createElement;

selection = require('./saveSelection');

module.exports = ContentEditableComponent = (function(superClass) {
  extend(ContentEditableComponent, superClass);

  function ContentEditableComponent() {
    this.handleFocus = bind(this.handleFocus, this);
    this.handleBlur = bind(this.handleBlur, this);
    this.handleInput = bind(this.handleInput, this);
    return ContentEditableComponent.__super__.constructor.apply(this, arguments);
  }

  ContentEditableComponent.propTypes = {
    html: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func.isRequired,
    style: React.PropTypes.object,
    onClick: React.PropTypes.func,
    onFocus: React.PropTypes.func,
    onBlur: React.PropTypes.func
  };

  ContentEditableComponent.prototype.handleInput = function(ev) {
    if (!this.refs.editor) {
      return;
    }
    return this.props.onChange(this.refs.editor);
  };

  ContentEditableComponent.prototype.handleBlur = function(ev) {
    var base;
    if (typeof (base = this.props).onBlur === "function") {
      base.onBlur(ev);
    }
    if (!this.refs.editor) {
      return;
    }
    this.range = selection.save(this.refs.editor);
    return this.props.onChange(this.refs.editor);
  };

  ContentEditableComponent.prototype.handleFocus = function(ev) {
    var base;
    return typeof (base = this.props).onFocus === "function" ? base.onFocus(ev) : void 0;
  };

  ContentEditableComponent.prototype.focus = function() {
    return this.refs.editor.focus();
  };

  ContentEditableComponent.prototype.pasteHTML = function(html, selectPastedContent) {
    this.refs.editor.focus();
    if (this.range) {
      selection.restore(this.refs.editor, this.range);
    }
    pasteHtmlAtCaret(html, selectPastedContent);
    return this.props.onChange(this.refs.editor);
  };

  ContentEditableComponent.prototype.shouldComponentUpdate = function(nextProps) {
    var changed;
    changed = !this.refs.editor || nextProps.html !== this.props.html || this.refs.editor.innerHTML !== this.lastInnerHTML;
    return changed;
  };

  ContentEditableComponent.prototype.componentWillUpdate = function() {
    return this.range = selection.save(this.refs.editor);
  };

  ContentEditableComponent.prototype.componentDidMount = function() {
    if (this.refs.editor) {
      this.refs.editor.innerHTML = this.props.html;
      return this.lastInnerHTML = this.refs.editor.innerHTML;
    }
  };

  ContentEditableComponent.prototype.componentDidUpdate = function() {
    if (this.refs.editor) {
      this.refs.editor.innerHTML = this.props.html;
      this.lastInnerHTML = this.refs.editor.innerHTML;
    }
    if (document.activeElement === this.refs.editor && this.range) {
      return selection.restore(this.refs.editor, this.range);
    }
  };

  ContentEditableComponent.prototype.render = function() {
    return H.div({
      contentEditable: true,
      spellCheck: false,
      ref: "editor",
      onClick: this.props.onClick,
      style: this.props.style,
      onInput: this.handleInput,
      onFocus: this.handleFocus,
      onBlur: this.handleBlur
    });
  };

  return ContentEditableComponent;

})(React.Component);

pasteHtmlAtCaret = function(html, selectPastedContent) {
  var el, firstNode, frag, lastNode, node, range, sel;
  range = void 0;
  sel = window.getSelection();
  if (sel.getRangeAt && sel.rangeCount) {
    range = sel.getRangeAt(0);
    range.deleteContents();
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
