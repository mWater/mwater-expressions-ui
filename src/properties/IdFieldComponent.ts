// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let IdFieldComponent
import PropTypes from "prop-types"
import React from "react"
const R = React.createElement
import _ from "lodash"
import ui from "react-library/lib/bootstrap"

export default IdFieldComponent = (function () {
  IdFieldComponent = class IdFieldComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        value: PropTypes.string, // The value
        onChange: PropTypes.func.isRequired
      }
      // Called with new value
    }

    isValid = (string) => {
      return /^[a-z][a-z_0-9]*$/.test(string)
    }

    handleChange = (ev) => {
      return this.props.onChange(ev.target.value)
    }

    render() {
      return R(
        ui.FormGroup,
        { label: "ID", hasWarnings: !this.isValid(this.props.value) },
        R("input", {
          type: "text",
          className: "form-control",
          value: this.props.value || "",
          onChange: this.handleChange
        }),
        R("p", { className: "help-block" }, "Lowercase, numbers and underscores")
      )
    }
  }
  IdFieldComponent.initClass()
  return IdFieldComponent
})()
