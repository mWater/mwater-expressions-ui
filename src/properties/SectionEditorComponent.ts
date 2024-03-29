import PropTypes from "prop-types"
import React from "react"
const R = React.createElement
import _ from "lodash"
import * as ui from "react-library/lib/bootstrap"
import LocalizedStringEditorComp from "./LocalizedStringEditorComp"
import IdFieldComponent from "./IdFieldComponent"

interface SectionEditorComponentProps {
  /** The property being edited */
  property: any
  /** Function called when anything is changed in the editor */
  onChange: any
  /** Features to be enabled apart from the default features */
  features?: any
}

// edit section
export default class SectionEditorComponent extends React.Component<SectionEditorComponentProps> {
  static defaultProps = { features: [] }

  render() {
    let value, ev
    return R(
      "div",
      null,
      // todo: validate id
      // Sections need an id
      (() => {
        if (_.includes(this.props.features, "idField")) {
          R(IdFieldComponent, {
            value: this.props.property.id,
            onChange: (value: any) => this.props.onChange(_.extend({}, this.props.property, { id: value }))
          })
          return R(
            ui.FormGroup,
            { label: "ID" },
            R("input", {
              type: "text",
              className: "form-control",
              value: this.props.property.id,
              onChange: (ev: any) => this.props.onChange(_.extend({}, this.props.property, { id: ev.target.value }))
            }),
            R(
              "div",
              { className: "form-text text-muted" },
              "Letters lowercase, numbers and _ only. No spaces or uppercase"
            )
          )
        }
        return null
      })(),
      _.includes(this.props.features, "code")
        ? R(
            ui.FormGroup,
            { label: "Code" },
            R("input", {
              type: "text",
              className: "form-control",
              value: this.props.property.code,
              onChange: (ev: any) => this.props.onChange(_.extend({}, this.props.property, { code: ev.target.value }))
            })
          )
        : undefined,
      R(
        ui.FormGroup,
        { label: "Name" },
        R(LocalizedStringEditorComp, {
          value: this.props.property.name,
          onChange: (value: any) => this.props.onChange(_.extend({}, this.props.property, { name: value }))
        })
      ),
      R(
        ui.FormGroup,
        { label: "Description" },
        R(LocalizedStringEditorComp, {
          value: this.props.property.desc,
          onChange: (value: any) => this.props.onChange(_.extend({}, this.props.property, { desc: value }))
        })
      )
    )
  }
}
