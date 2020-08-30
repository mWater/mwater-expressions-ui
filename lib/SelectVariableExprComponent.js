"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var ExprUtils,
    PropTypes,
    R,
    React,
    SelectVariableExprComponent,
    _,
    indexOf = [].indexOf;

PropTypes = require('prop-types');
_ = require('lodash');
React = require('react');
R = React.createElement;
ExprUtils = require('mwater-expressions').ExprUtils;

module.exports = SelectVariableExprComponent = function () {
  var SelectVariableExprComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2.default)(SelectVariableExprComponent, _React$Component);

    function SelectVariableExprComponent() {
      (0, _classCallCheck2.default)(this, SelectVariableExprComponent);
      return (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(SelectVariableExprComponent).apply(this, arguments));
    }

    (0, _createClass2.default)(SelectVariableExprComponent, [{
      key: "render",
      value: function render() {
        var _this = this;

        var items, variables;
        variables = _.filter(this.props.variables, function (variable) {
          var ref; // Filter types

          if (_this.props.types && (ref = variable.type, indexOf.call(_this.props.types, ref) < 0)) {
            return false;
          } // Filter by idTable


          if (_this.props.idTable && variable.idTable && variable.idTable !== _this.props.idTable) {
            return false;
          } // Filter by enumValues


          if (_this.props.enumValues && variable.enumValues) {
            if (_.difference(_.pluck(variable.enumValues, "id"), _.pluck(_this.props.enumValues, "id")).length > 0) {
              return false;
            }
          }

          return true;
        });
        items = _.map(variables, function (variable) {
          return {
            id: variable.id,
            name: ExprUtils.localizeString(variable.name, _this.context.locale) || "(unnamed)",
            desc: ExprUtils.localizeString(variable.desc, _this.context.locale),
            onClick: function onClick() {
              return _this.props.onChange({
                type: "variable",
                variableId: variable.id
              });
            }
          };
        }); // Create list

        return R('div', {
          style: {
            paddingTop: 10
          }
        }, _.map(items, function (item) {
          return R('div', {
            key: item.id,
            style: {
              padding: 4,
              borderRadius: 4,
              cursor: "pointer",
              color: "#478"
            },
            className: "hover-grey-background",
            onClick: item.onClick
          }, item.name, item.desc ? R('span', {
            className: "text-muted",
            style: {
              fontSize: 12,
              paddingLeft: 3
            }
          }, " - " + item.desc) : void 0);
        }));
      }
    }]);
    return SelectVariableExprComponent;
  }(React.Component);

  ;
  SelectVariableExprComponent.propTypes = {
    value: PropTypes.object,
    // Current expression value
    onChange: PropTypes.func.isRequired,
    // Called with new expression
    variables: PropTypes.array.isRequired,
    // Props to narrow down choices
    types: PropTypes.array,
    // If specified, the types (value type) of expression required. e.g. ["boolean"]
    enumValues: PropTypes.array,
    // Array of { id:, name: } of enum values that can be selected. Only when type = "enum"
    idTable: PropTypes.string // If specified the table from which id-type expressions must come

  };
  SelectVariableExprComponent.contextTypes = {
    locale: PropTypes.string // e.g. "en"

  };
  return SelectVariableExprComponent;
}.call(void 0);