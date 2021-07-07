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

var DateTimePickerComponent,
    EnumAsListComponent,
    EnumComponent,
    EnumsetAsListComponent,
    ExprUtils,
    IdLiteralComponent,
    PropTypes,
    R,
    React,
    SelectLiteralExprComponent,
    TextArrayComponent,
    Toggle,
    _,
    moment,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
},
    indexOf = [].indexOf;

PropTypes = require('prop-types');
_ = require('lodash');
React = require('react');
R = React.createElement;
moment = require('moment');
ExprUtils = require('mwater-expressions').ExprUtils;
DateTimePickerComponent = require('./DateTimePickerComponent');
TextArrayComponent = require('./TextArrayComponent');
IdLiteralComponent = require('./IdLiteralComponent');
Toggle = require('react-library/lib/bootstrap').Toggle;

module.exports = SelectLiteralExprComponent = function () {
  var SelectLiteralExprComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(SelectLiteralExprComponent, _React$Component);

    var _super = _createSuper(SelectLiteralExprComponent);

    function SelectLiteralExprComponent(props) {
      var _this;

      (0, _classCallCheck2["default"])(this, SelectLiteralExprComponent);
      var ref;
      _this = _super.call(this, props);
      _this.handleChange = _this.handleChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleDateSelected = _this.handleDateSelected.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleDateTimeSelected = _this.handleDateTimeSelected.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleAccept = _this.handleAccept.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleTextChange = _this.handleTextChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.state = {
        value: props.value,
        inputText: null,
        // Unparsed input text. Null if not used
        changed: false,
        inputTextError: false
      }; // Set input text to value if text/number

      if (props.value && ((ref = props.value.valueType) === 'text' || ref === 'number')) {
        _this.state.inputText = "" + props.value.value;
      }

      return _this;
    }

    (0, _createClass2["default"])(SelectLiteralExprComponent, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        var ref;
        return (ref = this.inputComp) != null ? ref.focus() : void 0;
      }
    }, {
      key: "handleChange",
      value: function handleChange(value) {
        boundMethodCheck(this, SelectLiteralExprComponent);
        return this.setState({
          value: value,
          changed: true,
          inputText: null
        });
      }
    }, {
      key: "handleDateSelected",
      value: function handleDateSelected(date) {
        boundMethodCheck(this, SelectLiteralExprComponent);

        if (date) {
          return this.setState({
            value: {
              type: "literal",
              valueType: "date",
              value: date.format("YYYY-MM-DD")
            },
            changed: true
          });
        } else {
          return this.setState({
            value: null,
            changed: true
          });
        }
      }
    }, {
      key: "handleDateTimeSelected",
      value: function handleDateTimeSelected(datetime) {
        boundMethodCheck(this, SelectLiteralExprComponent);

        if (datetime) {
          return this.setState({
            value: {
              type: "literal",
              valueType: "datetime",
              value: datetime.toISOString()
            },
            changed: true
          });
        } else {
          return this.setState({
            value: null,
            changed: true
          });
        }
      }
    }, {
      key: "handleAccept",
      value: function handleAccept() {
        var value;
        boundMethodCheck(this, SelectLiteralExprComponent); // Parse text value if text

        if (this.state.inputText != null) {
          // Empty means no value
          if (this.state.inputText === "") {
            this.props.onChange(null);
            return;
          } // Prefer number over text if can be parsed as number


          if ((this.props.value && this.props.value.valueType === "number" || indexOf.call(this.props.types || ['number'], "number") >= 0) && this.state.inputText.match(/^-?\d+(\.\d+)?$/)) {
            value = parseFloat(this.state.inputText);
            return this.props.onChange({
              type: "literal",
              valueType: "number",
              value: value
            }); // If text
          } else if (this.props.value && this.props.value.valueType === "text" || indexOf.call(this.props.types || ['text'], "text") >= 0) {
            return this.props.onChange({
              type: "literal",
              valueType: "text",
              value: this.state.inputText
            }); // If id (only allow if idTable is explicit)
          } else if (indexOf.call(this.props.types || ['id'], "id") >= 0 && this.props.idTable) {
            return this.props.onChange({
              type: "literal",
              valueType: "id",
              idTable: this.props.idTable,
              value: this.state.inputText
            });
          } else {
            // Set error condition
            return this.setState({
              inputTextError: true
            });
          }
        } else {
          return this.props.onChange(this.state.value);
        }
      }
    }, {
      key: "handleTextChange",
      value: function handleTextChange(ev) {
        boundMethodCheck(this, SelectLiteralExprComponent);
        return this.setState({
          inputText: ev.target.value,
          changed: true
        });
      } // Render a text box for inputting text/number

    }, {
      key: "renderTextBox",
      value: function renderTextBox() {
        return R('div', {
          className: this.state.inputTextError ? "has-error" : void 0
        }, R('input', {
          type: "text",
          className: "form-control",
          value: this.state.inputText || "",
          onChange: this.handleTextChange,
          placeholder: "Enter value..."
        }));
      }
    }, {
      key: "renderInput",
      value: function renderInput() {
        var _this2 = this;

        var expr, exprType, exprUtils, idTable;
        expr = this.state.value; // Get current expression type

        exprUtils = new ExprUtils(this.props.schema);
        exprType = exprUtils.getExprType(expr); // If boolean, use Toggle

        if (exprType === "boolean" || _.isEqual(this.props.types, ["boolean"])) {
          return R(Toggle, {
            value: expr != null ? expr.value : void 0,
            allowReset: true,
            options: [{
              value: false,
              label: "False"
            }, {
              value: true,
              label: "True"
            }],
            onChange: function onChange(value) {
              return _this2.handleChange(value != null ? {
                type: "literal",
                valueType: "boolean",
                value: value
              } : null);
            }
          });
        } // If text[], enumset or id literal, use special component


        if (exprType === "text[]" || _.isEqual(this.props.types, ["text[]"])) {
          return R(TextArrayComponent, {
            value: expr,
            refExpr: this.props.refExpr,
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            onChange: this.handleChange
          });
        }

        if (exprType === "enum" || _.isEqual(this.props.types, ["enum"])) {
          return R(EnumAsListComponent, {
            value: expr,
            enumValues: this.props.enumValues,
            onChange: this.handleChange
          });
        }

        if (exprType === "enumset" || _.isEqual(this.props.types, ["enumset"])) {
          return R(EnumsetAsListComponent, {
            value: expr,
            enumValues: this.props.enumValues,
            onChange: this.handleChange
          });
        }

        if (exprType === "id" || _.isEqual(this.props.types, ["id"]) && this.props.idTable) {
          idTable = this.props.idTable || exprUtils.getExprIdTable(expr);
          return R(IdLiteralComponent, {
            value: expr != null ? expr.value : void 0,
            idTable: idTable,
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            onChange: function onChange(value) {
              return _this2.handleChange(value ? {
                type: "literal",
                valueType: "id",
                idTable: idTable,
                value: value
              } : null);
            }
          });
        }

        if (exprType === "id[]" || _.isEqual(this.props.types, ["id[]"]) && this.props.idTable) {
          idTable = this.props.idTable || exprUtils.getExprIdTable(expr);
          return R(IdLiteralComponent, {
            value: expr != null ? expr.value : void 0,
            idTable: idTable,
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            multi: true,
            onChange: function onChange(value) {
              return _this2.handleChange(value && value.length > 0 ? {
                type: "literal",
                valueType: "id[]",
                idTable: idTable,
                value: value
              } : null);
            }
          });
        } // If already text/number, or text/number accepted, render field


        if (exprType === 'text' || exprType === 'number' || !this.props.types || indexOf.call(this.props.types, "text") >= 0 || indexOf.call(this.props.types, "number") >= 0) {
          return this.renderTextBox();
        } // If date type, display control


        if (this.props.value && this.props.value.valueType === "date" || indexOf.call(this.props.types || [], "date") >= 0) {
          return R(DateTimePickerComponent, {
            date: this.state.value ? moment(this.state.value.value, moment.ISO_8601) : void 0,
            onChange: this.handleDateSelected
          });
        } // If datetime type, display control


        if (this.props.value && this.props.value.valueType === "datetime" || indexOf.call(this.props.types || [], "datetime") >= 0) {
          return R(DateTimePickerComponent, {
            date: this.state.value ? moment(this.state.value.value, moment.ISO_8601) : void 0,
            timepicker: true,
            onChange: this.handleDateTimeSelected
          });
        }

        return R('div', {
          className: "text-warning"
        }, "Literal input not supported for this type");
      }
    }, {
      key: "render",
      value: function render() {
        return R('div', null, R('div', {
          style: {
            paddingBottom: 10
          }
        }, R('button', {
          type: "button",
          className: "btn btn-primary",
          onClick: this.handleAccept,
          disabled: !this.state.changed
        }, R('i', {
          className: "fa fa-check"
        }), " OK"), " ", R('button', {
          type: "button",
          className: "btn btn-default",
          onClick: this.props.onCancel
        }, "Cancel")), this.renderInput());
      }
    }]);
    return SelectLiteralExprComponent;
  }(React.Component);

  ;
  SelectLiteralExprComponent.propTypes = {
    value: PropTypes.object,
    // Current expression value
    onChange: PropTypes.func.isRequired,
    // Called with new expression
    onCancel: PropTypes.func.isRequired,
    // Called to cancel
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    // Props to narrow down choices
    types: PropTypes.array,
    // If specified, the types (value type) of expression required. e.g. ["boolean"]
    enumValues: PropTypes.array,
    // Array of { id:, name: } of enum values that can be selected. Only when type = "enum"
    idTable: PropTypes.string,
    // If specified the table from which id-type expressions must come
    refExpr: PropTypes.object // expression to get values for (used for literals). This is primarily for text fields to allow easy selecting of literal values

  };
  return SelectLiteralExprComponent;
}.call(void 0);

