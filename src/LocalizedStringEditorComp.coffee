_ = require 'lodash'
PropTypes = require('prop-types')
React = require 'react'
R = React.createElement

# Edits a localized string (_base: "en", en: "fsdfasd", fr: "wersdf", etc)
module.exports = class LocalizedStringEditorComp extends React.Component 
  constructor: (props) ->
    super(props)
    @state = { selectedLanguageCode: "en" }

  @propTypes: 
    value: PropTypes.object
    onChange: PropTypes.func.isRequired
    availableLanguages: PropTypes.array # Contains id and name of languages
    readonly: PropTypes.bool
    multiline: PropTypes.bool  # True to allow multiple lines
  

  handleRemoveValue: =>
    names = _.clone(@props.value)
    delete names[@state.selectedLanguageCode]
    @props.onChange(names)

  handleChangeValue: (ev) =>
    if @props.readonly
      return
      
    newValue = ev.target.value
    currentValue = @props.value and @props.value[@state.selectedLanguageCode]

    # If there is currently a value for that language code
    if currentValue? and currentValue != ""
      # If the text field is empty
      if not newValue? or newValue == ""
        # Remove that entry
        @handleRemoveValue()
        return

    # Fire change
    names = _.clone(@props.value or { _base: "en" })
    names[@state.selectedLanguageCode] = newValue
    if not names._base
      names._base = @state.selectedLanguageCode
    @props.onChange(names)

  onLanguageSelectionClick: (languageCode) =>
    @setState({selectedLanguageCode: languageCode})

  render: ->
    if @props.value
      currentText = @props.value[@state.selectedLanguageCode]

      placeholder = null
      if @state.selectedLanguageCode != @props.value._base
        placeholder = @props.value[@props.value._base]

    availableLanguages = @props.availableLanguages or [
      { id: "en", name: "en" }
      { id: "fr", name: "fr" }
      { id: "es", name: "es" }
      { id: "pt", name: "pt" }
      { id: "tet", name: "tet"}
      { id: "ht", name: "ht"}
    ]

    return R 'div', {className:"input-group"},
      if @props.multiline
        R 'textarea', { className: "form-control", rows: 5, onChange: @handleChangeValue, value: currentText, placeholder: placeholder }
      else
        R 'input', { type: "text", className: "form-control", onChange: @handleChangeValue, value: currentText, placeholder: placeholder }

      R 'div', {className: "input-group-btn"},
        R 'button', {type: "button", className: "btn btn-default dropdown-toggle", "data-toggle": "dropdown"},
          @state.selectedLanguageCode
          " "
          R 'span', {className: "caret"}
        
        R 'ul', {className: "dropdown-menu"},
          _.map availableLanguages, (availableLanguage) =>
            R 'li', key: availableLanguage.id,
              R 'a', onClick: @onLanguageSelectionClick.bind(null, availableLanguage.id),
                availableLanguage.name
