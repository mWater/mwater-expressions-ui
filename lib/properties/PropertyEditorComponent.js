var EnumValueEditorComponent, EnumValuesEditorComponent, ExprComponent, ExprUtils, H, IdFieldComponent, JoinEditorComponent, LocalizedStringEditorComp, PropTypes, PropertyEditorComponent, R, React, TableSelectComponent, _, ui,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

PropTypes = require('prop-types');

React = require('react');

R = React.createElement;

H = React.DOM;

_ = require('lodash');

ui = require('react-library/lib/bootstrap');

LocalizedStringEditorComp = require('../LocalizedStringEditorComp');

ExprComponent = require('../ExprComponent');

ExprUtils = require('mwater-expressions').ExprUtils;

IdFieldComponent = require('./IdFieldComponent');

// Edit a single property
module.exports = PropertyEditorComponent = (function() {
  class PropertyEditorComponent extends React.Component {
    render() {
      var ref, ref1;
      return H.div(null, _.includes(this.props.features, "table") ? R(ui.FormGroup, {
        label: "Table"
      }, R(ui.Select, {
        nullLabel: "Select...",
        value: this.props.property.table,
        onChange: (table) => {
          return this.props.onChange(_.extend({}, this.props.property, {
            table: table
          }));
        },
        options: _.map(this.props.tableIds, (tableId) => {
          var table;
          table = this.props.schema.getTable(tableId);
          return {
            value: table.id,
            label: ExprUtils.localizeString(table.name)
          };
        })
      })) : void 0, _.includes(this.props.features, "idField") ? R(IdFieldComponent, {
        value: this.props.property.id,
        onChange: (value) => {
          return this.props.onChange(_.extend({}, this.props.property, {
            id: value
          }));
        }
      }) : void 0, _.includes(this.props.features, "code") ? R(ui.FormGroup, {
        label: "Code"
      }, H.input({
        type: "text",
        className: "form-control",
        value: this.props.property.code,
        onChange: (ev) => {
          return this.props.onChange(_.extend({}, this.props.property, {
            code: ev.target.value
          }));
        }
      })) : void 0, R(ui.FormGroup, {
        label: "Name"
      }, R(LocalizedStringEditorComp, {
        value: this.props.property.name,
        onChange: (value) => {
          return this.props.onChange(_.extend({}, this.props.property, {
            name: value
          }));
        }
      })), R(ui.FormGroup, {
        label: "Description"
      }, R(LocalizedStringEditorComp, {
        value: this.props.property.desc,
        onChange: (value) => {
          return this.props.onChange(_.extend({}, this.props.property, {
            desc: value
          }));
        }
      })), R(ui.FormGroup, {
        label: "Type"
      }, H.select({
        className: "form-control",
        value: this.props.property.type,
        onChange: ((ev) => {
          return this.props.onChange(_.extend({}, this.props.property, {
            type: ev.target.value
          }));
        })
      }, H.option({
        key: "",
        value: ""
      }, ""), H.option({
        key: "text",
        value: "text"
      }, "Text"), H.option({
        key: "number",
        value: "number"
      }, "Number"), H.option({
        key: "boolean",
        value: "boolean"
      }, "Boolean"), H.option({
        key: "geometry",
        value: "geometry"
      }, "Geometry"), H.option({
        key: "enum",
        value: "enum"
      }, "Enum"), H.option({
        key: "enumset",
        value: "enumset"
      }, "Enum Set"), H.option({
        key: "date",
        value: "date"
      }, "Date"), H.option({
        key: "datetime",
        value: "datetime"
      }, "Datetime"), H.option({
        key: "text[]",
        value: "text[]"
      }, "Text Array"), H.option({
        key: "image",
        value: "image"
      }, "Image"), H.option({
        key: "imagelist",
        value: "imagelist"
      }, "Imagelist"), H.option({
        key: "json",
        value: "json"
      }, "JSON"), _.includes(this.props.features, "idType") && this.props.schema ? H.option({
        key: "id",
        value: "id"
      }, "Reference") : void 0, _.includes(this.props.features, "idType") && this.props.schema ? H.option({
        key: "id[]",
        value: "id[]"
      }, "Reference List") : void 0, _.includes(this.props.features, "joinType") ? H.option({
        key: "join",
        value: "join"
      }, "Join") : void 0)), (ref = this.props.property.type) === "enum" || ref === "enumset" ? R(ui.FormGroup, {
        label: "Values"
      }, R(EnumValuesEditorComponent, {
        value: this.props.property.enumValues,
        onChange: ((value) => {
          return this.props.onChange(_.extend({}, this.props.property, {
            enumValues: value
          }));
        })
      })) : void 0, _.includes(this.props.features, "expr") && this.props.property.type && (this.props.property.table || this.props.table) ? R(ui.FormGroup, {
        label: "Expression",
        hint: (!this.props.property.table ? "Leave blank unless this property is an expression" : void 0)
      }, R(ExprComponent, {
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        table: this.props.property.table || this.props.table,
        value: this.props.property.expr,
        types: [this.props.property.type],
        enumValues: this.props.property.enumValues,
        idTable: this.props.property.idTable,
        aggrStatuses: ["individual", "aggregate", "literal"],
        onChange: (expr) => {
          return this.props.onChange(_.extend({}, this.props.property, {
            expr: expr
          }));
        }
      })) : void 0, this.props.property.type === "join" ? R(ui.FormGroup, {
        label: "Join"
      }, R(JoinEditorComponent, {
        value: this.props.property.join,
        onChange: ((join) => {
          return this.props.onChange(_.extend({}, this.props.property, {
            join: join
          }));
        })
      })) : void 0, (ref1 = this.props.property.type) === "id" || ref1 === "id[]" ? R(ui.FormGroup, {
        label: "ID Table"
      }, R(TableSelectComponent, {
        value: this.props.property.idTable,
        schema: this.props.schema,
        onChange: ((table) => {
          return this.props.onChange(_.extend({}, this.props.property, {
            idTable: table
          }));
        })
      })) : void 0, R(ui.Checkbox, {
        value: this.props.property.deprecated,
        onChange: ((deprecated) => {
          return this.props.onChange(_.extend({}, this.props.property, {
            deprecated: deprecated
          }));
        })
      }, "Deprecated"), _.includes(this.props.features, "uniqueCode") && this.props.property.type === "text" ? R(ui.FormGroup, {
        label: "Unique Code?"
      }, H.input({
        type: 'checkbox',
        checked: this.props.property.uniqueCode,
        onChange: ((ev) => {
          return this.props.onChange(_.extend({}, this.props.property, {
            uniqueCode: ev.target.checked
          }));
        })
      })) : void 0, _.includes(this.props.features, "sql") ? R(ui.FormGroup, {
        label: "SQL"
      }, H.input({
        type: 'text',
        className: "form-control",
        value: this.props.property.sql,
        onChange: ((ev) => {
          return this.props.onChange(_.extend({}, this.props.property, {
            sql: ev.target.value
          }));
        })
      })) : void 0, this.props.createRoleEditElem ? R(ui.FormGroup, {
        label: "Roles"
      }, this.props.createRoleEditElem(this.props.property.roles || [], (roles) => {
        return this.props.onChange(_.extend({}, this.props.property, {
          roles: roles
        }));
      })) : void 0);
    }

  };

  PropertyEditorComponent.propTypes = {
    property: PropTypes.object.isRequired, // The property being edited
    onChange: PropTypes.func.isRequired, // Function called when anything is changed in the editor
    features: PropTypes.array, // Features to be enabled apart from the default features
    schema: PropTypes.object, // schema of all data
    dataSource: PropTypes.object, // data source
    table: PropTypes.string, // Table that properties are of. Not required if table feature is on
    tableIds: PropTypes.arrayOf(PropTypes.string.isRequired), // Ids of tables to include when using table feature
    createRoleEditElem: PropTypes.func
  };

  PropertyEditorComponent.defaultProps = {
    features: []
  };

  return PropertyEditorComponent;

}).call(this);