EnumAsListComponent = function () {
  // Component which displays an enum as a list
  var EnumAsListComponent = /*#__PURE__*/function (_React$Component2) {
    (0, _inherits2["default"])(EnumAsListComponent, _React$Component2);

    var _super2 = _createSuper(EnumAsListComponent);

    function EnumAsListComponent() {
      var _this3;

      (0, _classCallCheck2["default"])(this, EnumAsListComponent);
      _this3 = _super2.apply(this, arguments);
      _this3.handleChange = _this3.handleChange.bind((0, _assertThisInitialized2["default"])(_this3));
      return _this3;
    }

    (0, _createClass2["default"])(EnumAsListComponent, [{
      key: "handleChange",
      value: function handleChange(val) {
        boundMethodCheck(this, EnumAsListComponent);

        if (!val) {
          return this.props.onChange(null);
        } else {
          return this.props.onChange({
            type: "literal",
            valueType: "enum",
            value: val
          });
        }
      }
    }, {
      key: "render",
      value: function render() {
        var _this4 = this;

        var itemStyle, ref, value;
        value = (ref = this.props.value) != null ? ref.value : void 0;
        itemStyle = {
          padding: 4,
          marginLeft: 5,
          borderRadius: 4,
          cursor: "pointer"
        };
        return R('div', null, _.map(this.props.enumValues, function (val) {
          return R('div', {
            key: val.id,
            className: "hover-grey-background",
            style: itemStyle,
            onClick: _this4.handleChange.bind(null, val.id)
          }, val.id === value ? R('i', {
            className: "fa fa-fw fa-check",
            style: {
              color: "#2E6DA4"
            }
          }) : R('i', {
            className: "fa fa-fw"
          }), " ", ExprUtils.localizeString(val.name, _this4.context.locale));
        }));
      }
    }]);
    return EnumAsListComponent;
  }(React.Component);

  ;
  EnumAsListComponent.propTypes = {
    value: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    enumValues: PropTypes.array.isRequired // Array of id and name (localized string)

  };
  EnumAsListComponent.contextTypes = {
    locale: PropTypes.string // e.g. "en"

  };
  return EnumAsListComponent;
}.call(void 0);

