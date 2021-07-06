// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let RemovableComponent
import PropTypes from "prop-types"
import React from "react"
const R = React.createElement

// Component with a remove x to the right
export default RemovableComponent = (function () {
  RemovableComponent = class RemovableComponent extends React.Component {
    static initClass() {
      this.propTypes = { onRemove: PropTypes.func }
      // Pass to put a remove link on right of specified item
    }

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
                { onClick: this.props.onRemove, style: { fontSize: "80%", cursor: "pointer", marginLeft: 5 } },
                R("i", { className: "fa fa-remove" })
              )
            )
          : undefined
      )
    }
  }
  RemovableComponent.initClass()
  return RemovableComponent
})()