JoinEditorComponent = (function() {
  // Edits join
  class JoinEditorComponent extends React.Component {
    render() {
      var ref, ref1, ref2, ref3;
      return H.div(null, H.div({
        className: "row"
      }, H.div({
        className: "col-md-12"
      }, R(ui.FormGroup, {
        label: "Type"
      }, H.select({
        className: "form-control",
        value: (ref = this.props.value) != null ? ref.type : void 0,
        onChange: ((ev) => {
          return this.props.onChange(_.extend({}, this.props.value, {
            type: ev.target.value
          }));
        })
      }, H.option({
        key: "",
        value: ""
      }, ""), H.option({
        key: "1-n",
        value: "1-n"
      }, "One to many"), H.option({
        key: "n-1",
        value: "n-1"
      }, "Many to one"), H.option({
        key: "n-n",
        value: "n-n"
      }, "Many to many"), H.option({
        key: "1-1",
        value: "1-1"
      }, "one to one")))), H.div({
        className: "col-md-12"
      }, R(ui.FormGroup, {
        label: "To Table"
      }, H.input({
        type: 'text',
        className: "form-control",
        value: (ref1 = this.props.value) != null ? ref1.toTable : void 0,
        onChange: ((ev) => {
          return this.props.onChange(_.extend({}, this.props.value, {
            toTable: ev.target.value
          }));
        })
      }))), H.div({
        className: "col-md-12"
      }, R(ui.FormGroup, {
        label: "From Column"
      }, H.input({
        type: 'text',
        className: "form-control",
        value: (ref2 = this.props.value) != null ? ref2.fromColumn : void 0,
        onChange: ((ev) => {
          return this.props.onChange(_.extend({}, this.props.value, {
            fromColumn: ev.target.value
          }));
        })
      }))), H.div({
        className: "col-md-12"
      }, R(ui.FormGroup, {
        label: "To Column"
      }, H.input({
        type: 'text',
        className: "form-control",
        value: (ref3 = this.props.value) != null ? ref3.toColumn : void 0,
        onChange: ((ev) => {
          return this.props.onChange(_.extend({}, this.props.value, {
            toColumn: ev.target.value
          }));
        })
      })))));
    }

  };

  JoinEditorComponent.propTypes = {
    value: PropTypes.object, // The join object
    onChange: PropTypes.func.isRequired // Called with new value
  };

  return JoinEditorComponent;

}).call(this);

