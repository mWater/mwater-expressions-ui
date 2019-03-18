"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var ExprCleaner,
    ExprElementBuilder,
    ExprLinkComponent,
    FilterExprComponent,
    PropTypes,
    R,
    React,
    RemovableComponent,
    StackedComponent,
    _,
    update,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

PropTypes = require('prop-types');
_ = require('lodash');
React = require('react');
R = React.createElement;
update = require('update-object');
ExprCleaner = require("mwater-expressions").ExprCleaner;
ExprElementBuilder = require('./ExprElementBuilder');
StackedComponent = require('./StackedComponent');
RemovableComponent = require('./RemovableComponent');
ExprLinkComponent = require('./ExprLinkComponent'); // Displays a boolean filter expression. Just shows "+ Add filter" (or other add label) when empty

module.exports = FilterExprComponent = function () {
  var FilterExprComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2.default)(FilterExprComponent, _React$Component);

    function FilterExprComponent(props) {
      var _this;

      (0, _classCallCheck2.default)(this, FilterExprComponent);
      _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(FilterExprComponent).call(this, props)); // Handle add filter clicked by wrapping in "and" if existing, otherwise adding a null

      _this.handleAddFilter = _this.handleAddFilter.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this))); // Clean expression and pass up

      _this.handleChange = _this.handleChange.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this))); // Handle change to a single item

      _this.handleAndChange = _this.handleAndChange.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleAndRemove = _this.handleAndRemove.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleRemove = _this.handleRemove.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.state = {
        displayNull: false // Set true when initial null value should be displayed

      };
      return _this;
    }

    (0, _createClass2.default)(FilterExprComponent, [{
      key: "handleAddFilter",
      value: function handleAddFilter() {
        var _this2 = this;

        boundMethodCheck(this, FilterExprComponent); // If already "and", add null

        if (this.props.value && this.props.value.op === "and") {
          this.props.onChange(update(this.props.value, {
            exprs: {
              $push: [null]
            }
          }));
          return;
        } // If already has value, wrap in and


        if (this.props.value) {
          this.props.onChange({
            type: "op",
            op: "and",
            table: this.props.table,
            exprs: [this.props.value, null]
          });
          return;
        }

        return this.setState({
          displayNull: true
        }, function () {
          var ref;
          return (ref = _this2.newExpr) != null ? ref.showModal() : void 0;
        });
      }
    }, {
      key: "handleChange",
      value: function handleChange(expr) {
        boundMethodCheck(this, FilterExprComponent);
        return this.props.onChange(this.cleanExpr(expr));
      } // Cleans an expression

    }, {
      key: "cleanExpr",
      value: function cleanExpr(expr) {
        return new ExprCleaner(this.props.schema, this.props.variables).cleanExpr(expr, {
          table: this.props.table,
          types: ["boolean"]
        });
      }
    }, {
      key: "handleAndChange",
      value: function handleAndChange(i, expr) {
        boundMethodCheck(this, FilterExprComponent);
        return this.handleChange(update(this.props.value, {
          exprs: {
            $splice: [[i, 1, expr]]
          }
        }));
      }
    }, {
      key: "handleAndRemove",
      value: function handleAndRemove(i) {
        boundMethodCheck(this, FilterExprComponent);
        return this.handleChange(update(this.props.value, {
          exprs: {
            $splice: [[i, 1]]
          }
        }));
      }
    }, {
      key: "handleRemove",
      value: function handleRemove() {
        boundMethodCheck(this, FilterExprComponent);
        this.setState({
          displayNull: false
        });
        return this.handleChange(null);
      }
    }, {
      key: "renderAddFilter",
      value: function renderAddFilter() {
        return R('div', null, R('a', {
          onClick: this.handleAddFilter
        }, this.props.addLabel));
      }
    }, {
      key: "render",
      value: function render() {
        var _this3 = this;

        var expr;
        expr = this.cleanExpr(this.props.value); // Render each item of and

        if (expr && expr.op === "and") {
          return R('div', null, R(StackedComponent, {
            joinLabel: "and",
            items: _.map(expr.exprs, function (subexpr, i) {
              return {
                elem: new ExprElementBuilder(_this3.props.schema, _this3.props.dataSource, _this3.context.locale, _this3.props.variables).build(subexpr, _this3.props.table, _this3.props.onChange ? _this3.handleAndChange.bind(null, i) : void 0, {
                  types: ["boolean"],
                  preferLiteral: false,
                  suppressWrapOps: ['and'] // Don't allow wrapping in and since this is an and control

                }),
                onRemove: _this3.props.onChange ? _this3.handleAndRemove.bind(null, i) : void 0
              };
            }) // Only display add if last item is not null

          }), _.last(expr.exprs) !== null && this.props.onChange ? this.renderAddFilter() : void 0);
        } else if (expr) {
          return R('div', null, R(RemovableComponent, {
            onRemove: this.props.onChange ? this.handleRemove : void 0
          }, new ExprElementBuilder(this.props.schema, this.props.dataSource, this.context.locale, this.props.variables).build(expr, this.props.table, this.props.onChange ? this.handleChange : void 0, {
            types: ["boolean"],
            preferLiteral: false,
            suppressWrapOps: ['and'] // Don't allow wrapping in and since this is an and control
            // Only display add if has a value

          })), this.renderAddFilter());
        } else if (this.state.displayNull) {
          return R(ExprLinkComponent, {
            ref: function ref(c) {
              return _this3.newExpr = c;
            },
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            variables: this.props.variables,
            table: this.props.table,
            onChange: this.props.onChange ? this.handleChange : void 0
          });
        } else {
          return this.renderAddFilter();
        }
      }
    }]);
    return FilterExprComponent;
  }(React.Component);

  ;
  FilterExprComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    // Data source to use to get values
    variables: PropTypes.array,
    table: PropTypes.string.isRequired,
    // Current table
    value: PropTypes.object,
    // Current value
    onChange: PropTypes.func,
    // Called with new expression
    addLabel: PropTypes.node // Label for adding item. Default "+ Add Label"

  };
  FilterExprComponent.contextTypes = {
    locale: PropTypes.string // e.g. "en"

  };
  FilterExprComponent.defaultProps = {
    addLabel: "+ Add Filter",
    variables: []
  };
  return FilterExprComponent;
}.call(void 0);