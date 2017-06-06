var ExprUtils, H, PropTypes, R, React, RemovableComponent, ScoreExprComponent, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

R = React.createElement;

H = React.DOM;

ExprUtils = require("mwater-expressions").ExprUtils;

RemovableComponent = require('./RemovableComponent');

module.exports = ScoreExprComponent = (function(superClass) {
  extend(ScoreExprComponent, superClass);

  function ScoreExprComponent() {
    this.handleScoreChange = bind(this.handleScoreChange, this);
    this.handleInputChange = bind(this.handleInputChange, this);
    return ScoreExprComponent.__super__.constructor.apply(this, arguments);
  }

  ScoreExprComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    value: PropTypes.object,
    onChange: PropTypes.func
  };

  ScoreExprComponent.contextTypes = {
    locale: PropTypes.string
  };

  ScoreExprComponent.prototype.handleInputChange = function(expr) {
    return this.props.onChange(_.extend({}, this.props.value, {
      input: expr
    }));
  };

  ScoreExprComponent.prototype.handleScoreChange = function(id, value) {
    var scores;
    scores = _.clone(this.props.value.scores);
    scores[id] = value;
    return this.props.onChange(_.extend({}, this.props.value, {
      scores: scores
    }));
  };

  ScoreExprComponent.prototype.renderScores = function() {
    var ExprComponent, enumValues, exprUtils;
    ExprComponent = require('./ExprComponent');
    exprUtils = new ExprUtils(this.props.schema);
    enumValues = exprUtils.getExprEnumValues(this.props.value.input);
    if (!enumValues) {
      return null;
    }
    return H.table({
      className: "table table-bordered"
    }, H.thead(null, H.tr(null, H.th({
      key: "name"
    }, "Choice"), H.th({
      key: "score"
    }, "Score"))), H.tbody(null, _.map(enumValues, (function(_this) {
      return function(enumValue) {
        return H.tr({
          key: enumValue.id
        }, H.td({
          key: "name"
        }, exprUtils.localizeString(enumValue.name, _this.context.locale)), H.td({
          key: "score",
          style: {
            maxWidth: "20em"
          }
        }, R(ExprComponent, {
          schema: _this.props.schema,
          dataSource: _this.props.dataSource,
          table: _this.props.value.table,
          value: _this.props.value.scores[enumValue.id],
          onChange: _this.handleScoreChange.bind(null, enumValue.id),
          types: ['number'],
          preferLiteral: true
        })));
      };
    })(this))));
  };

  ScoreExprComponent.prototype.render = function() {
    var ExprComponent;
    ExprComponent = require('./ExprComponent');
    return R(RemovableComponent, {
      onRemove: this.props.onChange.bind(null, null)
    }, H.div(null, "Score choices of: ", H.div({
      style: {
        display: "inline-block",
        maxWidth: "50em"
      }
    }, R(ExprComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.value.table,
      value: this.props.value.input,
      onChange: this.handleInputChange,
      types: ['enum', 'enumset']
    }))), this.renderScores());
  };

  return ScoreExprComponent;

})(React.Component);
