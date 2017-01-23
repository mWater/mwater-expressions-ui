var H, LocalizedStringEditorComp, React,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

module.exports = LocalizedStringEditorComp = (function(superClass) {
  extend(LocalizedStringEditorComp, superClass);

  function LocalizedStringEditorComp() {
    this.onLanguageSelectionClick = bind(this.onLanguageSelectionClick, this);
    this.handleChangeValue = bind(this.handleChangeValue, this);
    this.handleRemoveValue = bind(this.handleRemoveValue, this);
    LocalizedStringEditorComp.__super__.constructor.apply(this, arguments);
    this.state = {
      selectedLanguageCode: "en"
    };
  }

  LocalizedStringEditorComp.propTypes = {
    value: React.PropTypes.object,
    onChange: React.PropTypes.func.isRequired,
    availableLanguages: React.PropTypes.array,
    readonly: React.PropTypes.bool,
    multiline: React.PropTypes.bool
  };

  LocalizedStringEditorComp.prototype.handleRemoveValue = function() {
    var names;
    names = _.clone(this.props.value);
    delete names[this.state.selectedLanguageCode];
    return this.props.onChange(names);
  };

  LocalizedStringEditorComp.prototype.handleChangeValue = function(ev) {
    var currentValue, names, newValue;
    if (this.props.readonly) {
      return;
    }
    newValue = ev.target.value;
    currentValue = this.props.value && this.props.value[this.state.selectedLanguageCode];
    if ((currentValue != null) && currentValue !== "") {
      if ((newValue == null) || newValue === "") {
        this.handleRemoveValue();
        return;
      }
    }
    names = _.clone(this.props.value || {
      _base: "en"
    });
    names[this.state.selectedLanguageCode] = newValue;
    if (!names._base) {
      names._base = this.state.selectedLanguageCode;
    }
    return this.props.onChange(names);
  };

  LocalizedStringEditorComp.prototype.onLanguageSelectionClick = function(languageCode) {
    return this.setState({
      selectedLanguageCode: languageCode
    });
  };

  LocalizedStringEditorComp.prototype.render = function() {
    var availableLanguages, currentText, placeholder;
    if (this.props.value) {
      currentText = this.props.value[this.state.selectedLanguageCode];
      placeholder = null;
      if (this.state.selectedLanguageCode !== this.props.value._base) {
        placeholder = this.props.value[this.props.value._base];
      }
    }
    availableLanguages = this.props.availableLanguages || [
      {
        id: "en",
        name: "en"
      }, {
        id: "fr",
        name: "fr"
      }, {
        id: "es",
        name: "es"
      }, {
        id: "pt",
        name: "pt"
      }
    ];
    return H.div({
      className: "input-group"
    }, this.props.multiline ? H.textarea({
      className: "form-control",
      rows: 5,
      onChange: this.handleChangeValue,
      value: currentText,
      placeholder: placeholder
    }) : H.input({
      type: "text",
      className: "form-control",
      onChange: this.handleChangeValue,
      value: currentText,
      placeholder: placeholder
    }), H.div({
      className: "input-group-btn"
    }, H.button({
      type: "button",
      className: "btn btn-default dropdown-toggle",
      "data-toggle": "dropdown"
    }, this.state.selectedLanguageCode, " ", H.span({
      className: "caret"
    })), H.ul({
      className: "dropdown-menu"
    }, _.map(availableLanguages, (function(_this) {
      return function(availableLanguage) {
        return H.li({
          key: availableLanguage.id
        }, H.a({
          onClick: _this.onLanguageSelectionClick.bind(null, availableLanguage.id)
        }, availableLanguage.name));
      };
    })(this)))));
  };

  return LocalizedStringEditorComp;

})(React.Component);
