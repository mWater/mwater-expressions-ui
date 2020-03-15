"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var ActionCancelModalComponent,
    LocalizedStringComponent,
    NestedListClipboardEnhancement,
    PropTypes,
    PropertyComponent,
    PropertyEditorComponent,
    PropertyListComponent,
    R,
    React,
    ReorderableListComponent,
    SectionEditorComponent,
    _,
    _flattenProperties,
    uuid,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
},
    indexOf = [].indexOf;

PropTypes = require('prop-types');
React = require('react');
R = React.createElement;
_ = require('lodash');
uuid = require('uuid');
ReorderableListComponent = require("react-library/lib/reorderable/ReorderableListComponent");
LocalizedStringComponent = require('../LocalizedStringComponent');
PropertyEditorComponent = require('./PropertyEditorComponent');
SectionEditorComponent = require('./SectionEditorComponent');
NestedListClipboardEnhancement = require('./NestedListClipboardEnhancement');
ActionCancelModalComponent = require('react-library/lib/ActionCancelModalComponent');

PropertyListComponent = function () {
  // List/add/edit properties
  var PropertyListComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2.default)(PropertyListComponent, _React$Component);

    function PropertyListComponent(props) {
      var _this;

      (0, _classCallCheck2.default)(this, PropertyListComponent);
      _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(PropertyListComponent).call(this, props));
      _this.handleChange = _this.handleChange.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleDelete = _this.handleDelete.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleNewProperty = _this.handleNewProperty.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleNewSection = _this.handleNewSection.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.renderProperty = _this.renderProperty.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.state = {
        addingItem: null // Property being added

      };
      return _this;
    }

    (0, _createClass2.default)(PropertyListComponent, [{
      key: "handleChange",
      value: function handleChange(index, property) {
        var value;
        boundMethodCheck(this, PropertyListComponent);
        value = this.props.properties.slice();
        value[index] = property;
        return this.props.onChange(value);
      }
    }, {
      key: "handleDelete",
      value: function handleDelete(index) {
        var value;
        boundMethodCheck(this, PropertyListComponent);
        value = this.props.properties.slice();

        _.pullAt(value, index);

        return this.props.onChange(value);
      }
    }, {
      key: "handleNewProperty",
      value: function handleNewProperty() {
        var property;
        boundMethodCheck(this, PropertyListComponent);
        property = {
          type: "text"
        };

        if (this.props.propertyIdGenerator) {
          property["id"] = this.props.propertyIdGenerator();
        }

        return this.setState({
          addingItem: property
        });
      }
    }, {
      key: "handleNewSection",
      value: function handleNewSection() {
        var section;
        boundMethodCheck(this, PropertyListComponent);
        section = {
          type: "section",
          contents: []
        };
        return this.setState({
          addingItem: section
        });
      }
    }, {
      key: "renderControls",
      value: function renderControls(allPropertyIds) {
        return R('div', {
          className: "btn-group pl-controls"
        }, this.renderAddingModal(allPropertyIds), R('button', {
          key: "default_add",
          type: "button",
          className: "btn btn-xs btn-default dropdown-toggle",
          "data-toggle": "dropdown"
        }, R('span', {
          className: "glyphicon glyphicon-plus"
        }), " ", "Add", " ", R('span', {
          className: "caret"
        })), R('ul', {
          className: "dropdown-menu text-left",
          role: "menu"
        }, R('li', {
          key: "property"
        }, R('a', {
          onClick: this.handleNewProperty
        }, "Property")), _.includes(this.props.features, "section") ? R('li', {
          key: "section"
        }, R('a', {
          onClick: this.handleNewSection
        }, "Section")) : void 0));
      }
    }, {
      key: "renderAddingModal",
      value: function renderAddingModal(allPropertyIds) {
        var _this2 = this;

        if (!this.state.addingItem) {
          return null;
        }

        return R(ActionCancelModalComponent, {
          size: "large",
          title: this.state.addingItem.type === "section" ? "Add a section" : "Add a property",
          actionLabel: "Save",
          onAction: function onAction() {
            var ref, value;

            if (_this2.state.addingItem) {
              // Prevent duplicates
              if (ref = _this2.state.addingItem.id, indexOf.call(allPropertyIds, ref) >= 0) {
                return alert("Duplicate ids not allowed");
              }

              value = _this2.props.properties.slice();
              value.push(_this2.state.addingItem);

              _this2.props.onChange(value);

              return _this2.setState({
                addingItem: null
              });
            }
          },
          onCancel: function onCancel() {
            return _this2.setState({
              addingItem: null
            });
          }
        }, this.state.addingItem.type === "section" ? R(SectionEditorComponent, {
          property: this.state.addingItem,
          onChange: function onChange(updatedProperty) {
            return _this2.setState({
              addingItem: updatedProperty
            });
          },
          features: this.props.features
        }) : R(PropertyEditorComponent, {
          property: this.state.addingItem,
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: this.props.table,
          tableIds: this.props.tableIds,
          onChange: function onChange(updatedProperty) {
            return _this2.setState({
              addingItem: updatedProperty
            });
          },
          features: this.props.features,
          createRoleEditElem: this.props.createRoleEditElem,
          forbiddenPropertyIds: allPropertyIds
        }));
      }
    }, {
      key: "renderProperty",
      value: function renderProperty(allPropertyIds, item, index, connectDragSource, connectDragPreview, connectDropTarget) {
        var elem;
        boundMethodCheck(this, PropertyListComponent);
        elem = R('div', {
          key: index
        }, R(PropertyComponent, {
          property: item,
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: this.props.table,
          tableIds: this.props.tableIds,
          features: this.props.features,
          onChange: this.handleChange.bind(null, index),
          onDelete: this.handleDelete.bind(null, index),
          onCut: this.props.onCut,
          onCopy: this.props.onCopy,
          onPaste: this.props.onPaste,
          onPasteInto: this.props.onPasteInto,
          createRoleEditElem: this.props.createRoleEditElem,
          createRoleDisplayElem: this.props.createRoleDisplayElem,
          listId: this.props.listId,
          allPropertyIds: allPropertyIds
        }));
        return connectDragPreview(connectDropTarget(connectDragSource(elem)));
      }
    }, {
      key: "render",
      value: function render() {
        var _this3 = this;

        var allPropertyIds; // Compute list of all property ids, recursively

        allPropertyIds = _.pluck(_flattenProperties(this.props.properties), "id");
        return R('div', {
          className: 'pl-editor-container'
        }, R(ReorderableListComponent, {
          items: this.props.properties,
          onReorder: function onReorder(list) {
            return _this3.props.onChange(list);
          },
          renderItem: this.renderProperty.bind(this, allPropertyIds),
          getItemId: function getItemId(item) {
            return item.id;
          },
          element: R('div', {
            className: 'pl-container'
          })
        }), this.renderControls(allPropertyIds));
      }
    }]);
    return PropertyListComponent;
  }(React.Component);

  ;
  PropertyListComponent.propTypes = {
    properties: PropTypes.array.isRequired,
    // array of properties
    onChange: PropTypes.func.isRequired,
    schema: PropTypes.object,
    // schema of all data. Needed for idType and expr features
    dataSource: PropTypes.object,
    // data source. Needed for expr feature
    table: PropTypes.string,
    // Table that properties are of. Not required if table feature is on
    tableIds: PropTypes.arrayOf(PropTypes.string.isRequired),
    // Ids of tables to include when using table feature
    propertyIdGenerator: PropTypes.func,
    // Function to generate the ID of the property
    allPropertyIds: PropTypes.arrayOf(PropTypes.string.isRequired),
    // List of all property ids to prevent duplicates. Do not set directly!
    // Array of features to be enabled apart from the defaults. Features are:
    // sql: include raw SQL editor
    // idField: show id field for properties
    // uniqueCode: allow uniqueCode flag on properties
    // idType: allow id-type fields
    // joinType: allow join-type fields
    // code: show code of properties
    // expr: allow fields with expr set
    // conditionExpr: allow fields to set a condition expression if they are conditionally displayed
    // section: allow adding sections
    // table: each property contains table
    // unique: allow unique flag on properties
    // onDelete: allow undefined, "cascade" or "set_null"
    features: PropTypes.array,
    // function that returns the UI of the roles, called with a single argument, the array containing roles
    createRoleDisplayElem: PropTypes.func,
    // function that returns the UI of the roles for editing, gets passed two arguments
    // 1. the array containing roles
    // 2. The callback function that should be called when the roles change
    createRoleEditElem: PropTypes.func,
    onCut: PropTypes.func,
    // supplied by NestedListClipboardEnhancement
    onCopy: PropTypes.func,
    // supplied by NestedListClipboardEnhancement
    onPaste: PropTypes.func,
    // supplied by NestedListClipboardEnhancement
    onPasteInto: PropTypes.func,
    // supplied by NestedListClipboardEnhancement
    listId: PropTypes.string // used internally

  };
  PropertyListComponent.contextTypes = {
    clipboard: PropTypes.object
  };
  return PropertyListComponent;
}.call(void 0);

