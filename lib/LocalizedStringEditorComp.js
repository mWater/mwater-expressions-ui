var LocalizedStringEditorComp, PropTypes, R, React,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

React = require('react');

R = React.createElement;

module.exports = LocalizedStringEditorComp = (function(superClass) {
  extend(LocalizedStringEditorComp, superClass);

  function LocalizedStringEditorComp(props) {
    this.onLanguageSelectionClick = bind(this.onLanguageSelectionClick, this);
    this.handleChangeValue = bind(this.handleChangeValue, this);
    this.handleRemoveValue = bind(this.handleRemoveValue, this);
    LocalizedStringEditorComp.__super__.constructor.call(this, props);
    this.state = {
      selectedLanguageCode: "en"
    };
  }

  LocalizedStringEditorComp.propTypes = {
    value: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    availableLanguages: PropTypes.array,
    readonly: PropTypes.bool,
    multiline: PropTypes.bool
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
    return R('div', {
      className: "input-group"
    }, this.props.multiline ? R('textarea', {
      className: "form-control",
      rows: 5,
      onChange: this.handleChangeValue,
      value: currentText,
      placeholder: placeholder
    }) : R('input', {
      type: "text",
      className: "form-control",
      onChange: this.handleChangeValue,
      value: currentText,
      placeholder: placeholder
    }), R('div', {
      className: "input-group-btn"
    }, R('button', {
      type: "button",
      className: "btn btn-default dropdown-toggle",
      "data-toggle": "dropdown"
    }, this.state.selectedLanguageCode, " ", R('span', {
      className: "caret"
    })), R('ul', {
      className: "dropdown-menu"
    }, _.map(availableLanguages, (function(_this) {
      return function(availableLanguage) {
        return R('li', {
          key: availableLanguage.id
        }, R('a', {
          onClick: _this.onLanguageSelectionClick.bind(null, availableLanguage.id)
        }, availableLanguage.name));
      };
    })(this)))));
  };

  return LocalizedStringEditorComp;

})(React.Component);
