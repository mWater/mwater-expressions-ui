var ExprCleaner, ExprComponent, ExprElementBuilder, H, PropTypes, R, React, _,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } },
  indexOf = [].indexOf;

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

R = React.createElement;

H = React.DOM;

ExprCleaner = require("mwater-expressions").ExprCleaner;

ExprElementBuilder = require('./ExprElementBuilder');

// Display/editor component for an expression
// Uses ExprElementBuilder to create the tree of components
// Cleans expression as a convenience
module.exports = ExprComponent = (function() {
  class ExprComponent extends React.Component {
    constructor() {
      super(...arguments);
      
      // Opens the editor popup. Only works if expression is blank
      this.openEditor = this.openEditor.bind(this);
      // Clean expression and pass up
      this.handleChange = this.handleChange.bind(this);
    }

    openEditor() {
      var ref;
      boundMethodCheck(this, ExprComponent);
      return (ref = this.refs.exprLink) != null ? ref.showModal() : void 0;
    }

    handleChange(expr) {
      boundMethodCheck(this, ExprComponent);
      return this.props.onChange(this.cleanExpr(expr));
    }

    // Cleans an expression
    cleanExpr(expr) {
      return new ExprCleaner(this.props.schema).cleanExpr(expr, {
        table: this.props.table,
        types: this.props.types,
        enumValueIds: this.props.enumValues ? _.pluck(this.props.enumValues, "id") : void 0,
        idTable: this.props.idTable,
        aggrStatuses: this.props.aggrStatuses
      });
    }

    render() {
      var expr;
      expr = this.cleanExpr(this.props.value);
      return new ExprElementBuilder(this.props.schema, this.props.dataSource, this.context.locale).build(expr, this.props.table, this.handleChange, {
        types: this.props.types,
        enumValues: this.props.enumValues,
        preferLiteral: this.props.preferLiteral,
        idTable: this.props.idTable,
        includeAggr: indexOf.call(this.props.aggrStatuses, "aggregate") >= 0,
        aggrStatuses: this.props.aggrStatuses,
        placeholder: this.props.placeholder,
        // If no expression, pass a ref to use so that the expression editor can be opened
        exprLinkRef: !expr ? "exprLink" : void 0
      });
    }

  };

  ExprComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired, // Data source to use to get values
    table: PropTypes.string.isRequired, // Current table
    value: PropTypes.object, // Current expression value
    onChange: PropTypes.func, // Called with new expression
    types: PropTypes.array, // If specified, the types (value type) of expression required. e.g. ["boolean"]
    enumValues: PropTypes.array, // Array of { id:, name: } of enum values that can be selected. Only when type = "enum"
    idTable: PropTypes.string, // If specified the table from which id-type expressions must come
    preferLiteral: PropTypes.bool, // True to prefer literal expressions
    aggrStatuses: PropTypes.array, // statuses of aggregation to allow. list of "individual", "literal", "aggregate". Default: ["individual", "literal"]
    placeholder: PropTypes.string // placeholder for empty value
  };

  ExprComponent.defaultProps = {
    aggrStatuses: ["individual", "literal"]
  };

  ExprComponent.contextTypes = {
    locale: PropTypes.string // e.g. "en"
  };

  return ExprComponent;

}).call(this);
