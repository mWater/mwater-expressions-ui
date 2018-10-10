var ExprUtils, PropTypes, R, React, ScalarExprTreeBuilder, ScalarExprTreeComponent, SelectFieldExprComponent, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

R = React.createElement;

ScalarExprTreeComponent = require('./ScalarExprTreeComponent');

ScalarExprTreeBuilder = require('./ScalarExprTreeBuilder');

ExprUtils = require('mwater-expressions').ExprUtils;

module.exports = SelectFieldExprComponent = (function(superClass) {
  extend(SelectFieldExprComponent, superClass);

  SelectFieldExprComponent.propTypes = {
    value: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    variables: PropTypes.array.isRequired,
    table: PropTypes.string.isRequired,
    types: PropTypes.array,
    enumValues: PropTypes.array,
    idTable: PropTypes.string,
    aggrStatuses: PropTypes.array
  };

  SelectFieldExprComponent.contextTypes = {
    locale: PropTypes.string,
    isScalarExprTreeSectionInitiallyOpen: PropTypes.func,
    isScalarExprTreeSectionMatch: PropTypes.func
  };

  function SelectFieldExprComponent(props) {
    this.handleTreeChange = bind(this.handleTreeChange, this);
    this.handleSearchTextChange = bind(this.handleSearchTextChange, this);
    SelectFieldExprComponent.__super__.constructor.call(this, props);
    this.state = {
      searchText: ""
    };
  }

  SelectFieldExprComponent.prototype.componentDidMount = function() {
    var ref;
    return (ref = this.searchComp) != null ? ref.focus() : void 0;
  };

  SelectFieldExprComponent.prototype.handleSearchTextChange = function(ev) {
    return this.setState({
      searchText: ev.target.value
    });
  };

  SelectFieldExprComponent.prototype.handleTreeChange = function(val) {
    var buildExpr, ev, expr, exprUtils, fromEnumValues, i, len, literal, matchingEnumValue, ref;
    this.setState({
      focused: false
    });
    expr = val.expr;
    exprUtils = new ExprUtils(this.props.schema);
    if (exprUtils.getExprType(val.expr) === "enum" && this.props.enumValues) {
      expr = {
        type: "case",
        table: expr.table,
        cases: _.map(this.props.enumValues, (function(_this) {
          return function(ev) {
            var fromEnumValues, literal, matchingEnumValue;
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
          };
        })(this)),
        "else": null
      };
    }
    if (exprUtils.getExprType(val.expr) === "enumset" && this.props.enumValues) {
      buildExpr = {
        type: "build enumset",
        table: expr.table,
        values: {}
      };
      ref = this.props.enumValues;
      for (i = 0, len = ref.length; i < len; i++) {
        ev = ref[i];
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
    if (val.joins.length === 0) {
      return this.props.onChange(expr);
    } else {
      return this.props.onChange({
        type: "scalar",
        table: this.props.table,
        joins: val.joins,
        expr: expr
      });
    }
  };

  SelectFieldExprComponent.prototype.render = function() {
    var tree, treeBuilder;
    treeBuilder = new ScalarExprTreeBuilder(this.props.schema, {
      locale: this.context.locale,
      isScalarExprTreeSectionMatch: this.context.isScalarExprTreeSectionMatch,
      isScalarExprTreeSectionInitiallyOpen: this.context.isScalarExprTreeSectionInitiallyOpen,
      variables: this.props.variables
    });
    tree = treeBuilder.getTree({
      table: this.props.table,
      types: this.props.types,
      idTable: this.props.idTable,
      includeAggr: indexOf.call(this.props.aggrStatuses, "aggregate") >= 0,
      filter: this.state.searchText
    });
    return R('div', null, R('input', {
      ref: (function(_this) {
        return function(c) {
          return _this.searchComp = c;
        };
      })(this),
      type: "text",
      placeholder: "Search Fields...",
      className: "form-control input-lg",
      value: this.state.searchText,
      onChange: this.handleSearchTextChange
    }), R('div', {
      style: {
        paddingTop: 10,
        paddingBottom: 200
      }
    }, R(ScalarExprTreeComponent, {
      tree: tree,
      onChange: this.handleTreeChange,
      filter: this.state.searchText
    })));
  };

  return SelectFieldExprComponent;

})(React.Component);
