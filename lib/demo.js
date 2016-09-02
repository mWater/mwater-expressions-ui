var ContentEditableComponent, ContentEditableTestComponent, DataSource, ExprCleaner, ExprCompiler, ExprComponent, FilterExprComponent, H, InlineExprsEditorComponent, LiveTestComponent, MWaterDataSource, MockTestComponent, MockTestInlineExprsEditorComponent, OmniBoxExprComponent, R, React, ReactDOM, Schema, expr1, expr2, value,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

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

FilterExprComponent = require('./FilterExprComponent');

InlineExprsEditorComponent = require('./InlineExprsEditorComponent');

ContentEditableComponent = require('./ContentEditableComponent');

$(function() {
  return ReactDOM.render(R(LiveTestComponent), document.getElementById("main"));
});

ContentEditableTestComponent = (function(superClass) {
  extend(ContentEditableTestComponent, superClass);

  function ContentEditableTestComponent() {
    ContentEditableTestComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      html: "World Water Week"
    };
  }

  ContentEditableTestComponent.prototype.render = function() {
    return H.div(null, H.div(null, "Sdfsdfsd"), H.div(null, "Sdfsdfsd"), H.div(null, "Sdfsdfsd"), R(ContentEditableComponent, {
      ref: "editor",
      html: this.state.html,
      onChange: (function(_this) {
        return function(elem) {
          console.log(elem);
          return _this.setState({
            html: elem.innerHTML
          });
        };
      })(this)
    }), H.button({
      onClick: (function(_this) {
        return function() {
          console.log("click!");
          return _this.refs.editor.pasteHTML("HELLO!", false);
        };
      })(this),
      type: "button"
    }, "Paste"));
  };

  ContentEditableTestComponent.prototype.pasteHTML = function(html, selectPastedContent) {
    return this.refs.editor.focus();
  };

  return ContentEditableTestComponent;

})(React.Component);

MockTestInlineExprsEditorComponent = (function(superClass) {
  extend(MockTestInlineExprsEditorComponent, superClass);

  function MockTestInlineExprsEditorComponent() {
    this.handleChange = bind(this.handleChange, this);
    MockTestInlineExprsEditorComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      schema: null,
      dataSource: null,
      text: "",
      exprs: []
    };
  }

  MockTestInlineExprsEditorComponent.prototype.componentWillMount = function() {
    var dataSource, schema;
    schema = new Schema();
    schema = schema.addTable({
      id: "t1",
      name: {
        en: "T1"
      },
      primaryKey: "primary",
      contents: [
        {
          id: "text",
          name: {
            en: "Text"
          },
          type: "text"
        }, {
          id: "number",
          name: {
            en: "Number"
          },
          type: "number"
        }, {
          id: "enum",
          name: {
            en: "Enum"
          },
          type: "enum",
          enumValues: [
            {
              id: "a",
              name: {
                en: "A"
              }
            }, {
              id: "b",
              name: {
                en: "B"
              }
            }
          ]
        }, {
          id: "enumset",
          name: {
            en: "EnumSet"
          },
          type: "enumset",
          enumValues: [
            {
              id: "a",
              name: {
                en: "A"
              }
            }, {
              id: "b",
              name: {
                en: "B"
              }
            }
          ]
        }, {
          id: "date",
          name: {
            en: "Date"
          },
          type: "date"
        }, {
          id: "datetime",
          name: {
            en: "Datetime"
          },
          type: "datetime"
        }, {
          id: "boolean",
          name: {
            en: "Boolean"
          },
          type: "boolean"
        }, {
          id: "1-2",
          name: {
            en: "T1->T2"
          },
          type: "join",
          join: {
            fromColumn: "primary",
            toTable: "t2",
            toColumn: "t1",
            type: "1-n"
          }
        }
      ]
    });
    schema = schema.addTable({
      id: "t2",
      name: {
        en: "T2"
      },
      primaryKey: "primary",
      ordering: "number",
      contents: [
        {
          id: "text",
          name: {
            en: "Text"
          },
          type: "text"
        }, {
          id: "number",
          name: {
            en: "Number"
          },
          type: "number"
        }, {
          id: "2-1",
          name: {
            en: "T2->T1"
          },
          type: "join",
          join: {
            fromColumn: "t1",
            toTable: "t1",
            toColumn: "primary",
            type: "n-1"
          }
        }
      ]
    });
    schema = schema.addTable({
      id: "t3",
      name: {
        en: "T3"
      },
      primaryKey: "primary",
      ordering: "number",
      contents: [
        {
          id: "text",
          name: {
            en: "Text"
          },
          type: "text"
        }, {
          id: "number",
          name: {
            en: "Number"
          },
          type: "number"
        }
      ]
    });
    dataSource = {
      performQuery: (function(_this) {
        return function(query, cb) {
          return cb(null, [
            {
              value: "abc"
            }, {
              value: "xyz"
            }
          ]);
        };
      })(this)
    };
    return this.setState({
      schema: schema,
      dataSource: dataSource
    });
  };

  MockTestInlineExprsEditorComponent.prototype.handleChange = function(text, exprs) {
    console.log("handleChange: " + text);
    return this.setState({
      text: text,
      exprs: exprs
    });
  };

  MockTestInlineExprsEditorComponent.prototype.render = function() {
    if (!this.state.schema) {
      return null;
    }
    return H.div({
      style: {
        padding: 10
      }
    }, R(InlineExprsEditorComponent, {
      schema: this.state.schema,
      dataSource: this.state.dataSource,
      table: "t1",
      text: this.state.text,
      exprs: this.state.exprs,
      onChange: this.handleChange,
      types: ['number'],
      aggrStatuses: ["aggregate", "literal"]
    }));
  };

  return MockTestInlineExprsEditorComponent;

})(React.Component);

