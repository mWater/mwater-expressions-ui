// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let LocalizedStringEditorComp;
import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
const R = React.createElement;

// Edits a localized string (_base: "en", en: "fsdfasd", fr: "wersdf", etc)
export default LocalizedStringEditorComp = (function() {
  LocalizedStringEditorComp = class LocalizedStringEditorComp extends React.Component {
    static initClass() {
  
      this.propTypes = { 
        value: PropTypes.object,
        onChange: PropTypes.func.isRequired,
        availableLanguages: PropTypes.array, // Contains id and name of languages
        readonly: PropTypes.bool,
        multiline: PropTypes.bool
      }; 
    }
    constructor(props) {
      super(props);
      this.state = { selectedLanguageCode: "en" };  // True to allow multiple lines
    }


    handleRemoveValue = () => {
      const names = _.clone(this.props.value);
      delete names[this.state.selectedLanguageCode];
      return this.props.onChange(names);
    };

    handleChangeValue = ev => {
      if (this.props.readonly) {
        return;
      }
      
      const newValue = ev.target.value;
      const currentValue = this.props.value && this.props.value[this.state.selectedLanguageCode];

      // If there is currently a value for that language code
      if ((currentValue != null) && (currentValue !== "")) {
        // If the text field is empty
        if ((newValue == null) || (newValue === "")) {
          // Remove that entry
          this.handleRemoveValue();
          return;
        }
      }

      // Fire change
      const names = _.clone(this.props.value || { _base: "en" });
      names[this.state.selectedLanguageCode] = newValue;
      if (!names._base) {
        names._base = this.state.selectedLanguageCode;
      }
      return this.props.onChange(names);
    };

    onLanguageSelectionClick = languageCode => {
      return this.setState({selectedLanguageCode: languageCode});
    };

    render() {
      let currentText, placeholder;
      if (this.props.value) {
        currentText = this.props.value[this.state.selectedLanguageCode];

        placeholder = null;
        if (this.state.selectedLanguageCode !== this.props.value._base) {
          placeholder = this.props.value[this.props.value._base];
        }
      }

      const availableLanguages = this.props.availableLanguages || [
        { id: "en", name: "en" },
        { id: "fr", name: "fr" },
        { id: "es", name: "es" },
        { id: "pt", name: "pt" },
        { id: "tet", name: "tet"},
        { id: "ht", name: "ht"}
      ];

      return R('div', {className:"input-group"},
        this.props.multiline ?
          R('textarea', { className: "form-control", rows: 5, onChange: this.handleChangeValue, value: currentText, placeholder })
        :
          R('input', { type: "text", className: "form-control", onChange: this.handleChangeValue, value: currentText, placeholder }),

        R('div', {className: "input-group-btn"},
          R('button', {type: "button", className: "btn btn-default dropdown-toggle", "data-toggle": "dropdown"},
            this.state.selectedLanguageCode,
            " ",
            R('span', {className: "caret"})),
        
          R('ul', {className: "dropdown-menu"},
            _.map(availableLanguages, availableLanguage => {
              return R('li', {key: availableLanguage.id},
                R('a', {onClick: this.onLanguageSelectionClick.bind(null, availableLanguage.id)},
                  availableLanguage.name)
              );
            })
          )
        )
      );
    }
  };
  LocalizedStringEditorComp.initClass();
  return LocalizedStringEditorComp;
})();
