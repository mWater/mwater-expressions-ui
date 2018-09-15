var ContentEditableComponent, ContentEditableTestComponent, DataSource, ExprCleaner, ExprCompiler, ExprComponent, FilterExprComponent, InlineExprsEditorComponent, LiveTestComponent, MWaterDataSource, MockPropertyEditorTestComponent, MockTestComponent, MockTestInlineExprsEditorComponent, PropTypes, PropertyListComponent, PropertyListContainerComponent, R, React, ReactDOM, Schema, expr1, expr2, properties, value,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

PropTypes = require('prop-types');

React = require('react');

console.log(React);

ReactDOM = require('react-dom');

R = React.createElement;

Schema = require("mwater-expressions").Schema;

ExprComponent = require('./ExprComponent');

ExprCleaner = require("mwater-expressions").ExprCleaner;

ExprCompiler = require("mwater-expressions").ExprCompiler;

DataSource = require('mwater-expressions').DataSource;

FilterExprComponent = require('./FilterExprComponent');

InlineExprsEditorComponent = require('./InlineExprsEditorComponent');

ContentEditableComponent = require('./ContentEditableComponent');

PropertyListComponent = require('./properties/PropertyListComponent');

$(function() {
  return $.getJSON("https://api.mwater.co/v3/jsonql/schema", function(schemaJson) {
    var dataSource, schema;
    schema = new Schema(schemaJson);
    dataSource = new MWaterDataSource("https://api.mwater.co/v3/", null, false);
    return ReactDOM.render(R(LiveTestComponent), document.getElementById("main"));
  });
});

PropertyListContainerComponent = (function(superClass) {
  extend(PropertyListContainerComponent, superClass);

  PropertyListContainerComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    table: PropTypes.string.isRequired
  };

  function PropertyListContainerComponent(props) {
    PropertyListContainerComponent.__super__.constructor.call(this, props);
    this.state = {
      properties: properties
    };
  }

  PropertyListContainerComponent.prototype.render = function() {
    return R('div', {
      className: "row"
    }, R('div', {
      className: "col-md-6"
    }, R('div', {
      style: {
        padding: 20,
        border: "1px solid #aeaeae",
        width: 600
      }
    }, R(PropertyListComponent, {
      properties: this.state.properties,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      tableIds: ["entities.water_point", "entities.community"],
      features: ["idField", "sql", "joinType", "idType", "expr", "table"],
      onChange: (function(_this) {
        return function(properties) {
          return _this.setState({
            properties: properties
          });
        };
      })(this),
      createRoleDisplayElem: (function(_this) {
        return function(roles) {
          return R('span', null, JSON.stringify(roles));
        };
      })(this),
      createRoleEditElem: (function(_this) {
        return function(roles, onChange) {
          return R('input', {
            className: "form-control",
            value: JSON.stringify(roles),
            onChange: function(ev) {
              return onChange(JSON.parse(ev.target.value));
            }
          });
        };
      })(this)
    }))), R('div', {
      className: "col-md-6"
    }, R('pre', null, JSON.stringify(this.state.properties, null, 2))));
  };

  return PropertyListContainerComponent;

})(React.Component);

ContentEditableTestComponent = (function(superClass) {
  extend(ContentEditableTestComponent, superClass);

  function ContentEditableTestComponent(props) {
    ContentEditableTestComponent.__super__.constructor.call(this, props);
    this.state = {
      html: "World Water Week"
    };
  }

  ContentEditableTestComponent.prototype.render = function() {
    return R('div', null, R('div', null, "Sdfsdfsd"), R('div', null, "Sdfsdfsd"), R(ContentEditableComponent, {
      ref: (function(_this) {
        return function(c) {
          return _this.editor = c;
        };
      })(this),
      html: this.state.html,
      onChange: (function(_this) {
        return function(elem) {
          console.log(elem);
          return _this.setState({
            html: elem.innerHTML
          });
        };
      })(this)
    }), R('div', null, "Sdfsdfsd"), R('button', {
      onClick: (function(_this) {
        return function() {
          console.log("click!");
          return _this.editor.pasteHTML("<b>" + _this.editor.getSelectedHTML() + "</b>");
        };
      })(this),
      type: "button"
    }, "Paste"));
  };

  return ContentEditableTestComponent;

})(React.Component);

