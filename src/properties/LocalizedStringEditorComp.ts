import _ from "lodash"
import { LocalizedString } from "mwater-expressions"
import React from "react"
const R = React.createElement

export interface LocalizedStringEditorCompProps {
  value?: LocalizedString
  onChange: (str: LocalizedString) => void
  availableLanguages?: Array<{ id: string; name: string }>
  readonly?: boolean
  multiline?: boolean
  placeholder?: string
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
    const names = _.clone(this.props.value || {}) as any
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
    else {
      placeholder = this.props.placeholder
    }

    const availableLanguages = this.props.availableLanguages || [
      { id: "en", name: "English" },
      { id: "fr", name: "Français" },
      { id: "es", name: "Español" },
      { id: "pt", name: "Português" },
      { id: "sw", name: "Kiswahili" },
      { id: "tet", name: "Tetum" },
      { id: "id", name: "Bahasa Indonesia" },
      { id: "ht", name: "Créole Haïtien" },
      { id: "my", name: "Burmese" },
      { id: "km", name: "Khmer" },
      { id: "am", name: "Amharic" },
      { id: "hi", name: "Hindi" },
      { id: "bn", name: "Bangla" },
      { id: "rw", name: "Kinyarwanda" },
      { id: "ne", name: "Nepali" },
      { id: "sd", name: "Sindhi" },
      { id: "ur", name: "Urdu" },
      { id: "so", name: "Somali" },
      { id: "de", name: "German" },
      { id: "it", name: "Italian" },
      { id: "ja", name: "Japanese" }
    ]

    return R(
      "div",
      { className: "input-group" },
      this.props.multiline
        ? R("textarea", {
            className: "form-control",
            rows: 5,
            onChange: this.handleChangeValue,
            value: currentText || "",
            placeholder
          })
        : R("input", {
            type: "text",
            className: "form-control",
            onChange: this.handleChangeValue,
            value: currentText || "",
            placeholder
          }),

      R(
        "button",
        { type: "button", className: "btn btn-secondary dropdown-toggle", "data-bs-toggle": "dropdown" },
        this.state.selectedLanguageCode
      ),

      R(
        "ul",
        { className: "dropdown-menu dropdown-menu-end" },
        R("li", { className: "dropdown-header" }, "Select Language to Edit"),
        _.map(availableLanguages, (availableLanguage) => {
          return R(
            "li",
            null,
            R(
              "a",
              { className: "dropdown-item", onClick: this.onLanguageSelectionClick.bind(null, availableLanguage.id) },
              availableLanguage.name
            )
          )
        })
      )
    )
  }
}
