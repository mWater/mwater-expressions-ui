"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var ExprCleaner,
    ExprComponent,
    ExprElementBuilder,
    PropTypes,
    R,
    React,
    _,
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
ExprCleaner = require("mwater-expressions").ExprCleaner;
ExprElementBuilder = require('./ExprElementBuilder'); // Display/editor component for an expression
// Uses ExprElementBuilder to create the tree of components
// Cleans expression as a convenience

module.exports = ExprComponent = function () {
  var ExprComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2.default)(ExprComponent, _React$Component);

    function ExprComponent() {
      var _this;

      (0, _classCallCheck2.default)(this, ExprComponent);
      _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(ExprComponent).apply(this, arguments)); // Opens the editor popup. Only works if expression is blank

      _this.openEditor = _this.openEditor.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this))); // Clean expression and pass up

      _this.handleChange = _this.handleChange.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      return _this;
    }

    (0, _createClass2.default)(ExprComponent, [{
      key: "openEditor",
      value: function openEditor() {
        var ref;
        boundMethodCheck(this, ExprComponent);
        return (ref = this.exprLink) != null ? ref.showModal() : void 0;
      }
    }, {
      key: "handleChange",
      value: function handleChange(expr) {
        boundMethodCheck(this, ExprComponent);
        return this.props.onChange(this.cleanExpr(expr));
      } // Cleans an expression

    }, {
      key: "cleanExpr",
      value: function cleanExpr(expr) {
        return new ExprCleaner(this.props.schema, this.props.variables).cleanExpr(expr, {
          table: this.props.table,
          types: this.props.types,
          enumValueIds: this.props.enumValues ? _.pluck(this.props.enumValues, "id") : void 0,
          idTable: this.props.idTable,
          aggrStatuses: !this.props.table ? ["literal"] : this.props.aggrStatuses
        });
      }
    }, {
      key: "render",
      value: function render() {
        var _this2 = this;

        var expr;
        expr = this.cleanExpr(this.props.value);
        return new ExprElementBuilder(this.props.schema, this.props.dataSource, this.context.locale, this.props.variables).build(expr, this.props.table, this.props.onChange ? this.handleChange : void 0, {
          types: this.props.types,
          enumValues: this.props.enumValues,
          preferLiteral: this.props.preferLiteral,
          idTable: this.props.idTable,
          includeAggr: indexOf.call(this.props.aggrStatuses, "aggregate") >= 0,
          aggrStatuses: !this.props.table ? ["literal"] : this.props.aggrStatuses,
          placeholder: this.props.placeholder,
          // If no expression, pass a ref to use so that the expression editor can be opened
          exprLinkRef: !expr ? function (c) {
            return _this2.exprLink = c;
          } : void 0
        });
      }
    }]);
    return ExprComponent;
  }(React.Component);

  ;
  ExprComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    // Data source to use to get values
    table: PropTypes.string,
    // Current table. null for literal only
    value: PropTypes.object,
    // Current expression value
    onChange: PropTypes.func,
    // Called with new expression
    variables: PropTypes.array,
    // Array of variables to allow selecting
    types: PropTypes.array,
    // If specified, the types (value type) of expression required. e.g. ["boolean"]
    enumValues: PropTypes.array,
    // Array of { id:, name: } of enum values that can be selected. Only when type = "enum"
    idTable: PropTypes.string,
    // If specified the table from which id-type expressions must come
    preferLiteral: PropTypes.bool,
    // True to prefer literal expressions
    aggrStatuses: PropTypes.array,
    // statuses of aggregation to allow. list of "individual", "literal", "aggregate". Default: ["individual", "literal"] or ["literal"] for no table
    placeholder: PropTypes.string // placeholder for empty value

  };
  ExprComponent.defaultProps = {
    aggrStatuses: ["individual", "literal"]
  };
  ExprComponent.contextTypes = {
    locale: PropTypes.string // e.g. "en"

  };
  return ExprComponent;
}.call(void 0);