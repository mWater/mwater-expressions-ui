// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
import _ from "lodash"
import PropTypes from "prop-types"
import React from "react"
const R = React.createElement
import uuid from "uuid"

// A wrapper for nested list for property editor
//
// The problem with nested list is that the the item component will need to render the list component
// passing back all the required props. Also, the events in the nensted list would need to
// be propagated back to the all the parent nodes.
//
// What this HOC does is to wrap the outermost list node, which will eventually handle the cut/copy/paste
// operation for the entire tree, so the children and nested nodes will just get the
// cut/copy/paste handlers provided by this one.
//
// Also exposes a clipboard context, which can be accessed by the child nodes.
//
export default function (WrappedComponent) {
  let NestedListClipboardEnhancement
  return (NestedListClipboardEnhancement = (function () {
    NestedListClipboardEnhancement = class NestedListClipboardEnhancement extends React.Component {
      static initClass() {
        this.childContextTypes = { clipboard: PropTypes.object }
        // Clipboard accessible to the children
      }

      constructor(props) {
        super(props)
        this.state = {
          clipboard: null
        }
      }

      handleCut = (listId, itemId) => {
        return this.handleCopy(listId, itemId, true)
      }

      findItemById = (listId, itemId) => {
        const value = _.cloneDeep(this.props.properties)
        const list = _.find(value, { id: itemId })

        if (list) {
          // check in the root array first
          return list
        }

        let found = null

        function find(listId, itemId, items) {
          for (let property of items) {
            if (property.id === listId) {
              return _.find(property.contents, { id: itemId })
            } else {
              found = find(listId, itemId, _.filter(property.contents, { type: "section" }))
              if (found) {
                return found
              }
            }
          }
        }

        // if not root then only iterate through section type properties
        return find(listId, itemId, _.filter(value, { type: "section" }))
      }

      handleCopy = (listId, itemId, cut = false) => {
        const property = this.findItemById(listId, itemId)

        // Only change id if copy
        if (!cut) {
          // Id is used as key, so the id needs to be regenerated
          if (this.props.propertyIdGenerator) {
            property.id = this.props.propertyIdGenerator()
          } else {
            property.id = uuid.v4().split("-")[0]
          }
        }

        return this.setState({
          clipboard: {
            listId,
            itemId,
            property,
            cut
          }
        })
      }

      handlePasteInto = (listId, itemId) => {
        if (!this.state.clipboard) {
          return
        }

        const value = _.cloneDeep(this.props.properties)
        let didPaste = false
        let didCut = false

        if (this.state.clipboard.cut) {
          const cutIndex = _.findIndex(value, { id: this.state.clipboard.itemId })

          if (cutIndex > -1) {
            _.pullAt(value, cutIndex)
            didCut = true
          } else {
            didCut = this.cut(
              this.state.clipboard.listId,
              this.state.clipboard.itemId,
              _.filter(value, { type: "section" })
            )
          }
        }

        let pasteIndex = _.findIndex(value, { id: itemId }) // check in the root array first
        if (pasteIndex > -1) {
          if (!value[pasteIndex].contents) {
            value[pasteIndex].contents = []
          }
          value[pasteIndex].contents.push(this.state.clipboard.property)
          didPaste = true
        } else {
          var pasteInto = (listId, itemId, items) => {
            return (() => {
              const result = []
              for (let property of items) {
                if (property.id === listId) {
                  pasteIndex = _.findIndex(property.contents, { id: itemId })
                  if (!property.contents[pasteIndex].contents) {
                    property.contents[pasteIndex].contents = []
                  }
                  property.contents[pasteIndex].contents.push(this.state.clipboard.property)
                  result.push((didPaste = true))
                } else {
                  result.push((didPaste = pasteInto(listId, itemId, _.filter(property.contents, { type: "section" }))))
                }
              }
              return result
            })()
          }
          pasteInto(listId, itemId, _.filter(value, { type: "section" }))
        }

        // Dont update state untill all required operations are successfull
        // Required to avoid the conditions where user would cut and copy an item into its own children
        if (didPaste) {
          if (this.state.clipboard.cut && !didCut) {
            return
          }

          this.setState({ clipboard: null })
          return this.props.onChange(value)
        }
      }

      cut = (listId, itemId, items) => {
        let didCut = false
        for (let property of items) {
          if (property.id === listId) {
            const cutIndex = _.findIndex(property.contents, { id: this.state.clipboard.itemId })
            _.pullAt(property.contents, cutIndex)
            didCut = true
          } else {
            didCut = this.cut(listId, itemId, _.filter(property.contents, { type: "section" }))
          }
        }
        return didCut
      }

      paste = (listId, itemId, items) => {
        let didPaste = false
        for (let property of items) {
          if (property.id === listId) {
            const pasteIndex = _.findIndex(property.contents, { id: itemId })
            property.contents.splice(pasteIndex, 0, this.state.clipboard.property)
            didPaste = true
          } else {
            didPaste = this.paste(listId, itemId, _.filter(property.contents, { type: "section" }))
          }
        }
        return didPaste
      }

      handlePaste = (listId, itemId) => {
        if (!this.state.clipboard) {
          return
        }

        const value = _.cloneDeep(this.props.properties)

        let didPaste = false
        let didCut = false

        if (this.state.clipboard.cut) {
          const cutIndex = _.findIndex(value, { id: this.state.clipboard.itemId })
          if (cutIndex > -1) {
            _.pullAt(value, cutIndex)
            didCut = true
          } else {
            didCut = this.cut(
              this.state.clipboard.listId,
              this.state.clipboard.itemId,
              _.filter(value, { type: "section" })
            )
          }
        }

        const pasteIndex = _.findIndex(value, { id: itemId }) // check in the root array first
        if (pasteIndex > -1) {
          value.splice(pasteIndex, 0, this.state.clipboard.property)
          didPaste = true
        } else {
          didPaste = this.paste(listId, itemId, _.filter(value, { type: "section" }))
        }

        // Dont update state untill all required operations are successfull
        // Required to avoid the conditions where user would cut and copy an item into its own children
        if (didPaste) {
          if (this.state.clipboard.cut && !didCut) {
            return
          }

          this.setState({ clipboard: null })
          return this.props.onChange(value)
        }
      }

      getChildContext = () => {
        return {
          clipboard: this.state.clipboard
        }
      }

      render() {
        const newProps = {
          onCut: this.handleCut,
          onCopy: this.handleCopy,
          onPaste: this.handlePaste,
          onPasteInto: this.handlePasteInto
        }
        // Inject cut/copy/paste/pasteInto handlers and render the outermost list component
        return R(WrappedComponent, _.assign({}, this.props, newProps))
      }
    }
    NestedListClipboardEnhancement.initClass()
    return NestedListClipboardEnhancement
  })())
}
