"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var ExprUtils,
    PropTypes,
    R,
    React,
    RemovableComponent,
    ScoreExprComponent,
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
RemovableComponent = require('./RemovableComponent'); // Score 

module.exports = ScoreExprComponent = function () {
  var ScoreExprComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2.default)(ScoreExprComponent, _React$Component);

    function ScoreExprComponent() {
      var _this;

      (0, _classCallCheck2.default)(this, ScoreExprComponent);
      _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(ScoreExprComponent).apply(this, arguments));
      _this.handleInputChange = _this.handleInputChange.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleScoreChange = _this.handleScoreChange.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      return _this;
    }

    (0, _createClass2.default)(ScoreExprComponent, [{
      key: "handleInputChange",
      value: function handleInputChange(expr) {
        boundMethodCheck(this, ScoreExprComponent);
        return this.props.onChange(_.extend({}, this.props.value, {
          input: expr
        }));
      }
    }, {
      key: "handleScoreChange",
      value: function handleScoreChange(id, value) {
        var scores;
        boundMethodCheck(this, ScoreExprComponent);
        scores = _.clone(this.props.value.scores);
        scores[id] = value;
        return this.props.onChange(_.extend({}, this.props.value, {
          scores: scores
        }));
      }
    }, {
      key: "renderScores",
      value: function renderScores() {
        var _this2 = this;

        var ExprComponent, enumValues, exprUtils; // To avoid circularity

        ExprComponent = require('./ExprComponent');
        exprUtils = new ExprUtils(this.props.schema); // Get enum values

        enumValues = exprUtils.getExprEnumValues(this.props.value.input);

        if (!enumValues) {
          return null;
        }

        return R('table', {
          className: "table table-bordered"
        }, R('thead', null, R('tr', null, R('th', {
          key: "name" // R 'th', key: "arrow"

        }, "Choice"), R('th', {
          key: "score"
        }, "Score"))), R('tbody', null, _.map(enumValues, function (enumValue) {
          return R('tr', {
            key: enumValue.id // Name of value

          }, R('td', {
            key: "name" // R 'td', key: "arrow",
            //   R 'span', className: "glyphicon glyphicon-arrow-right"
            // Score

          }, exprUtils.localizeString(enumValue.name, _this2.context.locale)), R('td', {
            key: "score",
            style: {
              maxWidth: "20em"
            }
          }, R(ExprComponent, {
            schema: _this2.props.schema,
            dataSource: _this2.props.dataSource,
            table: _this2.props.value.table,
            value: _this2.props.value.scores[enumValue.id],
            onChange: _this2.props.onChange ? _this2.handleScoreChange.bind(null, enumValue.id) : void 0,
            types: ['number'],
            preferLiteral: true
          })));
        })));
      }
    }, {
      key: "render",
      value: function render() {
        var ExprComponent; // To avoid circularity

        ExprComponent = require('./ExprComponent');
        return R(RemovableComponent, {
          onRemove: this.props.onChange ? this.props.onChange.bind(null, null) : void 0
        }, R('div', null, "Score choices of: ", R('div', {
          style: {
            display: "inline-block",
            maxWidth: "50em"
          }
        }, R(ExprComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: this.props.value.table,
          value: this.props.value.input,
          onChange: this.props.onChange ? this.handleInputChange : void 0,
          types: ['enum', 'enumset']
        }))), this.renderScores());
      }
    }]);
    return ScoreExprComponent;
  }(React.Component);

  ;
  ScoreExprComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    // Data source to use to get values
    value: PropTypes.object,
    // Current expression value
    onChange: PropTypes.func // Called with new expression

  };
  ScoreExprComponent.contextTypes = {
    locale: PropTypes.string // e.g. "en"

  };
  return ScoreExprComponent;
}.call(void 0);