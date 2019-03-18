"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var ExprLinkComponent,
    ExprUtils,
    LinkComponent,
    LiteralExprStringComponent,
    PropTypes,
    R,
    React,
    SelectExprModalComponent,
    _,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

PropTypes = require('prop-types');
_ = require('lodash');
React = require('react');
R = React.createElement;
SelectExprModalComponent = require('./SelectExprModalComponent');
LinkComponent = require('./LinkComponent');
ExprUtils = require("mwater-expressions").ExprUtils;
LiteralExprStringComponent = require('./LiteralExprStringComponent'); // Allows user to select an expression or display an existing one. Shows as a link

module.exports = ExprLinkComponent = function () {
  var ExprLinkComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2.default)(ExprLinkComponent, _React$Component);

    function ExprLinkComponent(props) {
      var _this;

      (0, _classCallCheck2.default)(this, ExprLinkComponent);
      _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(ExprLinkComponent).call(this, props)); // Opens the editor modal

      _this.showModal = _this.showModal.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleClick = _this.handleClick.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this))); // Display placeholder if no value. If readonly, use "None" instead of "Select..."

      _this.renderNone = _this.renderNone.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this))); // Display summary if field

      _this.renderField = _this.renderField.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.renderLiteral = _this.renderLiteral.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.state = {
        modalVisible: false
      };
      return _this;
    }

    (0, _createClass2.default)(ExprLinkComponent, [{
      key: "showModal",
      value: function showModal() {
        boundMethodCheck(this, ExprLinkComponent);
        return this.setState({
          modalVisible: true
        });
      }
    }, {
      key: "handleClick",
      value: function handleClick() {
        boundMethodCheck(this, ExprLinkComponent);
        return this.setState({
          modalVisible: true
        });
      }
    }, {
      key: "renderNone",
      value: function renderNone() {
        boundMethodCheck(this, ExprLinkComponent);
        return R('a', {
          onClick: this.handleClick,
          style: {
            cursor: "pointer",
            fontStyle: "italic",
            color: "#478"
          }
        }, this.props.onChange ? this.props.placeholder : "None");
      }
    }, {
      key: "renderField",
      value: function renderField() {
        var _this2 = this;

        var exprUtils;
        boundMethodCheck(this, ExprLinkComponent);
        exprUtils = new ExprUtils(this.props.schema);
        return R(LinkComponent, {
          dropdownItems: this.props.onChange ? [{
            id: "edit",
            name: [R('i', {
              className: "fa fa-pencil text-muted"
            }), " Edit"]
          }, {
            id: "remove",
            name: [R('i', {
              className: "fa fa-remove text-muted"
            }), " Remove"]
          }] : void 0,
          onDropdownItemClicked: function onDropdownItemClicked(id) {
            if (id === "edit") {
              return _this2.setState({
                modalVisible: true
              });
            } else {
              return _this2.props.onChange(null);
            }
          }
        }, exprUtils.summarizeExpr(this.props.value));
      }
    }, {
      key: "renderLiteral",
      value: function renderLiteral() {
        var _this3 = this;

        boundMethodCheck(this, ExprLinkComponent);
        return R(LinkComponent, {
          dropdownItems: this.props.onChange ? [{
            id: "edit",
            name: [R('i', {
              className: "fa fa-pencil text-muted"
            }), " Edit"]
          }, {
            id: "remove",
            name: [R('i', {
              className: "fa fa-remove text-muted"
            }), " Remove"]
          }] : void 0,
          onDropdownItemClicked: function onDropdownItemClicked(id) {
            if (id === "edit") {
              return _this3.setState({
                modalVisible: true
              });
            } else {
              return _this3.props.onChange(null);
            }
          }
        }, R(LiteralExprStringComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          value: this.props.value,
          enumValues: this.props.enumValues
        }));
      }
    }, {
      key: "render",
      value: function render() {
        var _this4 = this;

        var initialMode, ref;
        initialMode = this.props.initialMode; // Override if already has value

        if (this.props.value) {
          if ((ref = this.props.value.type) === "field" || ref === "scalar") {
            initialMode = "field";
          } else if (this.props.value.type === "literal") {
            initialMode = "literal";
          } else {
            initialMode = "formula";
          }
        }

        return R('div', null, this.state.modalVisible ? R(SelectExprModalComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: this.props.table,
          value: this.props.value,
          variables: this.props.variables,
          types: this.props.types,
          enumValues: this.props.enumValues,
          idTable: this.props.idTable,
          initialMode: initialMode,
          allowCase: this.props.allowCase,
          aggrStatuses: this.props.aggrStatuses,
          refExpr: this.props.refExpr,
          onCancel: function onCancel() {
            return _this4.setState({
              modalVisible: false
            });
          },
          onSelect: function onSelect(expr) {
            _this4.setState({
              modalVisible: false
            });

            return _this4.props.onChange(expr);
          }
        }) : void 0, !this.props.value ? this.renderNone() : this.props.value.type === "field" ? this.renderField() : this.props.value.type === "literal" ? this.renderLiteral() : void 0);
      }
    }]);
    return ExprLinkComponent;
  }(React.Component);

  ;
  ExprLinkComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    // Data source to use to get values
    variables: PropTypes.array.isRequired,
    table: PropTypes.string,
    // Current table
    value: PropTypes.object,
    // Current expression value
    onChange: PropTypes.func,
    // Called with new expression
    // Props to narrow down choices
    types: PropTypes.array,
    // If specified, the types (value type) of expression required. e.g. ["boolean"]
    enumValues: PropTypes.array,
    // Array of { id:, name: } of enum values that can be selected. Only when type = "enum"
    idTable: PropTypes.string,
    // If specified the table from which id-type expressions must come
    initialMode: PropTypes.oneOf(['field', 'formula', 'literal' // Initial mode. Default field
    ]),
    allowCase: PropTypes.bool,
    // Allow case statements
    aggrStatuses: PropTypes.array,
    // statuses of aggregation to allow. list of "individual", "literal", "aggregate". Default: ["individual", "literal"]
    refExpr: PropTypes.object,
    // expression to get values for (used for literals). This is primarily for text fields to allow easy selecting of literal values
    placeholder: PropTypes.string // Placeholder text (default Select...)

  };
  ExprLinkComponent.contextTypes = {
    locale: PropTypes.string // e.g. "en"

  };
  ExprLinkComponent.defaultProps = {
    placeholder: "Select...",
    initialMode: "field",
    aggrStatuses: ['individual', 'literal']
  };
  return ExprLinkComponent;
}.call(void 0);