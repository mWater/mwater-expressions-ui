"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var EnumValueEditorComponent,
    EnumValuesEditorComponent,
    ExprComponent,
    ExprUtils,
    IdFieldComponent,
    JoinEditorComponent,
    LocalizedStringEditorComp,
    PropTypes,
    PropertyEditorComponent,
    R,
    React,
    TableSelectComponent,
    _,
    ui,
    indexOf = [].indexOf,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

PropTypes = require('prop-types');
React = require('react');
R = React.createElement;
_ = require('lodash');
ui = require('react-library/lib/bootstrap');
LocalizedStringEditorComp = require('../LocalizedStringEditorComp');
ExprComponent = require('../ExprComponent');
ExprUtils = require('mwater-expressions').ExprUtils;
IdFieldComponent = require('./IdFieldComponent');
JoinEditorComponent = require('./JoinEditorComponent').JoinEditorComponent; // Edit a single property

module.exports = PropertyEditorComponent = function () {
  var PropertyEditorComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2.default)(PropertyEditorComponent, _React$Component);

    function PropertyEditorComponent() {
      (0, _classCallCheck2.default)(this, PropertyEditorComponent);
      return (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(PropertyEditorComponent).apply(this, arguments));
    }

    (0, _createClass2.default)(PropertyEditorComponent, [{
      key: "render",
      value: function render() {
        var _this = this;

        var ref, ref1, ref2, ref3, ref4;
        return R('div', null, _.includes(this.props.features, "table") ? R(ui.FormGroup, {
          label: "Table"
        }, R(ui.Select, {
          nullLabel: "Select...",
          value: this.props.property.table,
          onChange: function onChange(table) {
            return _this.props.onChange(_.extend({}, _this.props.property, {
              table: table
            }));
          },
          options: _.map(this.props.tableIds, function (tableId) {
            var table;
            table = _this.props.schema.getTable(tableId);
            return {
              value: table.id,
              label: ExprUtils.localizeString(table.name)
            };
          })
        })) : void 0, _.includes(this.props.features, "idField") ? [R(IdFieldComponent, {
          value: this.props.property.id,
          onChange: function onChange(value) {
            return _this.props.onChange(_.extend({}, _this.props.property, {
              id: value
            }));
          }
        }), this.props.forbiddenPropertyIds && (ref = this.props.property.id, indexOf.call(this.props.forbiddenPropertyIds, ref) >= 0) ? R('div', {
          className: "alert alert-danger"
        }, "Duplicate IDs not allowed") : void 0] : void 0, _.includes(this.props.features, "code") ? R(ui.FormGroup, {
          label: "Code"
        }, R('input', {
          type: "text",
          className: "form-control",
          value: this.props.property.code,
          onChange: function onChange(ev) {
            return _this.props.onChange(_.extend({}, _this.props.property, {
              code: ev.target.value
            }));
          }
        })) : void 0, R(ui.FormGroup, {
          label: "Name"
        }, R(LocalizedStringEditorComp, {
          value: this.props.property.name,
          onChange: function onChange(value) {
            return _this.props.onChange(_.extend({}, _this.props.property, {
              name: value
            }));
          }
        })), R(ui.FormGroup, {
          label: "Description"
        }, R(LocalizedStringEditorComp, {
          value: this.props.property.desc,
          onChange: function onChange(value) {
            return _this.props.onChange(_.extend({}, _this.props.property, {
              desc: value
            }));
          }
        })), R(ui.FormGroup, {
          label: "Type"
        }, R('select', {
          className: "form-control",
          value: this.props.property.type,
          onChange: function onChange(ev) {
            return _this.props.onChange(_.extend({}, _this.props.property, {
              type: ev.target.value
            }));
          }
        }, R('option', {
          key: "",
          value: ""
        }, ""), R('option', {
          key: "text",
          value: "text"
        }, "Text"), R('option', {
          key: "number",
          value: "number"
        }, "Number"), R('option', {
          key: "boolean",
          value: "boolean"
        }, "Boolean"), R('option', {
          key: "geometry",
          value: "geometry"
        }, "Geometry"), R('option', {
          key: "enum",
          value: "enum"
        }, "Enum"), R('option', {
          key: "enumset",
          value: "enumset"
        }, "Enum Set"), R('option', {
          key: "date",
          value: "date"
        }, "Date"), R('option', {
          key: "datetime",
          value: "datetime"
        }, "Datetime"), R('option', {
          key: "text[]",
          value: "text[]"
        }, "Text Array"), R('option', {
          key: "image",
          value: "image"
        }, "Image"), R('option', {
          key: "imagelist",
          value: "imagelist"
        }, "Imagelist"), R('option', {
          key: "json",
          value: "json"
        }, "JSON"), _.includes(this.props.features, "idType") && this.props.schema ? R('option', {
          key: "id",
          value: "id"
        }, "Reference") : void 0, _.includes(this.props.features, "idType") && this.props.schema ? R('option', {
          key: "id[]",
          value: "id[]"
        }, "Reference List") : void 0, _.includes(this.props.features, "joinType") ? R('option', {
          key: "join",
          value: "join"
        }, "Join") : void 0, _.includes(this.props.features, "dataurlType") ? R('option', {
          key: "dataurl",
          value: "dataurl"
        }, "Data URL (inline file storage)") : void 0)), (ref1 = this.props.property.type) === "enum" || ref1 === "enumset" ? R(ui.FormGroup, {
          label: "Values"
        }, R(EnumValuesEditorComponent, {
          value: this.props.property.enumValues,
          onChange: function onChange(value) {
            return _this.props.onChange(_.extend({}, _this.props.property, {
              enumValues: value
            }));
          }
        })) : void 0, _.includes(this.props.features, "expr") && this.props.property.type && (this.props.property.table || this.props.table) ? R(ui.FormGroup, {
          label: "Expression",
          hint: !this.props.property.table ? "Leave blank unless this property is an expression" : void 0
        }, R(ExprComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: this.props.property.table || this.props.table,
          value: this.props.property.expr,
          types: [this.props.property.type],
          enumValues: this.props.property.enumValues,
          idTable: this.props.property.idTable,
          aggrStatuses: ["individual", "aggregate", "literal"],
          onChange: function onChange(expr) {
            return _this.props.onChange(_.extend({}, _this.props.property, {
              expr: expr
            }));
          }
        })) : void 0, _.includes(this.props.features, "conditionExpr") && (this.props.property.table || this.props.table) ? R(ui.FormGroup, {
          label: "Condition",
          hint: "Set this if field should be conditionally displayed"
        }, R(ExprComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: this.props.property.table || this.props.table,
          value: this.props.property.conditionExpr,
          types: ["boolean"],
          onChange: function onChange(conditionExpr) {
            return _this.props.onChange(_.extend({}, _this.props.property, {
              conditionExpr: conditionExpr
            }));
          }
        })) : void 0, this.props.property.type === "join" ? R(ui.FormGroup, {
          label: "Join"
        }, R(JoinEditorComponent, {
          join: this.props.property.join,
          onChange: function onChange(join) {
            return _this.props.onChange(_.extend({}, _this.props.property, {
              join: join
            }));
          },
          schema: this.props.schema,
          fromTableId: this.props.property.table || this.props.table
        })) : void 0, (ref2 = this.props.property.type) === "id" || ref2 === "id[]" ? R(ui.FormGroup, {
          label: "ID Table"
        }, R(TableSelectComponent, {
          value: this.props.property.idTable,
          schema: this.props.schema,
          onChange: function onChange(table) {
            return _this.props.onChange(_.extend({}, _this.props.property, {
              idTable: table
            }));
          }
        })) : void 0, R(ui.Checkbox, {
          value: this.props.property.deprecated,
          onChange: function onChange(deprecated) {
            return _this.props.onChange(_.extend({}, _this.props.property, {
              deprecated: deprecated
            }));
          }
        }, "Deprecated"), _.includes(this.props.features, "uniqueCode") && this.props.property.type === "text" ? R(ui.Checkbox, {
          value: this.props.property.uniqueCode,
          onChange: function onChange(value) {
            return _this.props.onChange(_.extend({}, _this.props.property, {
              uniqueCode: value
            }));
          }
        }, "Unique Code") : void 0, _.includes(this.props.features, "unique") && ((ref3 = this.props.property.type) === "text" || ref3 === "id") ? R(ui.Checkbox, {
          value: this.props.property.unique,
          onChange: function onChange(value) {
            return _this.props.onChange(_.extend({}, _this.props.property, {
              unique: value
            }));
          }
        }, "Unique Value") : void 0, _.includes(this.props.features, "onDelete") && (ref4 = this.props.property.type) === "id" ? R(ui.FormGroup, {
          label: "On Delete"
        }, R(ui.Select, {
          value: this.props.property.onDelete || null,
          nullLabel: "No Action",
          onChange: function onChange(value) {
            return _this.props.onChange(_.extend({}, _this.props.property, {
              onDelete: value || void 0
            }));
          },
          options: [{
            label: "Cascade",
            value: "cascade"
          }, {
            label: "Set Null",
            value: "set_null"
          }]
        })) : void 0, _.includes(this.props.features, "sql") ? R(ui.FormGroup, {
          label: "SQL"
        }, R('input', {
          type: 'text',
          className: "form-control",
          value: this.props.property.sql,
          onChange: function onChange(ev) {
            return _this.props.onChange(_.extend({}, _this.props.property, {
              sql: ev.target.value
            }));
          }
        })) : void 0, this.props.createRoleEditElem ? R(ui.FormGroup, {
          label: "Roles"
        }, this.props.createRoleEditElem(this.props.property.roles || [], function (roles) {
          return _this.props.onChange(_.extend({}, _this.props.property, {
            roles: roles
          }));
        })) : void 0);
      }
    }]);
    return PropertyEditorComponent;
  }(React.Component);

  ;
  PropertyEditorComponent.propTypes = {
    property: PropTypes.object.isRequired,
    // The property being edited
    onChange: PropTypes.func.isRequired,
    // Function called when anything is changed in the editor
    features: PropTypes.array,
    // Features to be enabled apart from the default features
    schema: PropTypes.object,
    // schema of all data
    dataSource: PropTypes.object,
    // data source
    table: PropTypes.string,
    // Table that properties are of. Not required if table feature is on
    tableIds: PropTypes.arrayOf(PropTypes.string.isRequired),
    // Ids of tables to include when using table feature
    createRoleEditElem: PropTypes.func,
    forbiddenPropertyIds: PropTypes.arrayOf(PropTypes.string.isRequired) // Ids of properties that are not allowed as would be duplicates

  };
  PropertyEditorComponent.defaultProps = {
    features: []
  };
  return PropertyEditorComponent;
}.call(void 0);