MockTestComponent = (function(superClass) {
  extend(MockTestComponent, superClass);

  function MockTestComponent() {
    this.handleValueChange = bind(this.handleValueChange, this);
    MockTestComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      value: null,
      schema: null,
      dataSource: null
    };
  }

  MockTestComponent.prototype.componentWillMount = function() {
    var dataSource, schema;
    schema = new Schema();
    schema = schema.addTable({
      id: "t1",
      name: {
        en: "T1"
      },
      primaryKey: "primary",
      contents: [
        {
          id: "text",
          name: {
            en: "Text"
          },
          desc: {
            en: "Text is a bunch of characters"
          },
          type: "text"
        }, {
          id: "number",
          name: {
            en: "Number"
          },
          type: "number"
        }, {
          id: "enum",
          name: {
            en: "Enum"
          },
          type: "enum",
          enumValues: [
            {
              id: "a",
              name: {
                en: "A"
              }
            }, {
              id: "b",
              name: {
                en: "B"
              }
            }
          ]
        }, {
          id: "enumset",
          name: {
            en: "EnumSet"
          },
          type: "enumset",
          enumValues: [
            {
              id: "a",
              name: {
                en: "A"
              }
            }, {
              id: "b",
              name: {
                en: "B"
              }
            }
          ]
        }, {
          id: "date",
          name: {
            en: "Date"
          },
          type: "date"
        }, {
          id: "datetime",
          name: {
            en: "Datetime"
          },
          type: "datetime"
        }, {
          id: "boolean",
          name: {
            en: "Boolean"
          },
          type: "boolean"
        }, {
          id: "geometry",
          name: {
            en: "Geometry"
          },
          type: "geometry"
        }, {
          id: "1-2",
          name: {
            en: "T1->T2"
          },
          type: "join",
          join: {
            fromColumn: "primary",
            toTable: "t2",
            toColumn: "t1",
            type: "1-n"
          }
        }, {
          id: "expr_enum",
          name: {
            en: "Expr Enum"
          },
          type: "expr",
          expr: {
            type: "field",
            table: "t1",
            column: "enum"
          }
        }, {
          id: "expr_number",
          name: {
            en: "Expr Number"
          },
          type: "expr",
          expr: {
            type: "field",
            table: "t1",
            column: "number"
          }
        }, {
          id: "expr_id",
          name: {
            en: "Expr Id"
          },
          type: "expr",
          expr: {
            type: "id",
            table: "t1"
          }
        }, {
          id: "expr_sum",
          name: {
            en: "Expr Sum"
          },
          type: "expr",
          expr: {
            type: "op",
            op: "sum",
            exprs: [
              {
                type: "field",
                table: "t1",
                column: "number"
              }
            ]
          }
        }
      ]
    });
    schema = schema.addTable({
      id: "t2",
      name: {
        en: "T2"
      },
      primaryKey: "primary",
      ordering: "number",
      contents: [
        {
          id: "text",
          name: {
            en: "Text"
          },
          type: "text"
        }, {
          id: "enum",
          name: {
            en: "Enum"
          },
          type: "enum",
          enumValues: [
            {
              id: "a",
              name: {
                en: "A"
              }
            }, {
              id: "b",
              name: {
                en: "B"
              }
            }
          ]
        }, {
          id: "number",
          name: {
            en: "Number"
          },
          type: "number"
        }, {
          id: "2-1",
          name: {
            en: "T2->T1"
          },
          type: "join",
          join: {
            fromColumn: "t1",
            toTable: "t1",
            toColumn: "primary",
            type: "n-1"
          }
        }
      ]
    });
    schema = schema.addTable({
      id: "t3",
      name: {
        en: "T3"
      },
      primaryKey: "primary",
      ordering: "number",
      contents: [
        {
          id: "text",
          name: {
            en: "Text"
          },
          type: "text"
        }, {
          id: "number",
          name: {
            en: "Number"
          },
          type: "number"
        }
      ]
    });
    dataSource = {
      performQuery: (function(_this) {
        return function(query, cb) {
          return cb(null, [
            {
              value: "abc",
              label: "ABC"
            }, {
              value: "xyz",
              label: "XYZ"
            }
          ]);
        };
      })(this)
    };
    return this.setState({
      schema: schema,
      dataSource: dataSource
    });
  };

  MockTestComponent.prototype.handleValueChange = function(value) {
    return this.setState({
      value: value
    });
  };

  MockTestComponent.prototype.render = function() {
    if (!this.state.schema) {
      return null;
    }
    return H.div({
      style: {
        padding: 10
      }
    }, R(ExprComponent, {
      schema: this.state.schema,
      dataSource: this.state.dataSource,
      table: "t1",
      value: this.state.value,
      onChange: this.handleValueChange,
      aggrStatuses: ["literal", "individual"]
    }), H.br(), H.br(), H.pre(null, JSON.stringify(this.state.value, null, 2)));
  };

  return MockTestComponent;

})(React.Component);