TableSelectComponent = (function() {
  // Reusable table select Component
  class TableSelectComponent extends React.Component {
    render() {
      return H.select({
        className: "form-control",
        value: this.props.value,
        onChange: ((ev) => {
          return this.props.onChange(ev.target.value);
        })
      }, _.map(this.props.schema.tables, (table) => {
        return H.option({
          key: table.id,
          value: table.id
        }, table.name[table.name._base || "en"]);
      }));
    }

  };

  TableSelectComponent.propTypes = {
    value: PropTypes.string, // The selected table
    schema: PropTypes.object.isRequired, // schema of all data
    onChange: PropTypes.func.isRequired // Called with new value
  };

  return TableSelectComponent;

}).call(this);

EnumValuesEditorComponent = (function() {
  // Edits a list of enum values
  class EnumValuesEditorComponent extends React.Component {
    constructor() {
      super(...arguments);
      this.handleChange = this.handleChange.bind(this);
      this.handleAdd = this.handleAdd.bind(this);
      this.handleRemove = this.handleRemove.bind(this);
    }

    handleChange(i, item) {
      var value;
      boundMethodCheck(this, EnumValuesEditorComponent);
      value = (this.props.value || []).slice();
      value[i] = item;
      return this.props.onChange(value);
    }

    handleAdd() {
      var value;
      boundMethodCheck(this, EnumValuesEditorComponent);
      value = (this.props.value || []).slice();
      value.push({
        id: "",
        name: {}
      });
      return this.props.onChange(value);
    }

    handleRemove(i) {
      var value;
      boundMethodCheck(this, EnumValuesEditorComponent);
      value = (this.props.value || []).slice();
      value.splice(i, 1);
      return this.props.onChange(value);
    }

    render() {
      return H.div(null, _.map(this.props.value || [], (value, i) => {
        return R(EnumValueEditorComponent, {
          key: i,
          value: value,
          onChange: this.handleChange.bind(null, i),
          onRemove: this.handleRemove.bind(null, i)
        });
      }), H.button({
        type: "button",
        className: "btn btn-link",
        onClick: this.handleAdd
      }, "+ Add Value"));
    }

  };

  EnumValuesEditorComponent.propTypes = {
    value: PropTypes.array, // Array of enum values to edit
    onChange: PropTypes.func.isRequired // Called with new value
  };

  return EnumValuesEditorComponent;

}).call(this);

EnumValueEditorComponent = (function() {
  
  // Edits an enum value (id, name)
  class EnumValueEditorComponent extends React.Component {
    render() {
      return H.div(null, H.div({
        className: "row"
      }, H.div({
        className: "col-md-6"
      }, R(IdFieldComponent, {
        value: this.props.value.id,
        onChange: (value) => {
          return this.props.onChange(_.extend({}, this.props.value, {
            id: value
          }));
        }
      })), H.div({
        className: "col-md-6"
      }, R(ui.FormGroup, {
        label: "Code"
      }, H.input({
        type: "text",
        className: "form-control",
        placeholder: "Code",
        style: {
          width: "10em"
        },
        value: this.props.value.code,
        onChange: (ev) => {
          return this.props.onChange(_.extend({}, this.props.value, {
            code: ev.target.value
          }));
        }
      })))), H.div({
        className: "row"
      }, H.div({
        className: "col-md-12"
      }, R(ui.FormGroup, {
        label: "Name"
      }, R(LocalizedStringEditorComp, {
        value: this.props.value.name,
        onChange: (value) => {
          return this.props.onChange(_.extend({}, this.props.value, {
            name: value
          }));
        }
      })))), H.div({
        className: "row"
      }, H.div({
        className: "col-md-12"
      }, R(ui.FormGroup, {
        label: "Description"
      }, R(LocalizedStringEditorComp, {
        value: this.props.value.desc,
        onChange: (value) => {
          return this.props.onChange(_.extend({}, this.props.value, {
            desc: value
          }));
        }
      })))), this.props.onRemove ? H.div({
        key: "remove"
      }, H.button({
        className: "btn btn-link btn-xs",
        onClick: this.props.onRemove
      }, "Remove")) : void 0);
    }

  };

  EnumValueEditorComponent.propTypes = {
    value: PropTypes.object,
    onChange: PropTypes.func.isRequired, // Called with new value
    onRemove: PropTypes.func
  };

  return EnumValueEditorComponent;

}).call(this);
