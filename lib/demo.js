var DataSource, ExprCleaner, ExprCompiler, ExprComponent, H, MWaterDataSource, OmniBoxExprComponent, R, React, ReactDOM, Schema, value,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

ReactDOM = require('react-dom');

R = React.createElement;

H = React.DOM;

Schema = require("mwater-expressions").Schema;

ExprComponent = require('./ExprComponent');

ExprCleaner = require("mwater-expressions").ExprCleaner;

OmniBoxExprComponent = require('./OmniBoxExprComponent');

ExprCompiler = require("mwater-expressions").ExprCompiler;

DataSource = require('mwater-expressions').DataSource;

$(function() {
  return $.getJSON("https://api.mwater.co/v3/jsonql/schema?formIds=f6d3b6deed734467932f4dca34af4175", function(schemaJson) {
    var TestComponent, dataSource, schema;
    schema = new Schema(schemaJson);
    dataSource = new MWaterDataSource("http://localhost:1234/v3/", "e449acf016c362f19c4b65b52db23486", false);
    TestComponent = (function(superClass) {
      extend(TestComponent, superClass);

      function TestComponent() {
        this.handleCompute = bind(this.handleCompute, this);
        this.handleValueChange = bind(this.handleValueChange, this);
        TestComponent.__super__.constructor.apply(this, arguments);
        this.state = {
          value: value
        };
      }

      TestComponent.prototype.handleValueChange = function(value) {
        value = new ExprCleaner(schema).cleanExpr(value);
        return this.setState({
          value: value
        });
      };

      TestComponent.prototype.handleCompute = function() {
        var compiledExpr, exprCompiler, query;
        exprCompiler = new ExprCompiler(schema);
        compiledExpr = exprCompiler.compileExpr({
          expr: this.state.value,
          tableAlias: "main"
        });
        query = {
          type: "query",
          selects: [
            {
              type: "select",
              expr: compiledExpr,
              alias: "value"
            }
          ],
          from: exprCompiler.compileTable("responses:f6d3b6deed734467932f4dca34af4175", "main")
        };
        return dataSource.performQuery(query, (function(_this) {
          return function(err, rows) {
            return console.log(_.countBy(rows, "value"));
          };
        })(this));
      };

      TestComponent.prototype.render = function() {
        dataSource;
        return H.div({
          style: {
            padding: 10
          }
        }, R(ExprComponent, {
          schema: schema,
          dataSource: dataSource,
          table: "responses:f6d3b6deed734467932f4dca34af4175",
          value: this.state.value,
          onChange: this.handleValueChange,
          type: "enum",
          enumValues: [
            {
              id: "high",
              name: "High"
            }, {
              id: "medium",
              name: "Medium"
            }, {
              id: "low",
              name: "Low"
            }, {
              id: "nodata",
              name: "No Data"
            }
          ]
        }), H.br(), H.br(), H.pre(null, JSON.stringify(this.state.value, null, 2)), H.button({
          type: "button",
          className: "btn btn-primary",
          onClick: this.handleCompute
        }, "Compute"));
      };

      return TestComponent;

    })(React.Component);
    return ReactDOM.render(R(TestComponent), document.getElementById("main"));
  });
});

value = {
  "type": "case",
  "table": "responses:f6d3b6deed734467932f4dca34af4175",
  "cases": [
    {
      "when": {
        "type": "op",
        "table": "responses:f6d3b6deed734467932f4dca34af4175",
        "op": "= any",
        "exprs": [
          {
            "type": "field",
            "table": "responses:f6d3b6deed734467932f4dca34af4175",
            "column": "data:cc53351619f343b48ad490d5eb1361c6:value"
          }, {
            "type": "literal",
            "valueType": "enum[]",
            "value": ["fSwM5qf", "eRnmrpl"]
          }
        ]
      },
      "then": {
        "type": "literal",
        "valueType": "enum",
        "value": "high"
      }
    }, {
      "when": {
        "type": "op",
        "table": "responses:f6d3b6deed734467932f4dca34af4175",
        "op": "= any",
        "exprs": [
          {
            "type": "field",
            "table": "responses:f6d3b6deed734467932f4dca34af4175",
            "column": "data:cc53351619f343b48ad490d5eb1361c6:value"
          }, {
            "type": "literal",
            "valueType": "enum[]",
            "value": ["7HgUHBd"]
          }
        ]
      },
      "then": {
        "type": "literal",
        "valueType": "enum",
        "value": "medium"
      }
    }, {
      "when": {
        "type": "op",
        "table": "responses:f6d3b6deed734467932f4dca34af4175",
        "op": "= any",
        "exprs": [
          {
            "type": "field",
            "table": "responses:f6d3b6deed734467932f4dca34af4175",
            "column": "data:cc53351619f343b48ad490d5eb1361c6:value"
          }, {
            "type": "literal",
            "valueType": "enum[]",
            "value": ["UMRWnnt", "7t7XKLe"]
          }
        ]
      },
      "then": {
        "type": "literal",
        "valueType": "enum",
        "value": "low"
      }
    }
  ],
  "else": {
    "type": "literal",
    "valueType": "enum",
    "value": "nodata"
  }
};

MWaterDataSource = (function(superClass) {
  extend(MWaterDataSource, superClass);

  function MWaterDataSource(apiUrl, client, caching) {
    if (caching == null) {
      caching = true;
    }
    this.apiUrl = apiUrl;
    this.client = client;
    this.caching = caching;
  }

  MWaterDataSource.prototype.performQuery = function(query, cb) {
    var headers, url;
    url = this.apiUrl + "jsonql?jsonql=" + encodeURIComponent(JSON.stringify(query));
    if (this.client) {
      url += "&client=" + this.client;
    }
    headers = {};
    if (!this.caching) {
      headers['Cache-Control'] = "no-cache";
    }
    return $.ajax({
      dataType: "json",
      url: url,
      headers: headers
    }).done((function(_this) {
      return function(rows) {
        return cb(null, rows);
      };
    })(this)).fail((function(_this) {
      return function(xhr) {
        return cb(new Error(xhr.responseText));
      };
    })(this));
  };

  return MWaterDataSource;

})(DataSource);
