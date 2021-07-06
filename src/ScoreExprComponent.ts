// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let ScoreExprComponent;
import PropTypes from 'prop-types';
import _ from 'lodash';
import React from 'react';
const R = React.createElement;

import { ExprUtils } from "mwater-expressions";
import RemovableComponent from './RemovableComponent';

// Score 
export default ScoreExprComponent = (function() {
  ScoreExprComponent = class ScoreExprComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        schema: PropTypes.object.isRequired,
        dataSource: PropTypes.object.isRequired, // Data source to use to get values
        value: PropTypes.object,   // Current expression value
        onChange: PropTypes.func  // Called with new expression
      };
  
      this.contextTypes =
        {locale: PropTypes.string};
        // e.g. "en"
    }

    handleInputChange = expr => {
      return this.props.onChange(_.extend({}, this.props.value, { input: expr }));
    };

    handleScoreChange = (id, value) => {
      const scores = _.clone(this.props.value.scores);
      scores[id] = value;
      return this.props.onChange(_.extend({}, this.props.value, { scores }));
    };

    renderScores() {
      // To avoid circularity
      const ExprComponent = require('./ExprComponent');

      const exprUtils = new ExprUtils(this.props.schema);
      // Get enum values
      const enumValues = exprUtils.getExprEnumValues(this.props.value.input);
      if (!enumValues) {
        return null;
      }

      return R('table', {className: "table table-bordered"}, 
        R('thead', null,
          R('tr', null,
            R('th', {key: "name"}, "Choice"),
            // R 'th', key: "arrow"
            R('th', {key: "score"}, "Score"))
        ),
        R('tbody', null,
          _.map(enumValues, enumValue => {
            return R('tr', {key: enumValue.id},
              // Name of value
              R('td', {key: "name"},
                exprUtils.localizeString(enumValue.name, this.context.locale)),
              // R 'td', key: "arrow",
              //   R 'span', className: "glyphicon glyphicon-arrow-right"
              // Score
              R('td', {key: "score", style: { maxWidth: "20em" }},
                R(ExprComponent, {
                  schema: this.props.schema,
                  dataSource: this.props.dataSource,
                  table: this.props.value.table,
                  value: this.props.value.scores[enumValue.id],
                  onChange: this.props.onChange ? this.handleScoreChange.bind(null, enumValue.id) : undefined,
                  types: ['number'],
                  preferLiteral: true
                }
                )
              )
            );
          })
        )
      );
    }

    render() {
      // To avoid circularity
      const ExprComponent = require('./ExprComponent');

      return R(RemovableComponent, {onRemove: (this.props.onChange ? this.props.onChange.bind(null, null) : undefined)},
        R('div', null, 
          "Score choices of: ",
          R('div', {style: { display: "inline-block", maxWidth: "50em" }},
            R(ExprComponent, {
              schema: this.props.schema,
              dataSource: this.props.dataSource,
              table: this.props.value.table,
              value: this.props.value.input,
              onChange: this.props.onChange ? this.handleInputChange : undefined,
              types: ['enum', 'enumset']
            }))),
        this.renderScores());
    }
  };
  ScoreExprComponent.initClass();
  return ScoreExprComponent;
})();