TableSelectComponent = function () {
  // Reusable table select Component
  var TableSelectComponent =
  /*#__PURE__*/
  function (_React$Component2) {
    (0, _inherits2.default)(TableSelectComponent, _React$Component2);

    function TableSelectComponent() {
      (0, _classCallCheck2.default)(this, TableSelectComponent);
      return (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(TableSelectComponent).apply(this, arguments));
    }

    (0, _createClass2.default)(TableSelectComponent, [{
      key: "render",
      value: function render() {
        var options;
        options = _.sortBy(_.map(this.props.schema.tables, function (table) {
          return {
            value: table.id,
            label: table.name[table.name._base || "en"] + " - " + table.id
          };
        }), "value");
        return R(ui.Select, {
          value: this.props.value,
          onChange: this.props.onChange,
          nullLabel: "Select table",
          options: options
        });
      }
    }]);
    return TableSelectComponent;
  }(React.Component);

  ;
  TableSelectComponent.propTypes = {
    value: PropTypes.string,
    // The selected table
    schema: PropTypes.object.isRequired,
    // schema of all data
    onChange: PropTypes.func.isRequired // Called with new value

  };
  return TableSelectComponent;
}.call(void 0);

EnumValuesEditorComponent = function () {
  // Edits a list of enum values
  var EnumValuesEditorComponent =
  /*#__PURE__*/
  function (_React$Component3) {
    (0, _inherits2.default)(EnumValuesEditorComponent, _React$Component3);

    function EnumValuesEditorComponent() {
      var _this2;

      (0, _classCallCheck2.default)(this, EnumValuesEditorComponent);
      _this2 = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(EnumValuesEditorComponent).apply(this, arguments));
      _this2.handleChange = _this2.handleChange.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this2)));
      _this2.handleAdd = _this2.handleAdd.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this2)));
      _this2.handleRemove = _this2.handleRemove.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this2)));
      return _this2;
    }

    (0, _createClass2.default)(EnumValuesEditorComponent, [{
      key: "handleChange",
      value: function handleChange(i, item) {
        var value;
        boundMethodCheck(this, EnumValuesEditorComponent);
        value = (this.props.value || []).slice();
        value[i] = item;
        return this.props.onChange(value);
      }
    }, {
      key: "handleAdd",
      value: function handleAdd() {
        var value;
        boundMethodCheck(this, EnumValuesEditorComponent);
        value = (this.props.value || []).slice();
        value.push({
          id: "",
          name: {}
        });
        return this.props.onChange(value);
      }
    }, {
      key: "handleRemove",
      value: function handleRemove(i) {
        var value;
        boundMethodCheck(this, EnumValuesEditorComponent);
        value = (this.props.value || []).slice();
        value.splice(i, 1);
        return this.props.onChange(value);
      }
    }, {
      key: "render",
      value: function render() {
        var _this3 = this;

        return R('div', null, _.map(this.props.value || [], function (value, i) {
          return R(EnumValueEditorComponent, {
            key: i,
            value: value,
            onChange: _this3.handleChange.bind(null, i),
            onRemove: _this3.handleRemove.bind(null, i)
          });
        }), R('button', {
          type: "button",
          className: "btn btn-link",
          onClick: this.handleAdd
        }, "+ Add Value"));
      }
    }]);
    return EnumValuesEditorComponent;
  }(React.Component);

  ;
  EnumValuesEditorComponent.propTypes = {
    value: PropTypes.array,
    // Array of enum values to edit
    onChange: PropTypes.func.isRequired // Called with new value

  };
  return EnumValuesEditorComponent;
}.call(void 0);