MockTestInlineExprsEditorComponent = (function(superClass) {
  extend(MockTestInlineExprsEditorComponent, superClass);

  function MockTestInlineExprsEditorComponent(props) {
    this.handleChange = bind(this.handleChange, this);
    MockTestInlineExprsEditorComponent.__super__.constructor.call(this, props);
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
    return R('div', {
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
      types: ['boolean'],
      aggrStatuses: ["individual", "literal"],
      multiline: true,
      rows: 5
    }));
  };

  return MockTestInlineExprsEditorComponent;

})(React.Component);

MockTestComponent = (function(superClass) {
  extend(MockTestComponent, superClass);

  function MockTestComponent(props) {
    this.handleValueChange = bind(this.handleValueChange, this);
    MockTestComponent.__super__.constructor.call(this, props);
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
          type: "section",
          name: {
            en: "Section"
          },
          contents: [
            {
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
            }
          ]
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
      ordering: "date",
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
    return R('div', {
      style: {
        padding: 10,
        marginTop: 0
      }
    }, R(ExprComponent, {
      schema: this.state.schema,
      dataSource: this.state.dataSource,
      table: "t1",
      types: ["boolean"],
      value: this.state.value,
      onChange: this.handleValueChange,
      aggrStatuses: ["literal", "aggregate", "individual"]
    }), R('br'), R('br'), R('pre', null, JSON.stringify(this.state.value, null, 2)));
  };

  return MockTestComponent;

})(React.Component);

