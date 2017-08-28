var ExprUtils, H, PropTypes, R, React, SelectFormulaExprComponent, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

R = React.createElement;

H = React.DOM;

ExprUtils = require('mwater-expressions').ExprUtils;

module.exports = SelectFormulaExprComponent = (function(superClass) {
  extend(SelectFormulaExprComponent, superClass);

  SelectFormulaExprComponent.propTypes = {
    value: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    table: PropTypes.string.isRequired,
    allowCase: PropTypes.bool,
    types: PropTypes.array,
    aggrStatuses: PropTypes.array
  };

  function SelectFormulaExprComponent() {
    this.handleOpSelected = bind(this.handleOpSelected, this);
    this.handleBuildEnumsetSelected = bind(this.handleBuildEnumsetSelected, this);
    this.handleScoreSelected = bind(this.handleScoreSelected, this);
    this.handleIfSelected = bind(this.handleIfSelected, this);
    this.handleSearchTextChange = bind(this.handleSearchTextChange, this);
    SelectFormulaExprComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      searchText: ""
    };
  }

  SelectFormulaExprComponent.prototype.componentDidMount = function() {
    return this.refs.search.focus();
  };

  SelectFormulaExprComponent.prototype.handleSearchTextChange = function(ev) {
    return this.setState({
      searchText: ev.target.value
    });
  };

  SelectFormulaExprComponent.prototype.handleIfSelected = function() {
    var ifExpr;
    ifExpr = {
      type: "case",
      table: this.props.table,
      cases: [
        {
          when: null,
          then: null
        }
      ],
      "else": null
    };
    return this.props.onChange(ifExpr);
  };

  SelectFormulaExprComponent.prototype.handleScoreSelected = function() {
    var scoreExpr;
    scoreExpr = {
      type: "score",
      table: this.props.table,
      input: null,
      scores: {}
    };
    return this.props.onChange(scoreExpr);
  };

  SelectFormulaExprComponent.prototype.handleBuildEnumsetSelected = function() {
    var expr;
    expr = {
      type: "build enumset",
      table: this.props.table,
      values: {}
    };
    return this.props.onChange(expr);
  };

  SelectFormulaExprComponent.prototype.handleOpSelected = function(op) {
    var expr;
    expr = {
      type: "op",
      table: this.props.table,
      op: op,
      exprs: []
    };
    return this.props.onChange(expr);
  };

  SelectFormulaExprComponent.prototype.render = function() {
    var aggr, exprUtils, filter, i, items, len, opItem, opItems, ref;
    if (this.state.searchText) {
      filter = new RegExp(_.escapeRegExp(this.state.searchText), "i");
    }
    items = [];
    if (this.props.allowCase) {
      items.push({
        name: "If/then",
        desc: "Choose different values based on a condition",
        onClick: this.handleIfSelected
      });
    }
    if (!this.props.types || indexOf.call(this.props.types, 'number') >= 0) {
      items.push({
        name: "Score",
        desc: "Assign scores to different choices of a field and find total.",
        onClick: this.handleScoreSelected
      });
    }
    aggr = null;
    if (indexOf.call(this.props.aggrStatuses, "aggregate") < 0) {
      aggr = false;
    }
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
    }
    if ((!this.props.types || indexOf.call(this.props.types, 'enumset') >= 0) && this.props.enumValues && this.props.enumValues.length > 0) {
      items.push({
        name: "Build enumset",
        desc: "Advanced: Create a multi-choice answer based on conditions",
        onClick: this.handleBuildEnumsetSelected
      });
    }
    if (this.state.searchText) {
      filter = new RegExp(_.escapeRegExp(this.state.searchText), "i");
      items = _.filter(items, function(item) {
        return item.name.match(filter) || item.desc.match(filter);
      });
    }
    return H.div(null, H.input({
      ref: "search",
      type: "text",
      placeholder: "Search Formulas...",
      className: "form-control input-lg",
      value: this.state.searchText,
      onChange: this.handleSearchTextChange
    }), H.div({
      style: {
        paddingTop: 10
      }
    }, _.map(items, (function(_this) {
      return function(item) {
        return H.div({
          key: item.name,
          style: {
            padding: 4,
            borderRadius: 4,
            cursor: "pointer",
            color: "#478"
          },
          className: "hover-grey-background",
          onClick: item.onClick
        }, item.name, item.desc ? H.span({
          className: "text-muted",
          style: {
            fontSize: 12,
            paddingLeft: 3
          }
        }, " - " + item.desc) : void 0);
      };
    })(this))));
  };

  return SelectFormulaExprComponent;

})(React.Component);
