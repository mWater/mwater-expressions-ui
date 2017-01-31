var PropertyListEditorComponent, R, React, uuid,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

R = React.createElement;

uuid = require('uuid');

PropertyListEditorComponent = require('./PropertyListEditorComponent');

module.exports = function(WrappedComponent) {
  var NestedListClipboardEnhancement;
  return NestedListClipboardEnhancement = (function(superClass) {
    extend(NestedListClipboardEnhancement, superClass);

    NestedListClipboardEnhancement.childContextTypes = {
      clipboard: React.PropTypes.object
    };

    function NestedListClipboardEnhancement(props) {
      this.getChildContext = bind(this.getChildContext, this);
      this.handlePaste = bind(this.handlePaste, this);
      this.paste = bind(this.paste, this);
      this.cut = bind(this.cut, this);
      this.handlePasteInto = bind(this.handlePasteInto, this);
      this.handleCopy = bind(this.handleCopy, this);
      this.findItemById = bind(this.findItemById, this);
      this.handleCut = bind(this.handleCut, this);
      NestedListClipboardEnhancement.__super__.constructor.call(this, props);
      this.state = {
        clipboard: null
      };
    }

    NestedListClipboardEnhancement.prototype.handleCut = function(listId, itemId) {
      return this.handleCopy(listId, itemId, true);
    };

    NestedListClipboardEnhancement.prototype.findItemById = function(listId, itemId) {
      var find, found, list, value;
      value = _.cloneDeep(this.props.properties);
      list = _.find(value, {
        id: itemId
      });
      if (list) {
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
      return find(listId, itemId, _.filter(value, {
        type: "section"
      }));
    };

    NestedListClipboardEnhancement.prototype.handleCopy = function(listId, itemId, cut) {
      var property;
      if (cut == null) {
        cut = false;
      }
      property = this.findItemById(listId, itemId);
      if (!cut) {
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
    };

    NestedListClipboardEnhancement.prototype.handlePasteInto = function(listId, itemId) {
      var cutIndex, didCut, didPaste, pasteIndex, pasteInto, value;
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
        id: itemId
      });
      if (pasteIndex > -1) {
        if (!value[pasteIndex].contents) {
          value[pasteIndex].contents = [];
        }
        value[pasteIndex].contents.push(this.state.clipboard.property);
        didPaste = true;
      } else {
        pasteInto = (function(_this) {
          return function(listId, itemId, items) {
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
                property.contents[pasteIndex].contents.push(_this.state.clipboard.property);
                results.push(didPaste = true);
              } else {
                results.push(didPaste = pasteInto(listId, itemId, _.filter(property.contents, {
                  type: "section"
                })));
              }
            }
            return results;
          };
        })(this);
        pasteInto(listId, itemId, _.filter(value, {
          type: "section"
        }));
      }
      if (didPaste) {
        if (this.state.clipboard.cut && !didCut) {
          return;
        }
        this.setState({
          clipboard: null
        });
        return this.props.onChange(value);
      }
    };

    NestedListClipboardEnhancement.prototype.cut = function(listId, itemId, items) {
      var cutIndex, didCut, i, len, property;
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
    };

    NestedListClipboardEnhancement.prototype.paste = function(listId, itemId, items) {
      var didPaste, i, len, pasteIndex, property;
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
    };

    NestedListClipboardEnhancement.prototype.handlePaste = function(listId, itemId) {
      var cutIndex, didCut, didPaste, pasteIndex, value;
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
        id: itemId
      });
      if (pasteIndex > -1) {
        value.splice(pasteIndex, 0, this.state.clipboard.property);
        didPaste = true;
      } else {
        didPaste = this.paste(listId, itemId, _.filter(value, {
          type: "section"
        }));
      }
      if (didPaste) {
        if (this.state.clipboard.cut && !didCut) {
          return;
        }
        this.setState({
          clipboard: null
        });
        return this.props.onChange(value);
      }
    };

    NestedListClipboardEnhancement.prototype.getChildContext = function() {
      return {
        clipboard: this.state.clipboard
      };
    };

    NestedListClipboardEnhancement.prototype.render = function() {
      var newProps;
      newProps = {
        onCut: this.handleCut,
        onCopy: this.handleCopy,
        onPaste: this.handlePaste,
        onPasteInto: this.handlePasteInto
      };
      return R(WrappedComponent, _.assign({}, this.props, newProps));
    };

    return NestedListClipboardEnhancement;

  })(React.Component);
};
