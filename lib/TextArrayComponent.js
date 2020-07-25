"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var AsyncReactSelect,
    ExprCompiler,
    PropTypes,
    R,
    React,
    TextArrayComponent,
    _,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

_ = require('lodash');
PropTypes = require('prop-types');
React = require('react');
R = React.createElement; // ReactSelect = require('react-select').default

AsyncReactSelect = require('react-select/lib/Async')["default"];
ExprCompiler = require("mwater-expressions").ExprCompiler; // Displays a combo box that allows selecting multiple text values from an expression

module.exports = TextArrayComponent = function () {
  var TextArrayComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(TextArrayComponent, _React$Component);

    var _super = _createSuper(TextArrayComponent);

    function TextArrayComponent() {
      var _this;

      (0, _classCallCheck2["default"])(this, TextArrayComponent);
      _this = _super.apply(this, arguments);
      _this.handleChange = _this.handleChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.loadOptions = _this.loadOptions.bind((0, _assertThisInitialized2["default"])(_this));
      return _this;
    }

    (0, _createClass2["default"])(TextArrayComponent, [{
      key: "focus",
      value: function focus() {
        return this.select.focus();
      }
    }, {
      key: "handleChange",
      value: function handleChange(value) {
        boundMethodCheck(this, TextArrayComponent);

        if (value && value.length > 0) {
          return this.props.onChange({
            type: "literal",
            valueType: "text[]",
            value: _.pluck(value, "label")
          });
        } else {
          return this.props.onChange(null);
        }
      }
    }, {
      key: "escapeRegex",
      value: function escapeRegex(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      }
    }, {
      key: "loadOptions",
      value: function loadOptions(input, cb) {
        var exprCompiler, query;
        boundMethodCheck(this, TextArrayComponent); // Create query to get matches ordered by most frequent to least

        exprCompiler = new ExprCompiler(this.props.schema); // select <compiled expr> as value, count(*) as number from <table> where <compiled expr> like 'input%' group by value order by number desc limit 50

        query = {
          type: "query",
          selects: [{
            type: "select",
            expr: exprCompiler.compileExpr({
              expr: this.props.refExpr,
              tableAlias: "main"
            }),
            alias: "value"
          }, {
            type: "select",
            expr: {
              type: "op",
              op: "count",
              exprs: []
            },
            alias: "number"
          }],
          from: exprCompiler.compileTable(this.props.refExpr.table, "main"),
          where: {
            type: "op",
            op: "~*",
            exprs: [exprCompiler.compileExpr({
              expr: this.props.refExpr,
              tableAlias: "main"
            }), "^" + this.escapeRegex(input)]
          },
          groupBy: [1],
          orderBy: [{
            ordinal: 2,
            direction: "desc"
          }, {
            ordinal: 1,
            direction: "asc"
          }],
          limit: 50
        }; // Execute query

        this.props.dataSource.performQuery(query, function (err, rows) {
          if (err) {
            return;
          } // Filter null and blank


          rows = _.filter(rows, function (r) {
            return r.value;
          });
          return cb(_.map(rows, function (r) {
            return {
              value: r.value,
              label: r.value
            };
          }));
        });
      }
    }, {
      key: "render",
      value: function render() {
        var _this2 = this;

        var ref, value;
        value = _.map((ref = this.props.value) != null ? ref.value : void 0, function (v) {
          return {
            label: v,
            value: v
          };
        });
        return R('div', {
          style: {
            width: "100%"
          }
        }, R(AsyncReactSelect, {
          ref: function ref(c) {
            return _this2.select = c;
          },
          value: value,
          isMulti: true,
          placeholder: "Select...",
          defaultOptions: true,
          loadOptions: this.loadOptions,
          onChange: this.handleChange
        }));
      }
    }]);
    return TextArrayComponent;
  }(React.Component);

  ;
  TextArrayComponent.propTypes = {
    value: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    refExpr: PropTypes.object.isRequired,
    // Expression for the text values to select from
    schema: PropTypes.object.isRequired,
    // Schema of the database
    dataSource: PropTypes.object.isRequired // Data source to use to get values

  };
  return TextArrayComponent;
}.call(void 0);