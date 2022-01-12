import PropTypes from "prop-types"
import React from "react"
const R = React.createElement

interface LocalizedStringComponentProps {
  value?: any
}

// Displays a localized string (_base: "en", en: "apple", fr: "pomme", etc)
export default class LocalizedStringComponent extends React.Component<LocalizedStringComponentProps> {
  render() {
    if (this.props.value) {
      return R("span", null, this.props.value[this.props.value._base || "en"])
    } else {
      return null
    }
  }
}