LiveTestComponent = (function(superClass) {
  extend(LiveTestComponent, superClass);

  function LiveTestComponent() {
    this.handleValueChange = bind(this.handleValueChange, this);
    LiveTestComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      value: null,
      schema: null,
      dataSource: null
    };
  }

  LiveTestComponent.prototype.componentWillMount = function() {
    var apiUrl;
    apiUrl = "http://localhost:1234/v3/";
    return $.getJSON(apiUrl + "jsonql/schema", (function(_this) {
      return function(schemaJson) {
        var dataSource, schema;
        schema = new Schema(schemaJson);
        dataSource = new MWaterDataSource(apiUrl, null, false);
        return _this.setState({
          schema: schema,
          dataSource: dataSource
        });
      };
    })(this));
  };

  LiveTestComponent.prototype.handleValueChange = function(value) {
    value = new ExprCleaner(this.state.schema).cleanExpr(value);
    return this.setState({
      value: value
    });
  };

  LiveTestComponent.prototype.render = function() {
    if (!this.state.schema) {
      return null;
    }
    return H.div({
      style: {
        padding: 10
      }
    }, R(ExprComponent, {
      schema: this.state.schema,
      dataSource: this.state.dataSource,
      table: "entities.water_point",
      types: ['enum'],
      aggrStatuses: ['individual', 'literal'],
      value: this.state.value,
      onChange: this.handleValueChange
    }), H.br(), H.br(), H.pre(null, JSON.stringify(this.state.value, null, 2)));
  };

  return LiveTestComponent;

})(React.Component);

expr1 = {
  type: "comparison",
  table: "t1",
  op: "=",
  lhs: {
    type: "field",
    table: "t1",
    column: "number"
  },
  rhs: {
    type: "literal",
    valueType: "integer",
    value: 4
  }
};

expr2 = {
  type: "comparison",
  table: "t1",
  op: "=",
  lhs: {
    type: "field",
    table: "t1",
    column: "number"
  },
  rhs: {
    type: "literal",
    valueType: "integer",
    value: 5
  }
};

value = {
  type: "logical",
  table: "t1",
  op: "and",
  exprs: [expr1, expr2]
};

value = {
  "type": "op",
  "table": "entities.water_point",
  "op": "within",
  "exprs": [
    {
      "type": "scalar",
      "table": "entities.water_point",
      "joins": ["admin_region"],
      "expr": {
        "type": "id",
        "table": "admin_regions"
      }
    }, {
      "type": "literal",
      "valueType": "id",
      "idTable": "admin_regions",
      "value": "dba202a4-95eb-47e2-8070-f872e08c3c84"
    }
  ]
};

value = null;

value = {
  "type": "op",
  "table": "t1",
  "op": "percent where",
  "exprs": [
    {
      "type": "op",
      "table": "t1",
      "op": "= any",
      "exprs": [
        {
          "type": "scalar",
          "table": "t1",
          "joins": ["1-2"],
          "expr": {
            "type": "op",
            "op": "last",
            "table": "t2",
            "exprs": [
              {
                "type": "field",
                "table": "t2",
                "column": "enum"
              }
            ]
          }
        }, null
      ]
    }
  ]
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
