var ExprUtils, H, PropTypes, R, React, RemovableComponent, ScoreExprComponent, _,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

R = React.createElement;

H = React.DOM;

ExprUtils = require("mwater-expressions").ExprUtils;

RemovableComponent = require('./RemovableComponent');

// Score 
module.exports = ScoreExprComponent = (function() {
  class ScoreExprComponent extends React.Component {
    constructor() {
      super(...arguments);
      this.handleInputChange = this.handleInputChange.bind(this);
      this.handleScoreChange = this.handleScoreChange.bind(this);
    }

    handleInputChange(expr) {
      boundMethodCheck(this, ScoreExprComponent);
      return this.props.onChange(_.extend({}, this.props.value, {
        input: expr
      }));
    }

    handleScoreChange(id, value) {
      var scores;
      boundMethodCheck(this, ScoreExprComponent);
      scores = _.clone(this.props.value.scores);
      scores[id] = value;
      return this.props.onChange(_.extend({}, this.props.value, {
        scores: scores
      }));
    }

    renderScores() {
      var ExprComponent, enumValues, exprUtils;
      // To avoid circularity
      ExprComponent = require('./ExprComponent');
      exprUtils = new ExprUtils(this.props.schema);
      // Get enum values
      enumValues = exprUtils.getExprEnumValues(this.props.value.input);
      if (!enumValues) {
        return null;
      }
      return H.table({
        className: "table table-bordered"
      }, H.thead(null, H.tr(null, H.th({
        key: "name"
      // H.th key: "arrow"
      }, "Choice"), H.th({
        key: "score"
      }, "Score"))), H.tbody(null, _.map(enumValues, (enumValue) => {
        return H.tr({
          key: enumValue.id
        // Name of value
        }, H.td({
          key: "name"
        // H.td key: "arrow",
        //   H.span className: "glyphicon glyphicon-arrow-right"
        // Score
        }, exprUtils.localizeString(enumValue.name, this.context.locale)), H.td({
          key: "score",
          style: {
            maxWidth: "20em"
          }
        }, R(ExprComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: this.props.value.table,
          value: this.props.value.scores[enumValue.id],
          onChange: this.handleScoreChange.bind(null, enumValue.id),
          types: ['number'],
          preferLiteral: true
        })));
      })));
    }

    render() {
      var ExprComponent;
      // To avoid circularity
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
    }

  };

  ScoreExprComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired, // Data source to use to get values
    value: PropTypes.object, // Current expression value
    onChange: PropTypes.func // Called with new expression
  };

  ScoreExprComponent.contextTypes = {
    locale: PropTypes.string // e.g. "en"
  };

  return ScoreExprComponent;

}).call(this);
