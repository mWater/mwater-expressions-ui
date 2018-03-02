var H, LocalizedStringEditorComp, PropTypes, React,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

PropTypes = require('prop-types');

React = require('react');

H = React.DOM;

// Edits a localized string (_base: "en", en: "fsdfasd", fr: "wersdf", etc)
module.exports = LocalizedStringEditorComp = (function() {
  class LocalizedStringEditorComp extends React.Component {
    constructor(props) {
      super(props);
      this.handleRemoveValue = this.handleRemoveValue.bind(this);
      this.handleChangeValue = this.handleChangeValue.bind(this);
      this.onLanguageSelectionClick = this.onLanguageSelectionClick.bind(this);
      this.state = {
        selectedLanguageCode: "en"
      };
    }

    handleRemoveValue() {
      var names;
      boundMethodCheck(this, LocalizedStringEditorComp);
      names = _.clone(this.props.value);
      delete names[this.state.selectedLanguageCode];
      return this.props.onChange(names);
    }

    handleChangeValue(ev) {
      var currentValue, names, newValue;
      boundMethodCheck(this, LocalizedStringEditorComp);
      if (this.props.readonly) {
        return;
      }
      newValue = ev.target.value;
      currentValue = this.props.value && this.props.value[this.state.selectedLanguageCode];
      // If there is currently a value for that language code
      if ((currentValue != null) && currentValue !== "") {
        // If the text field is empty
        if ((newValue == null) || newValue === "") {
          // Remove that entry
          this.handleRemoveValue();
          return;
        }
      }
      // Fire change
      names = _.clone(this.props.value || {
        _base: "en"
      });
      names[this.state.selectedLanguageCode] = newValue;
      if (!names._base) {
        names._base = this.state.selectedLanguageCode;
      }
      return this.props.onChange(names);
    }

    onLanguageSelectionClick(languageCode) {
      boundMethodCheck(this, LocalizedStringEditorComp);
      return this.setState({
        selectedLanguageCode: languageCode
      });
    }

    render() {
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
        },
        {
          id: "fr",
          name: "fr"
        },
        {
          id: "es",
          name: "es"
        },
        {
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
      }, _.map(availableLanguages, (availableLanguage) => {
        return H.li({
          key: availableLanguage.id
        }, H.a({
          onClick: this.onLanguageSelectionClick.bind(null, availableLanguage.id)
        }, availableLanguage.name));
      }))));
    }

  };

  LocalizedStringEditorComp.propTypes = {
    value: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    availableLanguages: PropTypes.array, // Contains id and name of languages
    readonly: PropTypes.bool,
    multiline: PropTypes.bool // True to allow multiple lines
  };

  return LocalizedStringEditorComp;

}).call(this);
