"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var LocalizedStringEditorComp,
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
R = React.createElement; // Edits a localized string (_base: "en", en: "fsdfasd", fr: "wersdf", etc)

module.exports = LocalizedStringEditorComp = function () {
  var LocalizedStringEditorComp =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2.default)(LocalizedStringEditorComp, _React$Component);

    function LocalizedStringEditorComp(props) {
      var _this;

      (0, _classCallCheck2.default)(this, LocalizedStringEditorComp);
      _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(LocalizedStringEditorComp).call(this, props));
      _this.handleRemoveValue = _this.handleRemoveValue.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleChangeValue = _this.handleChangeValue.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.onLanguageSelectionClick = _this.onLanguageSelectionClick.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.state = {
        selectedLanguageCode: "en"
      };
      return _this;
    }

    (0, _createClass2.default)(LocalizedStringEditorComp, [{
      key: "handleRemoveValue",
      value: function handleRemoveValue() {
        var names;
        boundMethodCheck(this, LocalizedStringEditorComp);
        names = _.clone(this.props.value);
        delete names[this.state.selectedLanguageCode];
        return this.props.onChange(names);
      }
    }, {
      key: "handleChangeValue",
      value: function handleChangeValue(ev) {
        var currentValue, names, newValue;
        boundMethodCheck(this, LocalizedStringEditorComp);

        if (this.props.readonly) {
          return;
        }

        newValue = ev.target.value;
        currentValue = this.props.value && this.props.value[this.state.selectedLanguageCode]; // If there is currently a value for that language code

        if (currentValue != null && currentValue !== "") {
          // If the text field is empty
          if (newValue == null || newValue === "") {
            // Remove that entry
            this.handleRemoveValue();
            return;
          }
        } // Fire change


        names = _.clone(this.props.value || {
          _base: "en"
        });
        names[this.state.selectedLanguageCode] = newValue;

        if (!names._base) {
          names._base = this.state.selectedLanguageCode;
        }

        return this.props.onChange(names);
      }
    }, {
      key: "onLanguageSelectionClick",
      value: function onLanguageSelectionClick(languageCode) {
        boundMethodCheck(this, LocalizedStringEditorComp);
        return this.setState({
          selectedLanguageCode: languageCode
        });
      }
    }, {
      key: "render",
      value: function render() {
        var _this2 = this;

        var availableLanguages, currentText, placeholder;

        if (this.props.value) {
          currentText = this.props.value[this.state.selectedLanguageCode];
          placeholder = null;

          if (this.state.selectedLanguageCode !== this.props.value._base) {
            placeholder = this.props.value[this.props.value._base];
          }
        }

        availableLanguages = this.props.availableLanguages || [{
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
        }, {
          id: "tet",
          name: "tet"
        }, {
          id: "ht",
          name: "ht"
        }];
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
        }, _.map(availableLanguages, function (availableLanguage) {
          return R('li', {
            key: availableLanguage.id
          }, R('a', {
            onClick: _this2.onLanguageSelectionClick.bind(null, availableLanguage.id)
          }, availableLanguage.name));
        }))));
      }
    }]);
    return LocalizedStringEditorComp;
  }(React.Component);

  ;
  LocalizedStringEditorComp.propTypes = {
    value: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    availableLanguages: PropTypes.array,
    // Contains id and name of languages
    readonly: PropTypes.bool,
    multiline: PropTypes.bool // True to allow multiple lines

  };
  return LocalizedStringEditorComp;
}.call(void 0);