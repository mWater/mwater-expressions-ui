"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var ExprUtils,
    ModalWindowComponent,
    PropTypes,
    R,
    React,
    SelectExprModalComponent,
    SelectFieldExprComponent,
    SelectFormulaExprComponent,
    SelectLiteralExprComponent,
    SelectVariableExprComponent,
    TabbedComponent,
    _,
    indexOf = [].indexOf;

PropTypes = require('prop-types');
_ = require('lodash');
React = require('react');
R = React.createElement;
ExprUtils = require("mwater-expressions").ExprUtils;
ModalWindowComponent = require('react-library/lib/ModalWindowComponent');
TabbedComponent = require('react-library/lib/TabbedComponent');
SelectFieldExprComponent = require('./SelectFieldExprComponent');
SelectFormulaExprComponent = require('./SelectFormulaExprComponent');
SelectLiteralExprComponent = require('./SelectLiteralExprComponent');
SelectVariableExprComponent = require('./SelectVariableExprComponent');

module.exports = SelectExprModalComponent = function () {
  var SelectExprModalComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(SelectExprModalComponent, _React$Component);

    var _super = _createSuper(SelectExprModalComponent);

    function SelectExprModalComponent() {
      (0, _classCallCheck2["default"])(this, SelectExprModalComponent);
      return _super.apply(this, arguments);
    }

    (0, _createClass2["default"])(SelectExprModalComponent, [{
      key: "renderContents",
      value: function renderContents() {
        var table, tabs;
        table = this.props.table ? this.props.schema.getTable(this.props.table) : void 0;
        tabs = [];

        if (table) {
          tabs.push({
            id: "field",
            label: [R('i', {
              className: "fa fa-table"
            }), " ".concat(ExprUtils.localizeString(table.name, this.context.locale), " Field")],
            elem: R(SelectFieldExprComponent, {
              schema: this.props.schema,
              dataSource: this.props.dataSource,
              variables: this.props.variables,
              onChange: this.props.onSelect,
              table: this.props.table,
              types: this.props.types,
              allowCase: this.props.allowCase,
              enumValues: this.props.enumValues,
              idTable: this.props.idTable,
              aggrStatuses: this.props.aggrStatuses
            })
          });
        }

        if (table || indexOf.call(this.props.aggrStatuses, "literal") >= 0) {
          tabs.push({
            id: "formula",
            label: [R('i', {
              className: "fa fa-calculator"
            }), " Formula"],
            elem: R(SelectFormulaExprComponent, {
              table: this.props.table,
              onChange: this.props.onSelect,
              types: this.props.types,
              allowCase: this.props.allowCase,
              aggrStatuses: this.props.aggrStatuses,
              enumValues: this.props.enumValues
            })
          });
        }

        if (indexOf.call(this.props.aggrStatuses, "literal") >= 0) {
          tabs.push({
            id: "literal",
            label: [R('i', {
              className: "fa fa-pencil"
            }), " Value"],
            elem: R(SelectLiteralExprComponent, {
              value: this.props.value,
              onChange: this.props.onSelect,
              onCancel: this.props.onCancel,
              schema: this.props.schema,
              dataSource: this.props.dataSource,
              types: this.props.types,
              enumValues: this.props.enumValues,
              idTable: this.props.idTable,
              refExpr: this.props.refExpr
            })
          });
        }

        if (_.find(this.props.variables, function (v) {
          return !v.table;
        }) && indexOf.call(this.props.aggrStatuses, "literal") >= 0) {
          tabs.push({
            id: "variables",
            label: ["Variables"],
            elem: R(SelectVariableExprComponent, {
              value: this.props.value,
              variables: this.props.variables,
              onChange: this.props.onSelect,
              types: this.props.types,
              enumValues: this.props.enumValues,
              idTable: this.props.idTable
            })
          });
        }

        return R('div', null, R('h3', {
          style: {
            marginTop: 0
          }
        }, "Select Field, Formula or Value"), R(TabbedComponent, {
          tabs: tabs,
          initialTabId: table ? this.props.initialMode : "literal"
        }));
      }
    }, {
      key: "render",
      value: function render() {
        return R(ModalWindowComponent, {
          isOpen: true,
          onRequestClose: this.props.onCancel
        }, this.renderContents());
      }
    }]);
    return SelectExprModalComponent;
  }(React.Component);

  ;
  SelectExprModalComponent.propTypes = {
    onSelect: PropTypes.func.isRequired,
    // Called with new expression
    onCancel: PropTypes.func.isRequired,
    // Modal was cancelled
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    // Data source to use to get values
    variables: PropTypes.array.isRequired,
    table: PropTypes.string,
    // Current table. If none, then literal-only
    value: PropTypes.object,
    // Current expression value
    // Props to narrow down choices
    types: PropTypes.array,
    // If specified, the types (value type) of expression required. e.g. ["boolean"]
    enumValues: PropTypes.array,
    // Array of { id:, name: } of enum values that can be selected. Only when type = "enum"
    idTable: PropTypes.string,
    // If specified the table from which id-type expressions must come
    initialMode: PropTypes.oneOf(['field', 'formula', 'literal' // Initial mode. Default "field" unless no table, then "literal"
    ]),
    allowCase: PropTypes.bool,
    // Allow case statements
    aggrStatuses: PropTypes.array,
    // statuses of aggregation to allow. list of "individual", "literal", "aggregate". Default: ["individual", "literal"]
    refExpr: PropTypes.object,
    // expression to get values for (used for literals). This is primarily for text fields to allow easy selecting of literal values
    placeholder: PropTypes.string // Placeholder text (default Select...)

  };
  SelectExprModalComponent.contextTypes = {
    locale: PropTypes.string // e.g. "en"

  };
  SelectExprModalComponent.defaultProps = {
    placeholder: "Select...",
    initialMode: "field",
    aggrStatuses: ['individual', 'literal']
  };
  return SelectExprModalComponent;
}.call(void 0);