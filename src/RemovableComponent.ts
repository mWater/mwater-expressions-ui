import PropTypes from "prop-types"
import React from "react"
const R = React.createElement

interface RemovableComponentProps {
  onRemove?: any
}

// Component with a remove x to the right
export default class RemovableComponent extends React.Component<RemovableComponentProps> {
  render() {
    return R(
      "div",
      { style: { display: "flex" }, className: "hover-display-parent" },
      R("div", { style: { flex: "1 1 auto" } }, this.props.children),
      this.props.onRemove
        ? R(
            "div",
            { style: { flex: "0 0 auto", alignSelf: "center" }, className: "hover-display-child" },
            R(
              "a",
              {
                onClick: this.props.onRemove,
                style: { fontSize: "80%", cursor: "pointer", marginLeft: 5, color: "var(--bs-primary)" }
              },
              R("i", { className: "fa fa-remove" })
            )
          )
        : undefined
    )
  }
}
