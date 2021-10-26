import _ from "lodash"
import PropTypes from "prop-types"
import React from "react"
const R = React.createElement

interface LocalizedStringEditorCompProps {
  value?: any
  onChange: any
  /** Contains id and name of languages */
  availableLanguages?: any
  readonly?: boolean
  multiline?: boolean
}

interface LocalizedStringEditorCompState {
  selectedLanguageCode: any
}

// Edits a localized string (_base: "en", en: "fsdfasd", fr: "wersdf", etc)
export default class LocalizedStringEditorComp extends React.Component<
  LocalizedStringEditorCompProps,
  LocalizedStringEditorCompState
> {
  constructor(props: any) {
    super(props)
    this.state = { selectedLanguageCode: "en" } // True to allow multiple lines
  }

  handleRemoveValue = () => {
    const names = _.clone(this.props.value)
    delete names[this.state.selectedLanguageCode]
    return this.props.onChange(names)
  }

  handleChangeValue = (ev: any) => {
    if (this.props.readonly) {
      return
    }

    const newValue = ev.target.value
    const currentValue = this.props.value && this.props.value[this.state.selectedLanguageCode]

    // If there is currently a value for that language code
    if (currentValue != null && currentValue !== "") {
      // If the text field is empty
      if (newValue == null || newValue === "") {
        // Remove that entry
        this.handleRemoveValue()
        return
      }
    }

    // Fire change
    const names = _.clone(this.props.value || { _base: "en" })
    names[this.state.selectedLanguageCode] = newValue
    if (!names._base) {
      names._base = this.state.selectedLanguageCode
    }
    return this.props.onChange(names)
  }

  onLanguageSelectionClick = (languageCode: any) => {
    return this.setState({ selectedLanguageCode: languageCode })
  }

  render() {
    let currentText, placeholder
    if (this.props.value) {
      currentText = this.props.value[this.state.selectedLanguageCode]

      placeholder = null
      if (this.state.selectedLanguageCode !== this.props.value._base) {
        placeholder = this.props.value[this.props.value._base]
      }
    }

    const availableLanguages = this.props.availableLanguages || [
      { id: "en", name: "en" },
      { id: "fr", name: "fr" },
      { id: "es", name: "es" },
      { id: "pt", name: "pt" },
      { id: "tet", name: "tet" },
      { id: "ht", name: "ht" }
    ]

    return R(
      "div",
      { className: "input-group" },
      this.props.multiline
        ? R("textarea", {
            className: "form-control",
            rows: 5,
            onChange: this.handleChangeValue,
            value: currentText,
            placeholder
          })
        : R("input", {
            type: "text",
            className: "form-control",
            onChange: this.handleChangeValue,
            value: currentText,
            placeholder
          }),

      R(
        "div",
        { className: "" },
        R(
          "button",
          { type: "button", className: "btn btn-secondary dropdown-toggle", "data-toggle": "dropdown" },
          this.state.selectedLanguageCode
        ),

        R(
          "ul",
          { className: "dropdown-menu" },
          _.map(availableLanguages, (availableLanguage) => {
            return R(
              "li",
              { key: availableLanguage.id },
              R(
                "a",
                { onClick: this.onLanguageSelectionClick.bind(null, availableLanguage.id) },
                availableLanguage.name
              )
            )
          })
        )
      )
    )
  }
}