EnumsetAsListComponent = function () {
  // Component which displays an enumset as a list
  var EnumsetAsListComponent = /*#__PURE__*/function (_React$Component3) {
    (0, _inherits2["default"])(EnumsetAsListComponent, _React$Component3);

    var _super3 = _createSuper(EnumsetAsListComponent);

    function EnumsetAsListComponent() {
      var _this5;

      (0, _classCallCheck2["default"])(this, EnumsetAsListComponent);
      _this5 = _super3.apply(this, arguments);
      _this5.handleToggle = _this5.handleToggle.bind((0, _assertThisInitialized2["default"])(_this5));
      return _this5;
    }

    (0, _createClass2["default"])(EnumsetAsListComponent, [{
      key: "handleToggle",
      value: function handleToggle(val) {
        var items, ref;
        boundMethodCheck(this, EnumsetAsListComponent);
        items = ((ref = this.props.value) != null ? ref.value : void 0) || [];

        if (indexOf.call(items, val) >= 0) {
          items = _.without(items, val);
        } else {
          items = items.concat([val]);
        }

        if (items.length === 0) {
          return this.props.onChange(null);
        } else {
          return this.props.onChange({
            type: "literal",
            valueType: "enumset",
            value: items
          });
        }
      }
    }, {
      key: "render",
      value: function render() {
        var _this6 = this;

        var itemStyle, items, ref;
        items = ((ref = this.props.value) != null ? ref.value : void 0) || [];
        itemStyle = {
          padding: 4,
          marginLeft: 5,
          borderRadius: 4,
          cursor: "pointer"
        };
        return R('div', null, _.map(this.props.enumValues, function (val) {
          var ref1;
          return R('div', {
            key: val.id,
            className: "hover-grey-background",
            style: itemStyle,
            onClick: _this6.handleToggle.bind(null, val.id)
          }, (ref1 = val.id, indexOf.call(items, ref1) >= 0) ? R('i', {
            className: "fa fa-fw fa-check-square",
            style: {
              color: "#2E6DA4"
            }
          }) : R('i', {
            className: "fa fa-fw fa-square",
            style: {
              color: "#DDDDDD"
            }
          }), " ", ExprUtils.localizeString(val.name, _this6.context.locale));
        }));
      }
    }]);
    return EnumsetAsListComponent;
  }(React.Component);

  ;
  EnumsetAsListComponent.propTypes = {
    value: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    enumValues: PropTypes.array.isRequired // Array of id and name (localized string)

  };
  EnumsetAsListComponent.contextTypes = {
    locale: PropTypes.string // e.g. "en"

  };
  return EnumsetAsListComponent;
}.call(void 0);

