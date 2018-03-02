var PropTypes, R, React, uuid,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

PropTypes = require('prop-types');

React = require('react');

R = React.createElement;

uuid = require('uuid');

// A wrapper for nested list for property editor

// The problem with nested list is that the the item component will need to render the list component
// passing back all the required props. Also, the events in the nensted list would need to 
// be propagated back to the all the parent nodes.  

// What this HOC does is to wrap the outermost list node, which will eventually handle the cut/copy/paste
// operation for the entire tree, so the children and nested nodes will just get the 
// cut/copy/paste handlers provided by this one.

// Also exposes a clipboard context, which can be accessed by the child nodes.

module.exports = function(WrappedComponent) {
  var NestedListClipboardEnhancement;
  return NestedListClipboardEnhancement = (function() {
    class NestedListClipboardEnhancement extends React.Component {
      constructor(props) {
        super(props);
        this.handleCut = this.handleCut.bind(this);
        this.findItemById = this.findItemById.bind(this);
        this.handleCopy = this.handleCopy.bind(this);
        this.handlePasteInto = this.handlePasteInto.bind(this);
        this.cut = this.cut.bind(this);
        this.paste = this.paste.bind(this);
        this.handlePaste = this.handlePaste.bind(this);
        this.getChildContext = this.getChildContext.bind(this);
        this.state = {
          clipboard: null
        };
      }

      handleCut(listId, itemId) {
        boundMethodCheck(this, NestedListClipboardEnhancement);
        return this.handleCopy(listId, itemId, true);
      }

      findItemById(listId, itemId) {
        var find, found, list, value;
        boundMethodCheck(this, NestedListClipboardEnhancement);
        value = _.cloneDeep(this.props.properties);
        list = _.find(value, {
          id: itemId
        });
        if (list) { // check in the root array first
          return list;
        }
        found = null;
        find = function(listId, itemId, items) {
          var i, len, property;
          for (i = 0, len = items.length; i < len; i++) {
            property = items[i];
            if (property.id === listId) {
              return _.find(property.contents, {
                id: itemId
              });
            } else {
              found = find(listId, itemId, _.filter(property.contents, {
                type: "section"
              }));
              if (found) {
                return found;
              }
            }
          }
        };
        
        // if not root then only iterate through section type properties
        return find(listId, itemId, _.filter(value, {
          type: "section"
        }));
      }

      handleCopy(listId, itemId, cut = false) {
        var property;
        boundMethodCheck(this, NestedListClipboardEnhancement);
        property = this.findItemById(listId, itemId);
        // Only change id if copy
        if (!cut) {
          // Id is used as key, so the id needs to be regenerated
          if (this.props.propertyIdGenerator) {
            property.id = this.props.propertyIdGenerator();
          } else {
            property.id = uuid.v4().split("-")[0];
          }
        }
        return this.setState({
          clipboard: {
            listId: listId,
            itemId: itemId,
            property: property,
            cut: cut
          }
        });
      }

      handlePasteInto(listId, itemId) {
        var cutIndex, didCut, didPaste, pasteIndex, pasteInto, value;
        boundMethodCheck(this, NestedListClipboardEnhancement);
        if (!this.state.clipboard) {
          return;
        }
        value = _.cloneDeep(this.props.properties);
        didPaste = false;
        didCut = false;
        if (this.state.clipboard.cut) {
          cutIndex = _.findIndex(value, {
            id: this.state.clipboard.itemId
          });
          if (cutIndex > -1) {
            _.pullAt(value, cutIndex);
            didCut = true;
          } else {
            didCut = this.cut(this.state.clipboard.listId, this.state.clipboard.itemId, _.filter(value, {
              type: "section"
            }));
          }
        }
        pasteIndex = _.findIndex(value, {
          id: itemId // check in the root array first
        });
        if (pasteIndex > -1) {
          if (!value[pasteIndex].contents) {
            value[pasteIndex].contents = [];
          }
          value[pasteIndex].contents.push(this.state.clipboard.property);
          didPaste = true;
        } else {
          pasteInto = (listId, itemId, items) => {
            var i, len, property, results;
            results = [];
            for (i = 0, len = items.length; i < len; i++) {
              property = items[i];
              if (property.id === listId) {
                pasteIndex = _.findIndex(property.contents, {
                  id: itemId
                });
                if (!property.contents[pasteIndex].contents) {
                  property.contents[pasteIndex].contents = [];
                }
                property.contents[pasteIndex].contents.push(this.state.clipboard.property);
                results.push(didPaste = true);
              } else {
                results.push(didPaste = pasteInto(listId, itemId, _.filter(property.contents, {
                  type: "section"
                })));
              }
            }
            return results;
          };
          pasteInto(listId, itemId, _.filter(value, {
            type: "section"
          }));
        }
        
        // Dont update state untill all required operations are successfull
        // Required to avoid the conditions where user would cut and copy an item into its own children
        if (didPaste) {
          if (this.state.clipboard.cut && !didCut) {
            return;
          }
          this.setState({
            clipboard: null
          });
          return this.props.onChange(value);
        }
      }

      cut(listId, itemId, items) {
        var cutIndex, didCut, i, len, property;
        boundMethodCheck(this, NestedListClipboardEnhancement);
        didCut = false;
        for (i = 0, len = items.length; i < len; i++) {
          property = items[i];
          if (property.id === listId) {
            cutIndex = _.findIndex(property.contents, {
              id: this.state.clipboard.itemId
            });
            _.pullAt(property.contents, cutIndex);
            didCut = true;
          } else {
            didCut = this.cut(listId, itemId, _.filter(property.contents, {
              type: "section"
            }));
          }
        }
        return didCut;
      }

      paste(listId, itemId, items) {
        var didPaste, i, len, pasteIndex, property;
        boundMethodCheck(this, NestedListClipboardEnhancement);
        didPaste = false;
        for (i = 0, len = items.length; i < len; i++) {
          property = items[i];
          if (property.id === listId) {
            pasteIndex = _.findIndex(property.contents, {
              id: itemId
            });
            property.contents.splice(pasteIndex, 0, this.state.clipboard.property);
            didPaste = true;
          } else {
            didPaste = this.paste(listId, itemId, _.filter(property.contents, {
              type: "section"
            }));
          }
        }
        return didPaste;
      }

      handlePaste(listId, itemId) {
        var cutIndex, didCut, didPaste, pasteIndex, value;
        boundMethodCheck(this, NestedListClipboardEnhancement);
        if (!this.state.clipboard) {
          return;
        }
        value = _.cloneDeep(this.props.properties);
        didPaste = false;
        didCut = false;
        if (this.state.clipboard.cut) {
          cutIndex = _.findIndex(value, {
            id: this.state.clipboard.itemId
          });
          if (cutIndex > -1) {
            _.pullAt(value, cutIndex);
            didCut = true;
          } else {
            didCut = this.cut(this.state.clipboard.listId, this.state.clipboard.itemId, _.filter(value, {
              type: "section"
            }));
          }
        }
        pasteIndex = _.findIndex(value, {
          id: itemId // check in the root array first
        });
        if (pasteIndex > -1) {
          value.splice(pasteIndex, 0, this.state.clipboard.property);
          didPaste = true;
        } else {
          didPaste = this.paste(listId, itemId, _.filter(value, {
            type: "section"
          }));
        }
        
        // Dont update state untill all required operations are successfull
        // Required to avoid the conditions where user would cut and copy an item into its own children
        if (didPaste) {
          if (this.state.clipboard.cut && !didCut) {
            return;
          }
          this.setState({
            clipboard: null
          });
          return this.props.onChange(value);
        }
      }

      getChildContext() {
        boundMethodCheck(this, NestedListClipboardEnhancement);
        return {
          clipboard: this.state.clipboard
        };
      }

      render() {
        var newProps;
        newProps = {
          onCut: this.handleCut,
          onCopy: this.handleCopy,
          onPaste: this.handlePaste,
          onPasteInto: this.handlePasteInto
        };
        // Inject cut/copy/paste/pasteInto handlers and render the outermost list component
        return R(WrappedComponent, _.assign({}, this.props, newProps));
      }

    };

    NestedListClipboardEnhancement.childContextTypes = {
      clipboard: PropTypes.object // Clipboard accessible to the children
    };

    return NestedListClipboardEnhancement;

  }).call(this);
};
