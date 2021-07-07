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

var BuildEnumsetExprComponent,
    ExprUtils,
    PropTypes,
    R,
    React,
    RemovableComponent,
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
ExprUtils = require("mwater-expressions").ExprUtils;
RemovableComponent = require('./RemovableComponent'); // Build enumset

module.exports = BuildEnumsetExprComponent = function () {
  var BuildEnumsetExprComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(BuildEnumsetExprComponent, _React$Component);

    var _super = _createSuper(BuildEnumsetExprComponent);

    function BuildEnumsetExprComponent() {
      var _this;

      (0, _classCallCheck2["default"])(this, BuildEnumsetExprComponent);
      _this = _super.apply(this, arguments);
      _this.handleValueChange = _this.handleValueChange.bind((0, _assertThisInitialized2["default"])(_this));
      return _this;
    }

    (0, _createClass2["default"])(BuildEnumsetExprComponent, [{
      key: "handleValueChange",
      value: function handleValueChange(id, value) {
        var values;
        boundMethodCheck(this, BuildEnumsetExprComponent);
        values = _.clone(this.props.value.values);
        values[id] = value;
        return this.props.onChange(_.extend({}, this.props.value, {
          values: values
        }));
      }
    }, {
      key: "renderValues",
      value: function renderValues() {
        var _this2 = this;

        var ExprComponent, exprUtils; // To avoid circularity

        ExprComponent = require('./ExprComponent');
        exprUtils = new ExprUtils(this.props.schema);
        return R('table', {
          className: "table table-bordered"
        }, R('thead', null, R('tr', null, R('th', {
          key: "name" // R 'th', key: "arrow"

        }, "Choice"), R('th', {
          key: "include"
        }, "Include if"))), R('tbody', null, _.map(this.props.enumValues, function (enumValue) {
          return R('tr', {
            key: enumValue.id // Name of value

          }, R('td', {
            key: "name" // R 'td', key: "arrow",
            //   R 'span', className: "glyphicon glyphicon-arrow-right"
            // Boolean condition

          }, exprUtils.localizeString(enumValue.name, _this2.context.locale)), R('td', {
            key: "value",
            style: {
              maxWidth: "30em"
            }
          }, R(ExprComponent, {
            schema: _this2.props.schema,
            dataSource: _this2.props.dataSource,
            table: _this2.props.value.table,
            value: _this2.props.value.values[enumValue.id],
            onChange: _this2.handleValueChange.bind(null, enumValue.id),
            types: ['boolean']
          })));
        })));
      }
    }, {
      key: "render",
      value: function render() {
        return R(RemovableComponent, {
          onRemove: this.props.onChange.bind(null, null)
        }, this.props.enumValues ? this.renderValues() : R('i', null, "Cannot display build enumset without known values"));
      }
    }]);
    return BuildEnumsetExprComponent;
  }(React.Component);

  ;
  BuildEnumsetExprComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    // Data source to use to get values
    value: PropTypes.object,
    // Current expression value
    enumValues: PropTypes.array,
    // enum values. Can't display without them
    onChange: PropTypes.func // Called with new expression

  };
  BuildEnumsetExprComponent.contextTypes = {
    locale: PropTypes.string // e.g. "en"

  };
  return BuildEnumsetExprComponent;
}.call(void 0);