EnumComponent = function () {
  // Component which displays an enum dropdown
  var EnumComponent = /*#__PURE__*/function (_React$Component4) {
    (0, _inherits2["default"])(EnumComponent, _React$Component4);

    var _super4 = _createSuper(EnumComponent);

    function EnumComponent() {
      var _this7;

      (0, _classCallCheck2["default"])(this, EnumComponent);
      _this7 = _super4.apply(this, arguments);
      _this7.handleChange = _this7.handleChange.bind((0, _assertThisInitialized2["default"])(_this7));
      return _this7;
    }

    (0, _createClass2["default"])(EnumComponent, [{
      key: "handleChange",
      value: function handleChange(val) {
        boundMethodCheck(this, EnumComponent);

        if (!val) {
          return this.props.onChange(null);
        } else {
          return this.props.onChange({
            type: "literal",
            valueType: "enum",
            value: JSON.parse(val)
          });
        }
      }
    }, {
      key: "render",
      value: function render() {
        var _this8 = this;

        var options, value;
        value = this.props.value.value; // Use JSON to allow non-strings as ids

        options = _.map(this.props.enumValues, function (val) {
          return {
            value: JSON.stringify(val.id),
            label: ExprUtils.localizeString(val.name, _this8.context.locale)
          };
        });
        return R('div', {
          style: {
            width: "100%"
          }
        }, React.createElement(ReactSelect, {
          value: value,
          multi: false,
          options: options,
          onChange: this.handleChange
        }));
      }
    }]);
    return EnumComponent;
  }(React.Component);

  ;
  EnumComponent.propTypes = {
    value: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    enumValues: PropTypes.array.isRequired // Array of id and name (localized string)

  };
  EnumComponent.contextTypes = {
    locale: PropTypes.string // e.g. "en"

  };
  return EnumComponent;
}.call(void 0);