MockPropertyEditorTestComponent = (function(superClass) {
  extend(MockPropertyEditorTestComponent, superClass);

  function MockPropertyEditorTestComponent(props) {
    this.handleValueChange = bind(this.handleValueChange, this);
    MockPropertyEditorTestComponent.__super__.constructor.call(this, props);
    this.state = {
      value: null,
      schema: null,
      dataSource: null
    };
  }

  MockPropertyEditorTestComponent.prototype.componentWillMount = function() {
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
          type: "section",
          name: {
            en: "Section"
          },
          contents: [
            {
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
            }
          ]
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

  MockPropertyEditorTestComponent.prototype.handleValueChange = function(value) {
    return this.setState({
      value: value
    });
  };

  MockPropertyEditorTestComponent.prototype.render = function() {
    if (!this.state.schema) {
      return null;
    }
    return R(PropertyListContainerComponent, {
      schema: this.state.schema,
      dataSource: this.state.dataSource,
      table: "t1"
    });
  };

  return MockPropertyEditorTestComponent;

})(React.Component);

LiveTestComponent = (function(superClass) {
  extend(LiveTestComponent, superClass);

  function LiveTestComponent(props) {
    this.handleValueChange = bind(this.handleValueChange, this);
    LiveTestComponent.__super__.constructor.call(this, props);
    this.state = {
      value: null,
      schema: null,
      dataSource: null
    };
  }

  LiveTestComponent.prototype.componentWillMount = function() {
    var apiUrl;
    apiUrl = "https://api.mwater.co/v3/";
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
    return this.setState({
      value: value
    });
  };

  LiveTestComponent.prototype.render = function() {
    if (!this.state.schema) {
      return null;
    }
    return R('div', {
      style: {
        padding: 10
      }
    }, R(ExprComponent, {
      schema: this.state.schema,
      dataSource: this.state.dataSource,
      table: "entities.water_point",
      types: ['boolean'],
      aggrStatuses: ['individual', 'literal', 'aggregate'],
      value: this.state.value,
      onChange: this.handleValueChange
    }), R('br'), R('br'), R('pre', null, JSON.stringify(this.state.value, null, 2)));
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
    MWaterDataSource.__super__.constructor.call(this);
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

properties = [
  {
    "legacyId": "7f88d07d-4dab-4d32-94df-d39d55549f90",
    "type": "enum",
    "entity_type": "water_point",
    "id": "wo_program_type",
    "name": {
      "_base": "en",
      "en": "Water.org Program Type"
    },
    "desc": {
      "_base": "en",
      "en": "Water.org Program Type"
    },
    "physical_quantity": null,
    "ref_entity_type": null,
    "deprecated": false,
    "limited": null,
    "limited_subst": null,
    "enumValues": [
      {
        "id": "watercredit",
        "name": {
          "en": "WaterCredit",
          "_base": "en"
        }
      }, {
        "id": "directimpact",
        "name": {
          "en": "Direct Impact",
          "_base": "en"
        }
      }
    ],
    "units": null,
    "unique_code": null,
    "roles": [
      {
        "id": "group:Water.org Water Quality",
        "role": "edit"
      }, {
        "id": "user:admin",
        "role": "admin"
      }
    ]
  }, {
    "legacyId": "c64df46b-96c3-4539-a5c4-f902c1cbf06c",
    "type": "boolean",
    "entity_type": "water_point",
    "id": "wpdx_converted_fields",
    "name": {
      "_base": "en",
      "en": "WPDX Converted fields"
    },
    "desc": {
      "_base": "en",
      "en": "WPDX Converted fields"
    },
    "physical_quantity": null,
    "ref_entity_type": null,
    "deprecated": true,
    "limited": null,
    "limited_subst": null,
    "values": null,
    "units": null,
    "unique_code": null,
    "roles": [
      {
        "id": "all",
        "role": "edit"
      }, {
        "id": "user:admin",
        "role": "admin"
      }
    ]
  }, {
    "legacyId": "cfb1147d-54af-405c-818d-e94510177fd9",
    "type": "geometry",
    "entity_type": "water_point",
    "id": "wpdx_country",
    "name": {
      "_base": "en",
      "en": "WPDX Country (ISO 2-letter code)"
    },
    "desc": {
      "_base": "en",
      "en": "WPDX Country (ISO 2-letter code)"
    },
    "physical_quantity": null,
    "ref_entity_type": null,
    "deprecated": false,
    "limited": null,
    "limited_subst": null,
    "values": null,
    "units": null,
    "unique_code": null,
    "roles": [
      {
        "id": "all",
        "role": "edit"
      }, {
        "id": "user:admin",
        "role": "admin"
      }
    ]
  }, {
    "legacyId": "b9fc3ed5-f830-4aa8-8824-965f287dbc44",
    "type": "text",
    "entity_type": "water_point",
    "id": "wpdx_data_source",
    "name": {
      "_base": "en",
      "en": "WPDX Data source"
    },
    "desc": {
      "_base": "en",
      "en": "WPDX Data source"
    },
    "physical_quantity": null,
    "ref_entity_type": null,
    "deprecated": true,
    "limited": null,
    "limited_subst": null,
    "values": null,
    "units": null,
    "unique_code": null,
    "roles": [
      {
        "id": "all",
        "role": "edit"
      }, {
        "id": "user:admin",
        "role": "admin"
      }
    ]
  }, {
    "legacyId": "84a5557f-d531-4438-bb9d-801acffd7272",
    "type": "date",
    "entity_type": "water_point",
    "id": "wpdx_date_of_data_inventory",
    "name": {
      "_base": "en",
      "en": "Date of data inventory"
    },
    "desc": {
      "_base": "en",
      "en": "Date of data inventory"
    },
    "physical_quantity": null,
    "ref_entity_type": null,
    "deprecated": false,
    "limited": null,
    "limited_subst": null,
    "values": null,
    "units": null,
    "unique_code": null,
    "roles": [
      {
        "id": "all",
        "role": "edit"
      }, {
        "id": "group:mWater Staff",
        "role": "admin"
      }, {
        "id": "user:admin",
        "role": "admin"
      }
    ]
  }, {
    "legacyId": "a384e163-41a5-4986-bba2-b82bab31063asd",
    "type": "section",
    "id": "sasda3234",
    "name": {
      "_base": "en",
      "en": "Sample Section"
    },
    "desc": {
      "_base": "en",
      "en": "k akjsd aksjdasudha sd aksjd aksjdha k"
    },
    "contents": [
      {
        "legacyId": "a384e163-41a5-4986-bba2-b82bab31063e",
        "type": "text",
        "entity_type": "water_point",
        "id": "wpdx_installer",
        "name": {
          "_base": "en",
          "en": "WPDX Installer"
        },
        "desc": {
          "_base": "en",
          "en": "Description for WPDX Installer"
        },
        "physical_quantity": null,
        "ref_entity_type": null,
        "deprecated": true,
        "limited": null,
        "limited_subst": null,
        "values": null,
        "units": null,
        "unique_code": null,
        "roles": [
          {
            "id": "all",
            "role": "edit"
          }, {
            "id": "group:mWater Staff",
            "role": "admin"
          }, {
            "id": "user:admin",
            "role": "admin"
          }
        ]
      }, {
        "legacyId": "8a40fd46-205e-48eb-88bf-77dce043dc85",
        "type": "enum",
        "entity_type": "water_point",
        "id": "wpdx_management_structure",
        "name": {
          "_base": "en",
          "en": "WPDX Management structure"
        },
        "desc": {
          "_base": "en",
          "en": "WPDX Management structure"
        },
        "physical_quantity": null,
        "ref_entity_type": null,
        "deprecated": false,
        "limited": null,
        "limited_subst": null,
        "enumValues": [
          {
            "id": "direct_gov",
            "name": {
              "en": "Direct government operation",
              "_base": "en"
            }
          }, {
            "id": "private_operator",
            "name": {
              "en": "Private operator/delegated management",
              "_base": "en"
            }
          }, {
            "id": "community",
            "name": {
              "en": "Community management",
              "_base": "en"
            }
          }, {
            "id": "institutional",
            "name": {
              "en": "Institutional management",
              "_base": "en"
            }
          }, {
            "id": "other",
            "name": {
              "en": "Other",
              "_base": "en"
            }
          }
        ],
        "units": null,
        "unique_code": null,
        "roles": [
          {
            "id": "all",
            "role": "edit"
          }, {
            "id": "user:admin",
            "role": "admin"
          }
        ]
      }, {
        "legacyId": "09d1c4d9-7273-47eb-a46e-8dffb593e32d",
        "type": "text",
        "entity_type": "water_point",
        "id": "wpdx_management_structure_other",
        "name": {
          "_base": "en",
          "en": "WPDX Management Structure - Other (please specify) text"
        },
        "desc": {
          "_base": "en",
          "en": "WPDX Management Structure - Other (please specify) text"
        },
        "physical_quantity": null,
        "ref_entity_type": null,
        "deprecated": false,
        "limited": null,
        "limited_subst": null,
        "values": null,
        "units": null,
        "unique_code": null,
        "roles": [
          {
            "id": "all",
            "role": "edit"
          }, {
            "id": "group:mWater Staff",
            "role": "admin"
          }, {
            "id": "user:admin",
            "role": "admin"
          }
        ]
      }
    ]
  }, {
    "legacyId": "e32580ab-c877-40e0-a7b6-6e0fd00322f3",
    "type": "image",
    "entity_type": "water_point",
    "id": "wpdx_id",
    "name": {
      "_base": "en",
      "en": "WPDX Water point ID"
    },
    "desc": {
      "_base": "en",
      "en": "WPDX Water point ID"
    },
    "physical_quantity": null,
    "ref_entity_type": null,
    "deprecated": true,
    "limited": null,
    "limited_subst": null,
    "values": null,
    "units": null,
    "unique_code": null,
    "roles": [
      {
        "id": "all",
        "role": "edit"
      }, {
        "id": "user:admin",
        "role": "admin"
      }
    ]
  }
];
