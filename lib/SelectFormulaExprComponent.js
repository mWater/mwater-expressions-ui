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

var ExprUtils,
    PropTypes,
    R,
    React,
    SelectFormulaExprComponent,
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
ExprUtils = require('mwater-expressions').ExprUtils;

module.exports = SelectFormulaExprComponent = function () {
  var SelectFormulaExprComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(SelectFormulaExprComponent, _React$Component);

    var _super = _createSuper(SelectFormulaExprComponent);

    function SelectFormulaExprComponent(props) {
      var _this;

      (0, _classCallCheck2["default"])(this, SelectFormulaExprComponent);
      _this = _super.call(this, props);
      _this.handleSearchTextChange = _this.handleSearchTextChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleIfSelected = _this.handleIfSelected.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleScoreSelected = _this.handleScoreSelected.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleBuildEnumsetSelected = _this.handleBuildEnumsetSelected.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleOpSelected = _this.handleOpSelected.bind((0, _assertThisInitialized2["default"])(_this));
      _this.state = {
        searchText: ""
      };
      return _this;
    }

    (0, _createClass2["default"])(SelectFormulaExprComponent, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        var ref;
        return (ref = this.searchComp) != null ? ref.focus() : void 0;
      }
    }, {
      key: "handleSearchTextChange",
      value: function handleSearchTextChange(ev) {
        boundMethodCheck(this, SelectFormulaExprComponent);
        return this.setState({
          searchText: ev.target.value
        });
      }
    }, {
      key: "handleIfSelected",
      value: function handleIfSelected() {
        var ifExpr;
        boundMethodCheck(this, SelectFormulaExprComponent);
        ifExpr = {
          type: "case",
          cases: [{
            when: null,
            then: null
          }],
          "else": null
        };

        if (this.props.table) {
          ifExpr.table = this.props.table;
        }

        return this.props.onChange(ifExpr);
      }
    }, {
      key: "handleScoreSelected",
      value: function handleScoreSelected() {
        var scoreExpr;
        boundMethodCheck(this, SelectFormulaExprComponent);
        scoreExpr = {
          type: "score",
          input: null,
          scores: {}
        };

        if (this.props.table) {
          scoreExpr.table = this.props.table;
        }

        return this.props.onChange(scoreExpr);
      }
    }, {
      key: "handleBuildEnumsetSelected",
      value: function handleBuildEnumsetSelected() {
        var expr;
        boundMethodCheck(this, SelectFormulaExprComponent);
        expr = {
          type: "build enumset",
          values: {}
        };

        if (this.props.table) {
          expr.table = this.props.table;
        }

        return this.props.onChange(expr);
      }
    }, {
      key: "handleOpSelected",
      value: function handleOpSelected(op) {
        var expr;
        boundMethodCheck(this, SelectFormulaExprComponent);
        expr = {
          type: "op",
          op: op,
          exprs: []
        };

        if (this.props.table) {
          expr.table = this.props.table;
        }

        return this.props.onChange(expr);
      }
    }, {
      key: "render",
      value: function render() {
        var _this2 = this;

        var aggr, exprUtils, filter, i, items, len, opItem, opItems, ref;

        if (this.state.searchText) {
          filter = new RegExp(_.escapeRegExp(this.state.searchText), "i");
        } // Create list of formula


        items = []; // Add if statement (unless boolean only, in which case if/thens cause problems by returning null)

        if (this.props.allowCase) {
          items.push({
            name: "If/then",
            desc: "Choose different values based on a condition",
            onClick: this.handleIfSelected
          });
        } // Add score if has number possible


        if (!this.props.types || indexOf.call(this.props.types, 'number') >= 0) {
          items.push({
            name: "Score",
            desc: "Assign scores to different choices of a field and find total.",
            onClick: this.handleScoreSelected
          });
        } // Only allow aggregate expressions if relevant


        aggr = null;

        if (indexOf.call(this.props.aggrStatuses, "aggregate") < 0) {
          aggr = false;
        } // Add ops that are prefix ones (like "latitude of")


        exprUtils = new ExprUtils(this.props.schema);
        opItems = exprUtils.findMatchingOpItems({
          resultTypes: this.props.types,
          prefix: true,
          aggr: aggr
        });
        ref = _.uniq(opItems, "op");

        for (i = 0, len = ref.length; i < len; i++) {
          opItem = ref[i];
          items.push({
            name: opItem.name,
            desc: opItem.desc,
            onClick: this.handleOpSelected.bind(null, opItem.op)
          });
        } // Add build enumset if has enumset possible and has values


        if ((!this.props.types || indexOf.call(this.props.types, 'enumset') >= 0) && this.props.enumValues && this.props.enumValues.length > 0) {
          items.push({
            name: "Build enumset",
            desc: "Advanced: Create a multi-choice answer based on conditions",
            onClick: this.handleBuildEnumsetSelected
          });
        }

        if (this.state.searchText) {
          filter = new RegExp(_.escapeRegExp(this.state.searchText), "i");
          items = _.filter(items, function (item) {
            return item.name.match(filter) || item.desc.match(filter);
          });
        }

        return R('div', null, R('input', {
          ref: function ref(c) {
            return _this2.searchComp = c;
          },
          type: "text",
          placeholder: "Search Formulas...",
          className: "form-control input-lg",
          value: this.state.searchText,
          onChange: this.handleSearchTextChange // Create list

        }), R('div', {
          style: {
            paddingTop: 10
          }
        }, _.map(items, function (item) {
          return R('div', {
            key: item.name,
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
        })));
      }
    }]);
    return SelectFormulaExprComponent;
  }(React.Component);

  ;
  SelectFormulaExprComponent.propTypes = {
    value: PropTypes.object,
    // Current expression value
    onChange: PropTypes.func.isRequired,
    // Called with new expression
    // Props to narrow down choices
    table: PropTypes.string,
    // Current table
    allowCase: PropTypes.bool,
    // Allow case statements
    types: PropTypes.array,
    // If specified, the types (value type) of expression required. e.g. ["boolean"]
    aggrStatuses: PropTypes.array // statuses of aggregation to allow. list of "individual", "literal", "aggregate". Default: ["individual", "literal"]

  };
  return SelectFormulaExprComponent;
}.call(void 0);