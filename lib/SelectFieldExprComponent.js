var ExprUtils, H, PropTypes, R, React, ScalarExprTreeBuilder, ScalarExprTreeComponent, SelectFieldExprComponent, _,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } },
  indexOf = [].indexOf;

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

R = React.createElement;

H = React.DOM;

ScalarExprTreeComponent = require('./ScalarExprTreeComponent');

ScalarExprTreeBuilder = require('./ScalarExprTreeBuilder');

ExprUtils = require('mwater-expressions').ExprUtils;

module.exports = SelectFieldExprComponent = (function() {
  class SelectFieldExprComponent extends React.Component {
    constructor(props) {
      super(props);
      this.handleSearchTextChange = this.handleSearchTextChange.bind(this);
      // Handle a selection in the scalar expression tree. Called with { table, joins, expr }
      this.handleTreeChange = this.handleTreeChange.bind(this);
      this.state = {
        searchText: ""
      };
    }

    componentDidMount() {
      return this.refs.search.focus();
    }

    handleSearchTextChange(ev) {
      boundMethodCheck(this, SelectFieldExprComponent);
      return this.setState({
        searchText: ev.target.value
      });
    }

    handleTreeChange(val) {
      var buildExpr, ev, expr, exprUtils, fromEnumValues, i, len, literal, matchingEnumValue, ref;
      boundMethodCheck(this, SelectFieldExprComponent);
      
      // Loses focus when selection made
      this.setState({
        focused: false
      });
      expr = val.expr;
      exprUtils = new ExprUtils(this.props.schema);
      // If expr is enum and enumValues specified, perform a mapping
      if (exprUtils.getExprType(val.expr) === "enum" && this.props.enumValues) {
        expr = {
          type: "case",
          table: expr.table,
          cases: _.map(this.props.enumValues, (ev) => {
            var fromEnumValues, literal, matchingEnumValue;
            // Find matching name (english)
            fromEnumValues = exprUtils.getExprEnumValues(expr);
            matchingEnumValue = _.find(fromEnumValues, function(fev) {
              return fev.name.en === ev.name.en;
            });
            if (matchingEnumValue) {
              literal = {
                type: "literal",
                valueType: "enumset",
                value: [matchingEnumValue.id]
              };
            } else {
              literal = null;
            }
            return {
              when: {
                type: "op",
                table: expr.table,
                op: "= any",
                exprs: [expr, literal]
              },
              then: {
                type: "literal",
                valueType: "enum",
                value: ev.id
              }
            };
          }),
          else: null
        };
      }
      // If expr is enumset and enumValues specified, perform a mapping building an enumset
      if (exprUtils.getExprType(val.expr) === "enumset" && this.props.enumValues) {
        buildExpr = {
          type: "build enumset",
          table: expr.table,
          values: {}
        };
        ref = this.props.enumValues;
        for (i = 0, len = ref.length; i < len; i++) {
          ev = ref[i];
          // Find matching name (english)
          fromEnumValues = exprUtils.getExprEnumValues(expr);
          matchingEnumValue = _.find(fromEnumValues, function(fev) {
            return fev.name.en === ev.name.en;
          });
          if (matchingEnumValue) {
            literal = {
              type: "literal",
              valueType: "enumset",
              value: [matchingEnumValue.id]
            };
          } else {
            literal = null;
          }
          buildExpr.values[ev.id] = {
            type: "op",
            table: expr.table,
            op: "contains",
            exprs: [expr, literal]
          };
        }
        expr = buildExpr;
      }
      
      // Make into expression
      if (val.joins.length === 0) {
        
        // Simple field expression
        return this.props.onChange(expr);
      } else {
        return this.props.onChange({
          type: "scalar",
          table: this.props.table,
          joins: val.joins,
          expr: expr
        });
      }
    }

    render() {
      var tree, treeBuilder;
      // Create tree 
      treeBuilder = new ScalarExprTreeBuilder(this.props.schema, {
        locale: this.context.locale,
        isScalarExprTreeSectionMatch: this.context.isScalarExprTreeSectionMatch,
        isScalarExprTreeSectionInitiallyOpen: this.context.isScalarExprTreeSectionInitiallyOpen
      });
      tree = treeBuilder.getTree({
        table: this.props.table,
        types: this.props.types,
        idTable: this.props.idTable,
        includeAggr: indexOf.call(this.props.aggrStatuses, "aggregate") >= 0,
        filter: this.state.searchText
      });
      return H.div(null, H.input({
        ref: "search",
        type: "text",
        placeholder: "Search Fields...",
        className: "form-control input-lg",
        value: this.state.searchText,
        onChange: this.handleSearchTextChange
      // Create tree component with value of table and path
      }), H.div({
        style: {
          paddingTop: 10,
          paddingBottom: 200
        }
      }, R(ScalarExprTreeComponent, {
        tree: tree,
        onChange: this.handleTreeChange,
        filter: this.state.searchText
      })));
    }

  };

  SelectFieldExprComponent.propTypes = {
    value: PropTypes.object, // Current expression value
    onChange: PropTypes.func.isRequired, // Called with new expression
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired, // Data source to use to get values
    
    // Props to narrow down choices
    table: PropTypes.string.isRequired, // Current table
    types: PropTypes.array, // If specified, the types (value type) of expression required. e.g. ["boolean"]
    enumValues: PropTypes.array, // Array of { id:, name: } of enum values that can be selected. Only when type = "enum"
    idTable: PropTypes.string, // If specified the table from which id-type expressions must come
    aggrStatuses: PropTypes.array // statuses of aggregation to allow. list of "individual", "literal", "aggregate". Default: ["individual", "literal"]
  };

  SelectFieldExprComponent.contextTypes = {
    locale: PropTypes.string, // e.g. "en"
    
    // Function to override initial open state of a section. Passed { tableId: id of table, section: section object from schema, filter: optional string filter }
    // Should return true to set initially open
    isScalarExprTreeSectionInitiallyOpen: PropTypes.func,
    // Function to override filtering of a section. Passed { tableId: id of table, section: section object from schema, filter: optional string filter }
    // Should return null for default, true to include, false to exclude
    isScalarExprTreeSectionMatch: PropTypes.func
  };

  return SelectFieldExprComponent;

}).call(this);