EnumValueEditorComponent = function () {
  // Edits an enum value (id, name)
  var EnumValueEditorComponent =
  /*#__PURE__*/
  function (_React$Component4) {
    (0, _inherits2.default)(EnumValueEditorComponent, _React$Component4);

    function EnumValueEditorComponent() {
      (0, _classCallCheck2.default)(this, EnumValueEditorComponent);
      return (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(EnumValueEditorComponent).apply(this, arguments));
    }

    (0, _createClass2.default)(EnumValueEditorComponent, [{
      key: "render",
      value: function render() {
        var _this4 = this;

        return R('div', null, R('div', {
          className: "row"
        }, R('div', {
          className: "col-md-6"
        }, R(IdFieldComponent, {
          value: this.props.value.id,
          onChange: function onChange(value) {
            return _this4.props.onChange(_.extend({}, _this4.props.value, {
              id: value
            }));
          }
        })), R('div', {
          className: "col-md-6"
        }, R(ui.FormGroup, {
          label: "Code"
        }, R('input', {
          type: "text",
          className: "form-control",
          placeholder: "Code",
          style: {
            width: "10em"
          },
          value: this.props.value.code,
          onChange: function onChange(ev) {
            return _this4.props.onChange(_.extend({}, _this4.props.value, {
              code: ev.target.value
            }));
          }
        })))), R('div', {
          className: "row"
        }, R('div', {
          className: "col-md-12"
        }, R(ui.FormGroup, {
          label: "Name"
        }, R(LocalizedStringEditorComp, {
          value: this.props.value.name,
          onChange: function onChange(value) {
            return _this4.props.onChange(_.extend({}, _this4.props.value, {
              name: value
            }));
          }
        })))), R('div', {
          className: "row"
        }, R('div', {
          className: "col-md-12"
        }, R(ui.FormGroup, {
          label: "Description"
        }, R(LocalizedStringEditorComp, {
          value: this.props.value.desc,
          onChange: function onChange(value) {
            return _this4.props.onChange(_.extend({}, _this4.props.value, {
              desc: value
            }));
          }
        })))), this.props.onRemove ? R('div', {
          key: "remove"
        }, R('button', {
          className: "btn btn-link btn-xs",
          onClick: this.props.onRemove
        }, "Remove")) : void 0);
      }
    }]);
    return EnumValueEditorComponent;
  }(React.Component);

  ;
  EnumValueEditorComponent.propTypes = {
    value: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    // Called with new value
    onRemove: PropTypes.func
  };
  return EnumValueEditorComponent;
}.call(void 0);