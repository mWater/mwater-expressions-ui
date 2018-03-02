var ExprUtils, H, PropTypes, R, React, SelectFormulaExprComponent, _,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } },
  indexOf = [].indexOf;

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

R = React.createElement;

H = React.DOM;

ExprUtils = require('mwater-expressions').ExprUtils;

module.exports = SelectFormulaExprComponent = (function() {
  class SelectFormulaExprComponent extends React.Component {
    constructor(props) {
      super(props);
      this.handleSearchTextChange = this.handleSearchTextChange.bind(this);
      this.handleIfSelected = this.handleIfSelected.bind(this);
      this.handleScoreSelected = this.handleScoreSelected.bind(this);
      this.handleBuildEnumsetSelected = this.handleBuildEnumsetSelected.bind(this);
      this.handleOpSelected = this.handleOpSelected.bind(this);
      this.state = {
        searchText: ""
      };
    }

    componentDidMount() {
      return this.refs.search.focus();
    }

    handleSearchTextChange(ev) {
      boundMethodCheck(this, SelectFormulaExprComponent);
      return this.setState({
        searchText: ev.target.value
      });
    }

    handleIfSelected() {
      var ifExpr;
      boundMethodCheck(this, SelectFormulaExprComponent);
      ifExpr = {
        type: "case",
        table: this.props.table,
        cases: [
          {
            when: null,
            then: null
          }
        ],
        else: null
      };
      return this.props.onChange(ifExpr);
    }

    handleScoreSelected() {
      var scoreExpr;
      boundMethodCheck(this, SelectFormulaExprComponent);
      scoreExpr = {
        type: "score",
        table: this.props.table,
        input: null,
        scores: {}
      };
      return this.props.onChange(scoreExpr);
    }

    handleBuildEnumsetSelected() {
      var expr;
      boundMethodCheck(this, SelectFormulaExprComponent);
      expr = {
        type: "build enumset",
        table: this.props.table,
        values: {}
      };
      return this.props.onChange(expr);
    }

    handleOpSelected(op) {
      var expr;
      boundMethodCheck(this, SelectFormulaExprComponent);
      expr = {
        type: "op",
        table: this.props.table,
        op: op,
        exprs: []
      };
      return this.props.onChange(expr);
    }

    render() {
      var aggr, exprUtils, filter, i, items, len, opItem, opItems, ref;
      if (this.state.searchText) {
        filter = new RegExp(_.escapeRegExp(this.state.searchText), "i");
      }
      // Create list of formula
      items = [];
      // Add if statement (unless boolean only, in which case if/thens cause problems by returning null)
      if (this.props.allowCase) {
        items.push({
          name: "If/then",
          desc: "Choose different values based on a condition",
          onClick: this.handleIfSelected
        });
      }
      // Add score if has number possible
      if (!this.props.types || indexOf.call(this.props.types, 'number') >= 0) {
        items.push({
          name: "Score",
          desc: "Assign scores to different choices of a field and find total.",
          onClick: this.handleScoreSelected
        });
      }
      // Only allow aggregate expressions if relevant
      aggr = null;
      if (indexOf.call(this.props.aggrStatuses, "aggregate") < 0) {
        aggr = false;
      }
      // Add ops that are prefix ones (like "latitude of")
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
      // Add build enumset if has enumset possible and has values
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
      // Create list
      }), H.div({
        style: {
          paddingTop: 10
        }
      }, _.map(items, (item) => {
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
      })));
    }

  };

  SelectFormulaExprComponent.propTypes = {
    value: PropTypes.object, // Current expression value
    onChange: PropTypes.func.isRequired, // Called with new expression
    
    // Props to narrow down choices
    table: PropTypes.string.isRequired, // Current table
    allowCase: PropTypes.bool, // Allow case statements
    types: PropTypes.array, // If specified, the types (value type) of expression required. e.g. ["boolean"]
    aggrStatuses: PropTypes.array // statuses of aggregation to allow. list of "individual", "literal", "aggregate". Default: ["individual", "literal"]
  };

  return SelectFormulaExprComponent;

}).call(this);
