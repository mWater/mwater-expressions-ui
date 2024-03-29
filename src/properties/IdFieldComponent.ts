import PropTypes from "prop-types"
import React from "react"
const R = React.createElement
import _ from "lodash"
import * as ui from "react-library/lib/bootstrap"

interface IdFieldComponentProps {
  /** The value */
  value?: string
  onChange: any
}

export default class IdFieldComponent extends React.Component<IdFieldComponentProps> {
  isValid = (string: any) => {
    return /^[a-z][a-z_0-9]*$/.test(string)
  }

  handleChange = (ev: any) => {
    return this.props.onChange(ev.target.value)
  }

  render() {
    return R(
      ui.FormGroup,
      { label: "ID" },
      R("input", {
        type: "text",
        className: "form-control",
        value: this.props.value || "",
        onChange: this.handleChange
      }),
      R("div", { className: "form-text text-muted" }, "Lowercase, numbers and underscores")
    )
  }
}
