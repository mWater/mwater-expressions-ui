"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var PropTypes,
    R,
    React,
    _,
    uuid,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

_ = require('lodash');
PropTypes = require('prop-types');
React = require('react');
R = React.createElement;
uuid = require('uuid'); // A wrapper for nested list for property editor
// The problem with nested list is that the the item component will need to render the list component
// passing back all the required props. Also, the events in the nensted list would need to 
// be propagated back to the all the parent nodes.  
// What this HOC does is to wrap the outermost list node, which will eventually handle the cut/copy/paste
// operation for the entire tree, so the children and nested nodes will just get the 
// cut/copy/paste handlers provided by this one.
// Also exposes a clipboard context, which can be accessed by the child nodes.

module.exports = function (WrappedComponent) {
  var NestedListClipboardEnhancement;
  return NestedListClipboardEnhancement = function () {
    var NestedListClipboardEnhancement = /*#__PURE__*/function (_React$Component) {
      (0, _inherits2["default"])(NestedListClipboardEnhancement, _React$Component);

      var _super = _createSuper(NestedListClipboardEnhancement);

      function NestedListClipboardEnhancement(props) {
        var _this;

        (0, _classCallCheck2["default"])(this, NestedListClipboardEnhancement);
        _this = _super.call(this, props);
        _this.handleCut = _this.handleCut.bind((0, _assertThisInitialized2["default"])(_this));
        _this.findItemById = _this.findItemById.bind((0, _assertThisInitialized2["default"])(_this));
        _this.handleCopy = _this.handleCopy.bind((0, _assertThisInitialized2["default"])(_this));
        _this.handlePasteInto = _this.handlePasteInto.bind((0, _assertThisInitialized2["default"])(_this));
        _this.cut = _this.cut.bind((0, _assertThisInitialized2["default"])(_this));
        _this.paste = _this.paste.bind((0, _assertThisInitialized2["default"])(_this));
        _this.handlePaste = _this.handlePaste.bind((0, _assertThisInitialized2["default"])(_this));
        _this.getChildContext = _this.getChildContext.bind((0, _assertThisInitialized2["default"])(_this));
        _this.state = {
          clipboard: null
        };
        return _this;
      }

      (0, _createClass2["default"])(NestedListClipboardEnhancement, [{
        key: "handleCut",
        value: function handleCut(listId, itemId) {
          boundMethodCheck(this, NestedListClipboardEnhancement);
          return this.handleCopy(listId, itemId, true);
        }
      }, {
        key: "findItemById",
        value: function findItemById(listId, itemId) {
          var _find, found, list, value;

          boundMethodCheck(this, NestedListClipboardEnhancement);
          value = _.cloneDeep(this.props.properties);
          list = _.find(value, {
            id: itemId
          });

          if (list) {
            // check in the root array first
            return list;
          }

          found = null;

          _find = function find(listId, itemId, items) {
            var i, len, property;

            for (i = 0, len = items.length; i < len; i++) {
              property = items[i];

              if (property.id === listId) {
                return _.find(property.contents, {
                  id: itemId
                });
              } else {
                found = _find(listId, itemId, _.filter(property.contents, {
                  type: "section"
                }));

                if (found) {
                  return found;
                }
              }
            }
          }; // if not root then only iterate through section type properties


          return _find(listId, itemId, _.filter(value, {
            type: "section"
          }));
        }
      }, {
        key: "handleCopy",
        value: function handleCopy(listId, itemId) {
          var cut = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
          var property;
          boundMethodCheck(this, NestedListClipboardEnhancement);
          property = this.findItemById(listId, itemId); // Only change id if copy

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
      }, {
        key: "handlePasteInto",
        value: function handlePasteInto(listId, itemId) {
          var _this2 = this;

          var cutIndex, didCut, didPaste, pasteIndex, _pasteInto, value;

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
            _pasteInto = function pasteInto(listId, itemId, items) {
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

                  property.contents[pasteIndex].contents.push(_this2.state.clipboard.property);
                  results.push(didPaste = true);
                } else {
                  results.push(didPaste = _pasteInto(listId, itemId, _.filter(property.contents, {
                    type: "section"
                  })));
                }
              }

              return results;
            };

            _pasteInto(listId, itemId, _.filter(value, {
              type: "section"
            }));
          } // Dont update state untill all required operations are successfull
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
      }, {
        key: "cut",
        value: function cut(listId, itemId, items) {
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
      }, {
        key: "paste",
        value: function paste(listId, itemId, items) {
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
      }, {
        key: "handlePaste",
        value: function handlePaste(listId, itemId) {
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
          } // Dont update state untill all required operations are successfull
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
      }, {
        key: "getChildContext",
        value: function getChildContext() {
          boundMethodCheck(this, NestedListClipboardEnhancement);
          return {
            clipboard: this.state.clipboard
          };
        }
      }, {
        key: "render",
        value: function render() {
          var newProps;
          newProps = {
            onCut: this.handleCut,
            onCopy: this.handleCopy,
            onPaste: this.handlePaste,
            onPasteInto: this.handlePasteInto
          }; // Inject cut/copy/paste/pasteInto handlers and render the outermost list component

          return R(WrappedComponent, _.assign({}, this.props, newProps));
        }
      }]);
      return NestedListClipboardEnhancement;
    }(React.Component);

    ;
    NestedListClipboardEnhancement.childContextTypes = {
      clipboard: PropTypes.object // Clipboard accessible to the children

    };
    return NestedListClipboardEnhancement;
  }.call(this);
};