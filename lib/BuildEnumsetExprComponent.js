var BuildEnumsetExprComponent, ExprUtils, H, PropTypes, R, React, RemovableComponent, _,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

R = React.createElement;

H = React.DOM;

ExprUtils = require("mwater-expressions").ExprUtils;

RemovableComponent = require('./RemovableComponent');

// Build enumset
module.exports = BuildEnumsetExprComponent = (function() {
  class BuildEnumsetExprComponent extends React.Component {
    constructor() {
      super(...arguments);
      this.handleValueChange = this.handleValueChange.bind(this);
    }

    handleValueChange(id, value) {
      var values;
      boundMethodCheck(this, BuildEnumsetExprComponent);
      values = _.clone(this.props.value.values);
      values[id] = value;
      return this.props.onChange(_.extend({}, this.props.value, {
        values: values
      }));
    }

    renderValues() {
      var ExprComponent, exprUtils;
      // To avoid circularity
      ExprComponent = require('./ExprComponent');
      exprUtils = new ExprUtils(this.props.schema);
      return H.table({
        className: "table table-bordered"
      }, H.thead(null, H.tr(null, H.th({
        key: "name"
      // H.th key: "arrow"
      }, "Choice"), H.th({
        key: "include"
      }, "Include if"))), H.tbody(null, _.map(this.props.enumValues, (enumValue) => {
        return H.tr({
          key: enumValue.id
        // Name of value
        }, H.td({
          key: "name"
        // H.td key: "arrow",
        //   H.span className: "glyphicon glyphicon-arrow-right"
        // Boolean condition
        }, exprUtils.localizeString(enumValue.name, this.context.locale)), H.td({
          key: "value",
          style: {
            maxWidth: "30em"
          }
        }, R(ExprComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: this.props.value.table,
          value: this.props.value.values[enumValue.id],
          onChange: this.handleValueChange.bind(null, enumValue.id),
          types: ['boolean']
        })));
      })));
    }

    render() {
      return R(RemovableComponent, {
        onRemove: this.props.onChange.bind(null, null)
      }, this.props.enumValues ? this.renderValues() : H.i(null, "Cannot display build enumset without known values"));
    }

  };

  BuildEnumsetExprComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired, // Data source to use to get values
    value: PropTypes.object, // Current expression value
    enumValues: PropTypes.array, // enum values. Can't display without them
    onChange: PropTypes.func // Called with new expression
  };

  BuildEnumsetExprComponent.contextTypes = {
    locale: PropTypes.string // e.g. "en"
  };

  return BuildEnumsetExprComponent;

}).call(this);