PropertyComponent = function () {
  var PropertyComponent =
  /*#__PURE__*/
  function (_React$Component2) {
    (0, _inherits2.default)(PropertyComponent, _React$Component2);

    function PropertyComponent(props) {
      var _this4;

      (0, _classCallCheck2.default)(this, PropertyComponent);
      _this4 = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(PropertyComponent).call(this, props));
      _this4.handleEdit = _this4.handleEdit.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this4)));
      _this4.renderEnumValues = _this4.renderEnumValues.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this4)));
      _this4.state = {
        editing: false,
        editorProperty: null
      };
      return _this4;
    }

    (0, _createClass2.default)(PropertyComponent, [{
      key: "handleEdit",
      value: function handleEdit() {
        boundMethodCheck(this, PropertyComponent);
        return this.setState({
          editing: true,
          editorProperty: this.props.property
        });
      }
    }, {
      key: "renderControls",
      value: function renderControls() {
        var _this5 = this;

        return R('div', {
          className: "pl-item-controls"
        }, R('a', {
          className: "pl-item-control",
          onClick: this.handleEdit
        }, "Edit"), R('a', {
          className: "pl-item-control",
          onClick: function onClick() {
            return _this5.props.onCopy(_this5.props.listId, _this5.props.property.id);
          }
        }, "Copy"), R('a', {
          className: "pl-item-control",
          onClick: function onClick() {
            return _this5.props.onCut(_this5.props.listId, _this5.props.property.id);
          }
        }, "Cut"), this.context.clipboard ? R('a', {
          className: "pl-item-control",
          onClick: function onClick() {
            return _this5.props.onPaste(_this5.props.listId, _this5.props.property.id);
          }
        }, "Paste") : void 0, this.context.clipboard && this.props.property.type === "section" ? R('a', {
          className: "pl-item-control",
          onClick: function onClick() {
            return _this5.props.onPasteInto(_this5.props.listId, _this5.props.property.id);
          }
        }, "Paste Into") : void 0, R('a', {
          className: "pl-item-control",
          onClick: function onClick() {
            return _this5.props.onDelete();
          }
        }, "Delete"));
      }
    }, {
      key: "renderEnumValues",
      value: function renderEnumValues(values) {
        var names;
        boundMethodCheck(this, PropertyComponent);
        names = _.map(values, function (value) {
          return value.name[value._base || "en"];
        });
        return R('span', null, "".concat(names.join(" / ")));
      }
    }, {
      key: "renderTable",
      value: function renderTable(table) {
        var ref;
        return R(LocalizedStringComponent, {
          value: (ref = this.props.schema.getTable(table)) != null ? ref.name : void 0
        });
      }
    }, {
      key: "render",
      value: function render() {
        var _this6 = this;

        var classNames, ref;
        classNames = ["pl-property"];

        if (this.props.property.deprecated) {
          classNames.push("deprecated");
        }

        return R('div', {
          className: "".concat(classNames.join(" "), " pl-item-type-").concat(this.props.property.type)
        }, this.state.editing ? R(ActionCancelModalComponent, {
          size: "large",
          title: this.state.editorProperty.type === "section" ? "Edit section" : "Edit property",
          actionLabel: "Save",
          onAction: function onAction() {
            var ref;

            if (_this6.state.editorProperty) {
              // Prevent duplicates
              if (_this6.state.editorProperty.id !== _this6.props.property.id && (ref = _this6.state.editorProperty.id, indexOf.call(_this6.props.allPropertyIds, ref) >= 0)) {
                return alert("Duplicate ids not allowed");
              }

              _this6.props.onChange(_this6.state.editorProperty);
            }

            return _this6.setState({
              editing: false,
              editorProperty: null
            });
          },
          onCancel: function onCancel() {
            return _this6.setState({
              editing: false,
              editorProperty: null
            });
          }
        }, this.props.property.type === "section" ? R(SectionEditorComponent, {
          property: this.state.editorProperty,
          onChange: function onChange(updatedProperty) {
            return _this6.setState({
              editorProperty: updatedProperty
            });
          },
          features: this.props.features
        }) : R(PropertyEditorComponent, {
          property: this.state.editorProperty,
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: this.props.table,
          tableIds: this.props.tableIds,
          onChange: function onChange(updatedProperty) {
            return _this6.setState({
              editorProperty: updatedProperty
            });
          },
          features: this.props.features,
          createRoleEditElem: this.props.createRoleEditElem,
          forbiddenPropertyIds: _.without(this.props.allPropertyIds, this.props.property.id)
        })) : void 0, this.renderControls(), this.props.property.deprecated ? R('div', {
          className: "pl-item-deprecated-overlay"
        }, "") : void 0, R('div', {
          className: "pl-item",
          onDoubleClick: this.handleEdit
        }, R('div', {
          className: "pl-item-detail"
        }, R('span', {
          className: "pl-item-detail-indicator"
        }, R('i', {
          className: "".concat(PropertyComponent.iconMap[this.props.property.type], " fa-fw")
        })), R('div', null, R('div', {
          className: "pl-item-detail-name"
        }, _.includes(this.props.features, "idField") && this.props.property.id ? R('small', null, "[".concat(this.props.property.id, "] ")) : void 0, R(LocalizedStringComponent, {
          value: this.props.property.name
        }), this.props.property.expr ? R('span', {
          className: "text-muted"
        }, " ", R('span', {
          className: "fa fa-calculator"
        })) : void 0), this.props.property.desc ? R('div', {
          className: "pl-item-detail-description"
        }, R(LocalizedStringComponent, {
          value: this.props.property.desc
        })) : void 0, this.props.property.sql ? R('div', {
          className: "pl-item-detail-sql text-muted"
        }, this.props.property.sql) : void 0, ((ref = this.props.property.type) === "enum" || ref === "enumset") && this.props.property.enumValues.length > 0 ? R('div', {
          className: "pl-item-detail-enum text-muted"
        }, this.renderEnumValues(this.props.property.enumValues)) : void 0, _.includes(this.props.features, "table") && this.props.property.table ? R('div', {
          className: "pl-item-detail-table text-muted"
        }, this.renderTable(this.props.property.table)) : void 0, this.props.property.roles && this.props.createRoleDisplayElem ? this.props.createRoleDisplayElem(this.props.property.roles) : void 0))), this.props.property.type === "section" ? R('div', {
          className: "pl-item-section"
        }, R(PropertyListComponent, {
          properties: this.props.property.contents || [],
          features: this.props.features,
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: this.props.table,
          tableIds: this.props.tableIds,
          createRoleEditElem: this.props.createRoleEditElem,
          createRoleDisplayElem: this.props.createRoleDisplayElem,
          onCut: this.props.onCut,
          onCopy: this.props.onCopy,
          onPaste: this.props.onPaste,
          onPasteInto: this.props.onPasteInto,
          listId: this.props.property.id,
          onChange: function onChange(list) {
            var newProperty;
            newProperty = _.cloneDeep(_this6.props.property);
            newProperty.contents = list;
            return _this6.props.onChange(newProperty);
          },
          allPropertyIds: this.props.allPropertyIds
        })) : void 0);
      }
    }]);
    return PropertyComponent;
  }(React.Component);

  ;
  PropertyComponent.propTypes = {
    property: PropTypes.object.isRequired,
    // The property
    onChange: PropTypes.func.isRequired,
    schema: PropTypes.object,
    // schema of all data. Needed for idType and expr features
    dataSource: PropTypes.object,
    // data source. Needed for expr feature
    table: PropTypes.string,
    // Table that properties are of. Not required if table feature is on
    tableIds: PropTypes.arrayOf(PropTypes.string.isRequired),
    // Ids of tables to include when using table feature
    features: PropTypes.array,
    // Features to be enabled apart from the default features
    createRoleDisplayElem: PropTypes.func,
    createRoleEditElem: PropTypes.func,
    onCut: PropTypes.func.isRequired,
    onCopy: PropTypes.func.isRequired,
    onPaste: PropTypes.func.isRequired,
    onPasteInto: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    listId: PropTypes.string,
    allPropertyIds: PropTypes.arrayOf(PropTypes.string.isRequired) // List of all property ids to prevent duplicates

  };
  PropertyComponent.iconMap = {
    text: "fa fa-font",
    number: "fa fa-calculator",
    enum: "fa fa-check-circle-o",
    enumset: "fa fa-check-square-o",
    date: "fa fa-calendar-check-o",
    datetime: "fa fa-calendar-check-o",
    image: "fa fa-file-image-o",
    imagelist: "fa fa-file-image-o",
    section: "fa fa-folder",
    geometry: "fa fa-map-marker",
    boolean: "fa fa-toggle-on",
    id: "fa fa-arrow-right",
    join: "fa fa-link"
  };
  PropertyComponent.contextTypes = {
    clipboard: PropTypes.object
  };
  return PropertyComponent;
}.call(void 0);

module.exports = NestedListClipboardEnhancement(PropertyListComponent); // Flatten a nested list of properties

_flattenProperties = function flattenProperties(properties) {
  var i, len, prop, props;
  props = [];

  for (i = 0, len = properties.length; i < len; i++) {
    prop = properties[i];

    if (prop.contents) {
      props = props.concat(_flattenProperties(prop.contents));
    } else {
      props.push(prop);
    }
  }

  return props;
};