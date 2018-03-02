var ActionCancelModalComponent, H, LocalizedStringComponent, NestedListClipboardEnhancement, PropTypes, PropertyComponent, PropertyEditorComponent, PropertyListComponent, R, React, ReorderableListComponent, SectionEditorComponent, _, uuid,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

PropTypes = require('prop-types');

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

PropertyListComponent = (function() {
  // List/add/edit properties
  class PropertyListComponent extends React.Component {
    constructor(props) {
      super(props);
      this.handleChange = this.handleChange.bind(this);
      this.handleDelete = this.handleDelete.bind(this);
      this.handleNewProperty = this.handleNewProperty.bind(this);
      this.handleNewSection = this.handleNewSection.bind(this);
      this.renderProperty = this.renderProperty.bind(this);
      this.state = {
        addingItem: null // Property being added
      };
    }

    handleChange(index, property) {
      var value;
      boundMethodCheck(this, PropertyListComponent);
      value = this.props.properties.slice();
      value[index] = property;
      return this.props.onChange(value);
    }

    handleDelete(index) {
      var value;
      boundMethodCheck(this, PropertyListComponent);
      value = this.props.properties.slice();
      _.pullAt(value, index);
      return this.props.onChange(value);
    }

    handleNewProperty() {
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

    handleNewSection() {
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

    renderControls() {
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
    }

    renderAddingModal() {
      if (!this.state.addingItem) {
        return null;
      }
      return R(ActionCancelModalComponent, {
        size: "large",
        title: this.state.addingItem.type === "section" ? "Add a section" : "Add a property",
        actionLabel: "Save",
        onAction: () => {
          var value;
          if (this.state.addingItem) {
            value = this.props.properties.slice();
            value.push(this.state.addingItem);
            this.props.onChange(value);
            return this.setState({
              addingItem: null
            });
          }
        },
        onCancel: () => {
          return this.setState({
            addingItem: null
          });
        }
      }, this.state.addingItem.type === "section" ? R(SectionEditorComponent, {
        property: this.state.addingItem,
        onChange: (updatedProperty) => {
          return this.setState({
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
        onChange: (updatedProperty) => {
          return this.setState({
            addingItem: updatedProperty
          });
        },
        features: this.props.features,
        createRoleEditElem: this.props.createRoleEditElem
      }));
    }

    renderProperty(item, index, connectDragSource, connectDragPreview, connectDropTarget) {
      var elem;
      boundMethodCheck(this, PropertyListComponent);
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
    }

    render() {
      return H.div({
        className: 'pl-editor-container'
      }, R(ReorderableListComponent, {
        items: this.props.properties,
        onReorder: (list) => {
          return this.props.onChange(list);
        },
        renderItem: this.renderProperty,
        getItemId: (item) => {
          return item.id;
        },
        element: H.div({
          className: 'pl-container'
        })
      }), this.renderControls());
    }

  };

  PropertyListComponent.propTypes = {
    properties: PropTypes.array.isRequired, // array of properties
    onChange: PropTypes.func.isRequired,
    schema: PropTypes.object, // schema of all data. Needed for idType and expr features
    dataSource: PropTypes.object, // data source. Needed for expr feature
    table: PropTypes.string, // Table that properties are of. Not required if table feature is on
    tableIds: PropTypes.arrayOf(PropTypes.string.isRequired), // Ids of tables to include when using table feature
    propertyIdGenerator: PropTypes.func, // Function to generate the ID of the property
    
    // Array of features to be enabled apart from the defaults. Features are:
    // sql: include raw SQL editor
    // idField: show id field for properties
    // uniqueCode: allow uniqueCode flag on properties
    // idType: allow id-type fields
    // joinType: allow join-type fields
    // code: show code of properties
    // expr: allow fields with expr set
    // section: allow adding sections
    // table: each property contains table
    features: PropTypes.array,
    
    // function that returns the UI of the roles, called with a single argument, the array containing roles
    createRoleDisplayElem: PropTypes.func,
    
    // function that returns the UI of the roles for editing, gets passed two arguments
    // 1. the array containing roles
    // 2. The callback function that should be called when the roles change
    createRoleEditElem: PropTypes.func,
    onCut: PropTypes.func, // supplied by NestedListClipboardEnhancement
    onCopy: PropTypes.func, // supplied by NestedListClipboardEnhancement
    onPaste: PropTypes.func, // supplied by NestedListClipboardEnhancement
    onPasteInto: PropTypes.func, // supplied by NestedListClipboardEnhancement
    listId: PropTypes.string // used internally
  };

  PropertyListComponent.contextTypes = {
    clipboard: PropTypes.object
  };

  return PropertyListComponent;

}).call(this);

PropertyComponent = (function() {
  class PropertyComponent extends React.Component {
    constructor(props) {
      super(props);
      this.handleEdit = this.handleEdit.bind(this);
      this.renderEnumValues = this.renderEnumValues.bind(this);
      this.state = {
        editing: false,
        editorProperty: null
      };
    }

    handleEdit() {
      boundMethodCheck(this, PropertyComponent);
      return this.setState({
        editing: true,
        editorProperty: this.props.property
      });
    }

    renderControls() {
      return H.div({
        className: "pl-item-controls"
      }, H.a({
        className: "pl-item-control",
        onClick: this.handleEdit
      }, "Edit"), H.a({
        className: "pl-item-control",
        onClick: (() => {
          return this.props.onCopy(this.props.listId, this.props.property.id);
        })
      }, "Copy"), H.a({
        className: "pl-item-control",
        onClick: (() => {
          return this.props.onCut(this.props.listId, this.props.property.id);
        })
      }, "Cut"), this.context.clipboard ? H.a({
        className: "pl-item-control",
        onClick: (() => {
          return this.props.onPaste(this.props.listId, this.props.property.id);
        })
      }, "Paste") : void 0, this.context.clipboard && this.props.property.type === "section" ? H.a({
        className: "pl-item-control",
        onClick: (() => {
          return this.props.onPasteInto(this.props.listId, this.props.property.id);
        })
      }, "Paste Into") : void 0, H.a({
        className: "pl-item-control",
        onClick: (() => {
          return this.props.onDelete();
        })
      }, "Delete"));
    }

    renderEnumValues(values) {
      var names;
      boundMethodCheck(this, PropertyComponent);
      names = _.map(values, function(value) {
        return value.name[value._base || "en"];
      });
      return H.span(null, `${names.join(" / ")}`);
    }

    renderTable(table) {
      var ref;
      return R(LocalizedStringComponent, {
        value: (ref = this.props.schema.getTable(table)) != null ? ref.name : void 0
      });
    }

    render() {
      var classNames, ref;
      classNames = ["pl-property"];
      if (this.props.property.deprecated) {
        classNames.push("deprecated");
      }
      return H.div({
        className: `${classNames.join(" ")} pl-item-type-${this.props.property.type}`
      }, this.state.editing ? R(ActionCancelModalComponent, {
        size: "large",
        title: this.state.editorProperty.type === "section" ? "Edit section" : "Edit property",
        actionLabel: "Save",
        onAction: () => {
          if (this.state.editorProperty) {
            this.props.onChange(this.state.editorProperty);
          }
          return this.setState({
            editing: false,
            editorProperty: null
          });
        },
        onCancel: () => {
          return this.setState({
            editing: false,
            editorProperty: null
          });
        }
      }, this.props.property.type === "section" ? R(SectionEditorComponent, {
        property: this.state.editorProperty,
        onChange: (updatedProperty) => {
          return this.setState({
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
        onChange: (updatedProperty) => {
          return this.setState({
            editorProperty: updatedProperty
          });
        },
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
        className: `${PropertyComponent.iconMap[this.props.property.type]} fa-fw`
      })), H.div(null, H.div({
        className: "pl-item-detail-name"
      }, _.includes(this.props.features, "idField") && this.props.property.id ? H.small(null, `[${this.props.property.id}] `) : void 0, R(LocalizedStringComponent, {
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
        onChange: (list) => {
          var newProperty;
          newProperty = _.cloneDeep(this.props.property);
          newProperty.contents = list;
          return this.props.onChange(newProperty);
        }
      })) : void 0);
    }

  };

  PropertyComponent.propTypes = {
    property: PropTypes.object.isRequired, // The property
    onChange: PropTypes.func.isRequired,
    schema: PropTypes.object, // schema of all data. Needed for idType and expr features
    dataSource: PropTypes.object, // data source. Needed for expr feature
    table: PropTypes.string, // Table that properties are of. Not required if table feature is on
    tableIds: PropTypes.arrayOf(PropTypes.string.isRequired), // Ids of tables to include when using table feature
    features: PropTypes.array, // Features to be enabled apart from the default features
    createRoleDisplayElem: PropTypes.func,
    createRoleEditElem: PropTypes.func,
    onCut: PropTypes.func.isRequired,
    onCopy: PropTypes.func.isRequired,
    onPaste: PropTypes.func.isRequired,
    onPasteInto: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    listId: PropTypes.string
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

}).call(this);

module.exports = NestedListClipboardEnhancement(PropertyListComponent);
