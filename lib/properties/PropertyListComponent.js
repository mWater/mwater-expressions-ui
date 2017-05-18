var ActionCancelModalComponent, H, LocalizedStringComponent, NestedListClipboardEnhancement, PropertyComponent, PropertyEditorComponent, PropertyListComponent, R, React, ReorderableListComponent, SectionEditorComponent, _, uuid,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

R = React.createElement;

H = React.DOM;

_ = require('lodash');

uuid = require('uuid');

ReorderableListComponent = require("react-library/lib/reorderable/ReorderableListComponent");

LocalizedStringComponent = require('../LocalizedStringComponent');

PropertyEditorComponent = require('./PropertyEditorComponent');

SectionEditorComponent = require('./SectionEditorComponent');

NestedListClipboardEnhancement = require('./NestedListClipboardEnhancement');

ActionCancelModalComponent = require('react-library/lib/ActionCancelModalComponent');

PropertyListComponent = (function(superClass) {
  extend(PropertyListComponent, superClass);

  PropertyListComponent.propTypes = {
    properties: React.PropTypes.array.isRequired,
    onChange: React.PropTypes.func.isRequired,
    schema: React.PropTypes.object,
    dataSource: React.PropTypes.object,
    table: React.PropTypes.string,
    tableIds: React.PropTypes.arrayOf(React.PropTypes.string.isRequired),
    propertyIdGenerator: React.PropTypes.func,
    features: React.PropTypes.array,
    createRoleDisplayElem: React.PropTypes.func,
    createRoleEditElem: React.PropTypes.func,
    onCut: React.PropTypes.func,
    onCopy: React.PropTypes.func,
    onPaste: React.PropTypes.func,
    onPasteInto: React.PropTypes.func,
    listId: React.PropTypes.string
  };

  PropertyListComponent.contextTypes = {
    clipboard: React.PropTypes.object
  };

  function PropertyListComponent(props) {
    this.renderProperty = bind(this.renderProperty, this);
    this.handleNewSection = bind(this.handleNewSection, this);
    this.handleNewProperty = bind(this.handleNewProperty, this);
    this.handleDelete = bind(this.handleDelete, this);
    this.handleChange = bind(this.handleChange, this);
    PropertyListComponent.__super__.constructor.call(this, props);
    this.state = {
      addingItem: null
    };
  }

  PropertyListComponent.prototype.handleChange = function(index, property) {
    var value;
    value = this.props.properties.slice();
    value[index] = property;
    return this.props.onChange(value);
  };

  PropertyListComponent.prototype.handleDelete = function(index) {
    var value;
    value = this.props.properties.slice();
    _.pullAt(value, index);
    return this.props.onChange(value);
  };

  PropertyListComponent.prototype.handleNewProperty = function() {
    var property;
    property = {
      type: "text"
    };
    if (this.props.propertyIdGenerator) {
      property["id"] = this.props.propertyIdGenerator();
    }
    return this.setState({
      addingItem: property
    });
  };

  PropertyListComponent.prototype.handleNewSection = function() {
    var section;
    section = {
      type: "section",
      contents: []
    };
    return this.setState({
      addingItem: section
    });
  };

  PropertyListComponent.prototype.renderControls = function() {
    return H.div({
      className: "btn-group pl-controls"
    }, this.renderAddingModal(), H.button({
      key: "default_add",
      type: "button",
      className: "btn btn-xs btn-default dropdown-toggle",
      "data-toggle": "dropdown"
    }, H.span({
      className: "glyphicon glyphicon-plus"
    }), " ", "Add", " ", H.span({
      className: "caret"
    })), H.ul({
      className: "dropdown-menu text-left",
      role: "menu"
    }, H.li({
      key: "property"
    }, H.a({
      onClick: this.handleNewProperty
    }, "Property")), _.includes(this.props.features, "section") ? H.li({
      key: "section"
    }, H.a({
      onClick: this.handleNewSection
    }, "Section")) : void 0));
  };

  PropertyListComponent.prototype.renderAddingModal = function() {
    if (!this.state.addingItem) {
      return null;
    }
    return R(ActionCancelModalComponent, {
      size: "large",
      title: this.state.addingItem.type === "section" ? "Add a section" : "Add a property",
      actionLabel: "Save",
      onAction: (function(_this) {
        return function() {
          var value;
          if (_this.state.addingItem) {
            value = _this.props.properties.slice();
            value.push(_this.state.addingItem);
            _this.props.onChange(value);
            return _this.setState({
              addingItem: null
            });
          }
        };
      })(this),
      onCancel: (function(_this) {
        return function() {
          return _this.setState({
            addingItem: null
          });
        };
      })(this)
    }, this.state.addingItem.type === "section" ? R(SectionEditorComponent, {
      property: this.state.addingItem,
      onChange: (function(_this) {
        return function(updatedProperty) {
          return _this.setState({
            addingItem: updatedProperty
          });
        };
      })(this),
      features: this.props.features
    }) : R(PropertyEditorComponent, {
      property: this.state.addingItem,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.table,
      tableIds: this.props.tableIds,
      onChange: (function(_this) {
        return function(updatedProperty) {
          return _this.setState({
            addingItem: updatedProperty
          });
        };
      })(this),
      features: this.props.features,
      createRoleEditElem: this.props.createRoleEditElem
    }));
  };

  PropertyListComponent.prototype.renderProperty = function(item, index, connectDragSource, connectDragPreview, connectDropTarget) {
    var elem;
    elem = H.div({
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
      listId: this.props.listId
    }));
    return connectDragPreview(connectDropTarget(connectDragSource(elem)));
  };

  PropertyListComponent.prototype.render = function() {
    return H.div({
      className: 'pl-editor-container'
    }, R(ReorderableListComponent, {
      items: this.props.properties,
      onReorder: (function(_this) {
        return function(list) {
          return _this.props.onChange(list);
        };
      })(this),
      renderItem: this.renderProperty,
      getItemId: (function(_this) {
        return function(item) {
          return item.id;
        };
      })(this),
      element: H.div({
        className: 'pl-container'
      })
    }), this.renderControls());
  };

  return PropertyListComponent;

})(React.Component);

