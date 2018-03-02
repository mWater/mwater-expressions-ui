var ExprCompiler, H, PropTypes, React, ReactSelect, TextArrayComponent,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

PropTypes = require('prop-types');

React = require('react');

H = React.DOM;

ReactSelect = require('react-select');

ExprCompiler = require("mwater-expressions").ExprCompiler;

// Displays a combo box that allows selecting multiple text values from an expression
module.exports = TextArrayComponent = (function() {
  class TextArrayComponent extends React.Component {
    constructor() {
      super(...arguments);
      this.handleChange = this.handleChange.bind(this);
      this.getOptions = this.getOptions.bind(this);
    }

    focus() {
      return this.refs.select.focus();
    }

    handleChange(val) {
      var value;
      boundMethodCheck(this, TextArrayComponent);
      value = val ? val.split("\n") : [];
      return this.props.onChange({
        type: "literal",
        valueType: "text[]",
        value: value
      });
    }

    escapeRegex(s) {
      return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    getOptions(input, cb) {
      var exprCompiler, query;
      boundMethodCheck(this, TextArrayComponent);
      // Create query to get matches ordered by most frequent to least
      exprCompiler = new ExprCompiler(this.props.schema);
      // select <compiled expr> as value, count(*) as number from <table> where <compiled expr> like 'input%' group by value order by number desc limit 50
      query = {
        type: "query",
        selects: [
          {
            type: "select",
            expr: exprCompiler.compileExpr({
              expr: this.props.refExpr,
              tableAlias: "main"
            }),
            alias: "value"
          },
          {
            type: "select",
            expr: {
              type: "op",
              op: "count",
              exprs: []
            },
            alias: "number"
          }
        ],
        from: exprCompiler.compileTable(this.props.refExpr.table, "main"),
        where: {
          type: "op",
          op: "~*",
          exprs: [
            exprCompiler.compileExpr({
              expr: this.props.refExpr,
              tableAlias: "main"
            }),
            "^" + this.escapeRegex(input)
          ]
        },
        groupBy: [1],
        orderBy: [
          {
            ordinal: 2,
            direction: "desc"
          },
          {
            ordinal: 1,
            direction: "asc"
          }
        ],
        limit: 50
      };
      // Execute query
      this.props.dataSource.performQuery(query, (err, rows) => {
        if (err) {
          cb(err);
          return;
        }
        
        // Filter null and blank
        rows = _.filter(rows, function(r) {
          return r.value;
        });
        return cb(null, {
          options: _.map(rows, function(r) {
            return {
              value: r.value,
              label: r.value
            };
          }),
          complete: false // TODO rows.length < 50 # Complete if didn't hit limit
        });
      });
    }

    render() {
      var value;
      value = "";
      if (this.props.value && this.props.value.value.length > 0) {
        value = this.props.value.value.join("\n");
      }
      return H.div({
        style: {
          width: "100%"
        }
      }, React.createElement(ReactSelect, {
        ref: "select",
        value: value,
        multi: true,
        delimiter: "\n",
        placeholder: "Select...",
        asyncOptions: this.getOptions,
        onChange: this.handleChange
      }));
    }

  };

  TextArrayComponent.propTypes = {
    value: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    refExpr: PropTypes.object.isRequired, // Expression for the text values to select from
    schema: PropTypes.object.isRequired, // Schema of the database
    dataSource: PropTypes.object.isRequired // Data source to use to get values
  };

  return TextArrayComponent;

}).call(this);