PropertyComponent = (function(superClass) {
  extend(PropertyComponent, superClass);

  PropertyComponent.propTypes = {
    property: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired,
    schema: React.PropTypes.object,
    dataSource: React.PropTypes.object,
    table: React.PropTypes.string,
    tableIds: React.PropTypes.arrayOf(React.PropTypes.string.isRequired),
    features: React.PropTypes.array,
    createRoleDisplayElem: React.PropTypes.func,
    createRoleEditElem: React.PropTypes.func,
    onCut: React.PropTypes.func.isRequired,
    onCopy: React.PropTypes.func.isRequired,
    onPaste: React.PropTypes.func.isRequired,
    onPasteInto: React.PropTypes.func.isRequired,
    onDelete: React.PropTypes.func.isRequired,
    listId: React.PropTypes.string
  };

  PropertyComponent.iconMap = {
    text: "fa fa-font",
    number: "fa fa-calculator",
    "enum": "fa fa-check-circle-o",
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
    clipboard: React.PropTypes.object
  };

  function PropertyComponent(props) {
    this.renderEnumValues = bind(this.renderEnumValues, this);
    this.handleEdit = bind(this.handleEdit, this);
    PropertyComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      editing: false,
      editorProperty: null
    };
  }

  PropertyComponent.prototype.handleEdit = function() {
    return this.setState({
      editing: true,
      editorProperty: this.props.property
    });
  };

  PropertyComponent.prototype.renderControls = function() {
    return H.div({
      className: "pl-item-controls"
    }, H.a({
      className: "pl-item-control",
      onClick: this.handleEdit
    }, "Edit"), H.a({
      className: "pl-item-control",
      onClick: ((function(_this) {
        return function() {
          return _this.props.onCopy(_this.props.listId, _this.props.property.id);
        };
      })(this))
    }, "Copy"), H.a({
      className: "pl-item-control",
      onClick: ((function(_this) {
        return function() {
          return _this.props.onCut(_this.props.listId, _this.props.property.id);
        };
      })(this))
    }, "Cut"), this.context.clipboard ? H.a({
      className: "pl-item-control",
      onClick: ((function(_this) {
        return function() {
          return _this.props.onPaste(_this.props.listId, _this.props.property.id);
        };
      })(this))
    }, "Paste") : void 0, this.context.clipboard && this.props.property.type === "section" ? H.a({
      className: "pl-item-control",
      onClick: ((function(_this) {
        return function() {
          return _this.props.onPasteInto(_this.props.listId, _this.props.property.id);
        };
      })(this))
    }, "Paste Into") : void 0, H.a({
      className: "pl-item-control",
      onClick: ((function(_this) {
        return function() {
          return _this.props.onDelete();
        };
      })(this))
    }, "Delete"));
  };

  PropertyComponent.prototype.renderEnumValues = function(values) {
    var names;
    names = _.map(values, function(value) {
      return value.name[value._base || "en"];
    });
    return H.span(null, "" + (names.join(" / ")));
  };

  PropertyComponent.prototype.renderTable = function(table) {
    var ref;
    return R(LocalizedStringComponent, {
      value: (ref = this.props.schema.getTable(table)) != null ? ref.name : void 0
    });
  };

  PropertyComponent.prototype.render = function() {
    var classNames, ref;
    classNames = ["pl-property"];
    if (this.props.property.deprecated) {
      classNames.push("deprecated");
    }
    return H.div({
      className: (classNames.join(" ")) + " pl-item-type-" + this.props.property.type
    }, this.state.editing ? R(ActionCancelModalComponent, {
      size: "large",
      title: this.state.editorProperty.type === "section" ? "Edit section" : "Edit property",
      actionLabel: "Save",
      onAction: (function(_this) {
        return function() {
          if (_this.state.editorProperty) {
            _this.props.onChange(_this.state.editorProperty);
          }
          return _this.setState({
            editing: false,
            editorProperty: null
          });
        };
      })(this),
      onCancel: (function(_this) {
        return function() {
          return _this.setState({
            editing: false,
            editorProperty: null
          });
        };
      })(this)
    }, this.props.property.type === "section" ? R(SectionEditorComponent, {
      property: this.state.editorProperty,
      onChange: (function(_this) {
        return function(updatedProperty) {
          return _this.setState({
            editorProperty: updatedProperty
          });
        };
      })(this),
      features: this.props.features
    }) : R(PropertyEditorComponent, {
      property: this.state.editorProperty,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.table,
      tableIds: this.props.tableIds,
      onChange: (function(_this) {
        return function(updatedProperty) {
          return _this.setState({
            editorProperty: updatedProperty
          });
        };
      })(this),
      features: this.props.features,
      createRoleEditElem: this.props.createRoleEditElem
    })) : void 0, this.renderControls(), this.props.property.deprecated ? H.div({
      className: "pl-item-deprecated-overlay"
    }, "") : void 0, H.div({
      className: "pl-item",
      onDoubleClick: this.handleEdit
    }, H.div({
      className: "pl-item-detail"
    }, H.span({
      className: "pl-item-detail-indicator"
    }, H.i({
      className: PropertyComponent.iconMap[this.props.property.type] + " fa-fw"
    })), H.div(null, H.div({
      className: "pl-item-detail-name"
    }, _.includes(this.props.features, "idField") && this.props.property.id ? H.small(null, "[" + this.props.property.id + "] ") : void 0, R(LocalizedStringComponent, {
      value: this.props.property.name
    })), this.props.property.desc ? H.div({
      className: "pl-item-detail-description"
    }, R(LocalizedStringComponent, {
      value: this.props.property.desc
    })) : void 0, this.props.property.sql ? H.div({
      className: "pl-item-detail-sql text-muted"
    }, this.props.property.sql) : void 0, ((ref = this.props.property.type) === "enum" || ref === "enumset") && this.props.property.enumValues.length > 0 ? H.div({
      className: "pl-item-detail-enum text-muted"
    }, this.renderEnumValues(this.props.property.enumValues)) : void 0, _.includes(this.props.features, "table") && this.props.property.table ? H.div({
      className: "pl-item-detail-table text-muted"
    }, this.renderTable(this.props.property.table)) : void 0, this.props.property.roles && this.props.createRoleDisplayElem ? this.props.createRoleDisplayElem(this.props.property.roles) : void 0))), this.props.property.type === "section" ? H.div({
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
      onChange: (function(_this) {
        return function(list) {
          var newProperty;
          newProperty = _.cloneDeep(_this.props.property);
          newProperty.contents = list;
          return _this.props.onChange(newProperty);
        };
      })(this)
    })) : void 0);
  };

  return PropertyComponent;

})(React.Component);

module.exports = NestedListClipboardEnhancement(PropertyListComponent);
