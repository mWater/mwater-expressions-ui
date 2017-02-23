var BuildEnumsetExprComponent, EnumSetComponent, ExprElementBuilder, ExprLinkComponent, ExprUtils, H, IdLiteralComponent, LinkComponent, R, React, ScoreExprComponent, StackedComponent, WrappedLinkComponent, _,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

R = React.createElement;

H = React.DOM;

ExprUtils = require("mwater-expressions").ExprUtils;

EnumSetComponent = require('./EnumSetComponent');

LinkComponent = require('./LinkComponent');

StackedComponent = require('./StackedComponent');

IdLiteralComponent = require('./IdLiteralComponent');

ScoreExprComponent = require('./ScoreExprComponent');

BuildEnumsetExprComponent = require('./BuildEnumsetExprComponent');

ExprLinkComponent = require('./ExprLinkComponent');

module.exports = ExprElementBuilder = (function() {
  function ExprElementBuilder(schema, dataSource, locale) {
    this.schema = schema;
    this.dataSource = dataSource;
    this.locale = locale;
    this.exprUtils = new ExprUtils(this.schema);
  }

  ExprElementBuilder.prototype.build = function(expr, table, onChange, options) {
    var anyTypeAllowed, booleanOnly, createWrapOp, elem, exprType, links;
    if (options == null) {
      options = {};
    }
    _.defaults(options, {
      aggrStatuses: ["individual", "literal"]
    });
    booleanOnly = options.types && options.types.length === 1 && options.types[0] === "boolean";
    anyTypeAllowed = !options.types || (indexOf.call(options.types, "boolean") >= 0 && indexOf.call(options.aggrStatuses, "individual") >= 0 && options.types.length === 1) || (indexOf.call(options.types, "number") >= 0 && indexOf.call(options.aggrStatuses, "aggregate") >= 0);
    exprType = this.exprUtils.getExprType(expr);
    if (!expr || !expr.type || expr.type === "literal" || expr.type === "field") {
      elem = R(ExprLinkComponent, {
        schema: this.schema,
        dataSource: this.dataSource,
        table: table,
        value: expr,
        onChange: onChange,
        types: !anyTypeAllowed ? options.types : void 0,
        allowCase: !booleanOnly,
        enumValues: options.enumValues,
        idTable: options.idTable,
        initialMode: options.preferLiteral ? "literal" : void 0,
        includeAggr: options.includeAggr,
        aggrStatuses: options.aggrStatuses,
        placeholder: options.placeholder,
        refExpr: options.refExpr,
        ref: options.exprLinkRef
      });
    } else if (expr.type === "op") {
      elem = this.buildOp(expr, table, onChange, options);
    } else if (expr.type === "scalar") {
      elem = this.buildScalar(expr, onChange, {
        key: options.key,
        types: options.types,
        enumValues: options.enumValues
      });
    } else if (expr.type === "case") {
      elem = this.buildCase(expr, onChange, {
        key: options.key,
        types: options.types,
        enumValues: options.enumValues
      });
    } else if (expr.type === "id") {
      elem = this.buildId(expr, onChange, {
        key: options.key
      });
    } else if (expr.type === "score") {
      elem = this.buildScore(expr, onChange, {
        key: options.key
      });
    } else if (expr.type === "build enumset") {
      elem = this.buildBuildEnumset(expr, onChange, {
        key: options.key,
        enumValues: options.enumValues
      });
    } else {
      throw new Error("Unhandled expression type " + expr.type);
    }
    links = [];
    createWrapOp = (function(_this) {
      return function(op, name, type) {
        if (type == null) {
          type = "unary";
        }
        if (indexOf.call(options.suppressWrapOps || [], op) < 0) {
          if (type === "unary") {
            return links.push({
              label: name,
              onClick: function() {
                return onChange({
                  type: "op",
                  op: op,
                  table: table,
                  exprs: [expr]
                });
              }
            });
          } else if (expr.op !== op || type === "binary") {
            return links.push({
              label: name,
              onClick: function() {
                return onChange({
                  type: "op",
                  op: op,
                  table: table,
                  exprs: [expr, null]
                });
              }
            });
          } else {
            return links.push({
              label: name,
              onClick: function() {
                var exprs;
                exprs = expr.exprs.slice();
                exprs.push(null);
                return onChange(_.extend({}, expr, {
                  exprs: exprs
                }));
              }
            });
          }
        }
      };
    })(this);
    if (exprType === "boolean") {
      createWrapOp("and", "+ And", "n");
      createWrapOp("or", "+ Or", "n");
      createWrapOp("not", "Not", "unary");
    }
    if (exprType === "number") {
      createWrapOp("+", "+", "n");
      createWrapOp("-", "-", "binary");
      createWrapOp("*", "*", "n");
      createWrapOp("/", "/", "binary");
      if (indexOf.call(options.aggrStatuses, "aggregate") >= 0 && this.exprUtils.getExprAggrStatus(expr) === "individual") {
        createWrapOp("sum", "Total", "unary");
      }
    }
    if (expr && expr.type === "case") {
      links.push({
        label: "+ If",
        onClick: (function(_this) {
          return function() {
            var cases;
            cases = expr.cases.slice();
            cases.push({
              when: null,
              then: null
            });
            return onChange(_.extend({}, expr, {
              cases: cases
            }));
          };
        })(this)
      });
    }
    if (links.length > 0) {
      elem = R(WrappedLinkComponent, {
        links: links
      }, elem);
    }
    return elem;
  };

  ExprElementBuilder.prototype.buildId = function(expr, onChange, options) {
    if (options == null) {
      options = {};
    }
    return R(LinkComponent, {
      dropdownItems: [
        {
          id: "remove",
          name: [
            H.i({
              className: "fa fa-remove text-muted"
            }), " Remove"
          ]
        }
      ],
      onDropdownItemClicked: (function(_this) {
        return function() {
          return onChange(null);
        };
      })(this)
    }, this.exprUtils.summarizeExpr(expr));
  };

  ExprElementBuilder.prototype.buildScalar = function(expr, onChange, options) {
    var anyTypeAllowed, destTable, innerAggrStatuses, innerElem, innerOnChange, j, join, joinCol, joinsStr, len, multipleJoins, ref, ref1, summary;
    if (options == null) {
      options = {};
    }
    destTable = expr.table;
    joinsStr = "";
    ref = expr.joins;
    for (j = 0, len = ref.length; j < len; j++) {
      join = ref[j];
      joinCol = this.schema.getColumn(destTable, join);
      joinsStr += ExprUtils.localizeString(joinCol.name, this.locale) + " > ";
      destTable = joinCol.join.toTable;
    }
    if (expr.expr && ((ref1 = expr.expr.type) === "field" || ref1 === "id")) {
      summary = this.exprUtils.summarizeExpr(_.omit(expr, "aggr"));
      return H.div({
        style: {
          display: "flex",
          alignItems: "baseline"
        }
      }, R(LinkComponent, {
        dropdownItems: [
          {
            id: "remove",
            name: [
              H.i({
                className: "fa fa-remove text-muted"
              }), " Remove"
            ]
          }
        ],
        onDropdownItemClicked: (function(_this) {
          return function() {
            return onChange(null);
          };
        })(this)
      }, summary));
    } else {
      innerOnChange = (function(_this) {
        return function(value) {
          return onChange(_.extend({}, expr, {
            expr: value
          }));
        };
      })(this);
      multipleJoins = this.exprUtils.isMultipleJoins(expr.table, expr.joins);
      innerAggrStatuses = multipleJoins ? ["literal", "aggregate"] : ["literal", "individual"];
      anyTypeAllowed = !options.types || (indexOf.call(options.types, "boolean") >= 0 && options.types.length === 1);
      innerElem = this.build(expr.expr, destTable, innerOnChange, {
        types: !anyTypeAllowed ? options.types : void 0,
        idTable: options.idTable,
        enumValues: options.enumValues,
        aggrStatuses: innerAggrStatuses
      });
    }
    return H.div({
      style: {
        display: "flex",
        alignItems: "baseline"
      }
    }, R(LinkComponent, {
      onRemove: (function(_this) {
        return function() {
          return onChange(null);
        };
      })(this)
    }, joinsStr), innerElem);
  };

  ExprElementBuilder.prototype.buildOp = function(expr, table, onChange, options) {
    var aggr, innerAggrStatuses, items, lhsElem, lhsOnChange, lhsTypes, opElem, opItem, opItems, rhs1OnChange, rhs2OnChange, rhsElem, rhsOnChange;
    if (options == null) {
      options = {};
    }
    switch (expr.op) {
      case 'and':
      case 'or':
      case '+':
      case '*':
      case '-':
      case "/":
        items = _.map(expr.exprs, (function(_this) {
          return function(innerExpr, i) {
            var elem, handleRemove, innerElemOnChange, ref, types;
            innerElemOnChange = function(newValue) {
              var newExprs;
              newExprs = expr.exprs.slice();
              newExprs[i] = newValue;
              return onChange(_.extend({}, expr, {
                exprs: newExprs
              }));
            };
            types = (ref = expr.op) === 'and' || ref === 'or' ? ["boolean"] : ["number"];
            elem = _this.build(innerExpr, table, innerElemOnChange, {
              types: types,
              aggrStatuses: options.aggrStatuses,
              suppressWrapOps: [expr.op],
              key: "expr" + i
            });
            handleRemove = function() {
              var exprs;
              exprs = expr.exprs.slice();
              exprs.splice(i, 1);
              return onChange(_.extend({}, expr, {
                exprs: exprs
              }));
            };
            return {
              elem: elem,
              onRemove: handleRemove
            };
          };
        })(this));
        return R(StackedComponent, {
          joinLabel: expr.op,
          items: items
        });
      default:
        opItems = this.exprUtils.findMatchingOpItems({
          op: expr.op,
          resultTypes: options.types,
          lhsExpr: expr.exprs[0]
        });
        opItem = opItems[0];
        if (!opItem) {
          throw new Error("No opItem defined for op:" + expr.op + ", resultType: " + options.types + ", lhs:" + (JSON.stringify(expr.exprs[0])));
        }
        if (opItem.exprTypes.length === 0) {
          return R(LinkComponent, {
            onRemove: (function(_this) {
              return function() {
                return onChange(null);
              };
            })(this)
          }, this.exprUtils.summarizeExpr(expr, this.locale));
        }
        innerAggrStatuses = opItem.aggr ? ["literal", "individual"] : options.aggrStatuses;
        lhsOnChange = (function(_this) {
          return function(newValue) {
            var newExprs;
            newExprs = expr.exprs.slice();
            newExprs[0] = newValue;
            return onChange(_.extend({}, expr, {
              exprs: newExprs
            }));
          };
        })(this);
        lhsTypes = [opItem.exprTypes[0]];
        if (!expr.exprs[0]) {
          lhsTypes = _.map(opItems, function(oi) {
            return oi.exprTypes[0];
          });
        }
        lhsElem = this.build(expr.exprs[0], table, lhsOnChange, {
          types: lhsTypes,
          aggrStatuses: innerAggrStatuses,
          key: "lhs",
          placeholder: opItem.lhsPlaceholder
        });
        if (expr.op === "between") {
          rhs1OnChange = (function(_this) {
            return function(newValue) {
              var newExprs;
              newExprs = expr.exprs.slice();
              newExprs[1] = newValue;
              return onChange(_.extend({}, expr, {
                exprs: newExprs
              }));
            };
          })(this);
          rhs2OnChange = (function(_this) {
            return function(newValue) {
              var newExprs;
              newExprs = expr.exprs.slice();
              newExprs[2] = newValue;
              return onChange(_.extend({}, expr, {
                exprs: newExprs
              }));
            };
          })(this);
          rhsElem = [
            this.build(expr.exprs[1], table, rhs1OnChange, {
              types: [opItem.exprTypes[1]],
              enumValues: this.exprUtils.getExprEnumValues(expr.exprs[0]),
              idTable: this.exprUtils.getExprIdTable(expr.exprs[0]),
              refExpr: expr.exprs[0],
              preferLiteral: true,
              aggrStatuses: innerAggrStatuses,
              key: "expr1"
            }), "\u00A0and\u00A0", this.build(expr.exprs[2], table, rhs2OnChange, {
              types: [opItem.exprTypes[2]],
              enumValues: this.exprUtils.getExprEnumValues(expr.exprs[0]),
              idTable: this.exprUtils.getExprIdTable(expr.exprs[0]),
              refExpr: expr.exprs[0],
              preferLiteral: true,
              aggrStatuses: innerAggrStatuses,
              key: "expr2"
            })
          ];
        } else if (opItem.exprTypes.length > 1) {
          rhsOnChange = (function(_this) {
            return function(newValue) {
              var newExprs;
              newExprs = expr.exprs.slice();
              newExprs[1] = newValue;
              return onChange(_.extend({}, expr, {
                exprs: newExprs
              }));
            };
          })(this);
          rhsElem = this.build(expr.exprs[1], table, rhsOnChange, {
            key: "rhs",
            types: [opItem.exprTypes[1]],
            enumValues: this.exprUtils.getExprEnumValues(expr.exprs[0]),
            idTable: this.exprUtils.getExprIdTable(expr.exprs[0]),
            refExpr: expr.exprs[0],
            preferLiteral: opItem.rhsLiteral,
            aggrStatuses: innerAggrStatuses,
            placeholder: opItem.rhsPlaceholder
          });
        }
        aggr = null;
        if (indexOf.call(options.aggrStatuses, "aggregate") < 0) {
          aggr = false;
        }
        opItems = this.exprUtils.findMatchingOpItems({
          resultTypes: options.types,
          lhsExpr: expr.exprs[0],
          aggr: aggr
        });
        opItems = _.filter(opItems, function(oi) {
          return oi.op !== expr.op;
        });
        opItems = _.filter(opItems, function(oi) {
          return oi.prefix === opItem.prefix;
        });
        opItems = _.uniq(opItems, "op");
        opElem = R(LinkComponent, {
          dropdownItems: [
            {
              id: "_remove",
              name: [
                H.i({
                  className: "fa fa-remove text-muted"
                }), " Remove"
              ]
            }
          ].concat(_.map(opItems, function(oi) {
            return {
              id: oi.op,
              name: oi.name
            };
          })),
          onDropdownItemClicked: (function(_this) {
            return function(op) {
              if (op === "_remove") {
                return onChange(null);
              } else {
                return onChange(_.extend({}, expr, {
                  op: op
                }));
              }
            };
          })(this)
        }, opItem.prefixLabel || opItem.name);
        if (opItem.prefix) {
          return H.div({
            style: {
              display: "flex",
              alignItems: "baseline",
              flexWrap: "wrap"
            }
          }, opElem, lhsElem, opItem.joiner ? H.span({
            style: {
              paddingLeft: 5,
              paddingRight: 5
            }
          }, opItem.joiner) : void 0, rhsElem);
        } else {
          return H.div({
            style: {
              display: "flex",
              alignItems: "baseline",
              flexWrap: "wrap"
            }
          }, lhsElem, opElem, rhsElem);
        }
    }
  };

  ExprElementBuilder.prototype.buildCase = function(expr, onChange, options) {
    var items, labelStyle, onElseChange;
    labelStyle = {
      flex: "0 0 auto",
      padding: 5,
      color: "#AAA"
    };
    items = _.map(expr.cases, (function(_this) {
      return function(cse, i) {
        var elem, handleRemove, innerElemOnThenChange, innerElemOnWhenChange;
        innerElemOnWhenChange = function(newWhen) {
          var cases;
          cases = expr.cases.slice();
          cases[i] = _.extend({}, cases[i], {
            when: newWhen
          });
          return onChange(_.extend({}, expr, {
            cases: cases
          }));
        };
        innerElemOnThenChange = function(newThen) {
          var cases;
          cases = expr.cases.slice();
          cases[i] = _.extend({}, cases[i], {
            then: newThen
          });
          return onChange(_.extend({}, expr, {
            cases: cases
          }));
        };
        elem = H.div({
          key: "" + i,
          style: {
            display: "flex",
            alignItems: "baseline"
          }
        }, H.div({
          key: "when",
          style: {
            display: "flex",
            alignItems: "baseline"
          }
        }, H.div({
          key: "label",
          style: labelStyle
        }, "if"), _this.build(cse.when, expr.table, innerElemOnWhenChange, {
          key: "content",
          types: ["boolean"],
          suppressWrapOps: ["if"]
        })), H.div({
          key: "then",
          style: {
            display: "flex",
            alignItems: "baseline"
          }
        }, H.div({
          key: "label",
          style: labelStyle
        }, "then"), _this.build(cse.then, expr.table, innerElemOnThenChange, {
          key: "content",
          types: options.types,
          preferLiteral: true,
          enumValues: options.enumValues
        })));
        handleRemove = function() {
          var cases;
          cases = expr.cases.slice();
          cases.splice(i, 1);
          return onChange(_.extend({}, expr, {
            cases: cases
          }));
        };
        return {
          elem: elem,
          onRemove: handleRemove
        };
      };
    })(this));
    onElseChange = (function(_this) {
      return function(newValue) {
        return onChange(_.extend({}, expr, {
          "else": newValue
        }));
      };
    })(this);
    items.push({
      elem: H.div({
        key: "when",
        style: {
          display: "flex",
          alignItems: "baseline"
        }
      }, H.div({
        key: "label",
        style: labelStyle
      }, "else"), this.build(expr["else"], expr.table, onElseChange, {
        key: "content",
        types: options.types,
        preferLiteral: true,
        enumValues: options.enumValues
      }))
    });
    return R(StackedComponent, {
      items: items
    });
  };

  ExprElementBuilder.prototype.buildScore = function(expr, onChange, options) {
    return R(ScoreExprComponent, {
      schema: this.schema,
      dataSource: this.dataSource,
      value: expr,
      onChange: onChange
    });
  };

  ExprElementBuilder.prototype.buildBuildEnumset = function(expr, onChange, options) {
    return R(BuildEnumsetExprComponent, {
      schema: this.schema,
      dataSource: this.dataSource,
      value: expr,
      enumValues: options.enumValues,
      onChange: onChange
    });
  };

  return ExprElementBuilder;

})();

WrappedLinkComponent = (function(superClass) {
  extend(WrappedLinkComponent, superClass);

  function WrappedLinkComponent() {
    return WrappedLinkComponent.__super__.constructor.apply(this, arguments);
  }

  WrappedLinkComponent.propTypes = {
    links: React.PropTypes.array.isRequired
  };

  WrappedLinkComponent.prototype.renderLinks = function() {
    return H.div({
      style: {
        position: "absolute",
        left: 10,
        bottom: 0
      },
      className: "hover-display-child"
    }, _.map(this.props.links, (function(_this) {
      return function(link, i) {
        return H.a({
          key: "" + i,
          style: {
            paddingLeft: 3,
            paddingRight: 3,
            backgroundColor: "white",
            cursor: "pointer",
            fontSize: 12
          },
          onClick: link.onClick
        }, link.label);
      };
    })(this)));
  };

  WrappedLinkComponent.prototype.render = function() {
    return H.div({
      style: {
        paddingBottom: 20,
        position: "relative"
      },
      className: "hover-display-parent"
    }, H.div({
      style: {
        position: "absolute",
        height: 10,
        bottom: 10,
        left: 0,
        right: 0,
        borderLeft: "solid 1px #DDD",
        borderBottom: "solid 1px #DDD",
        borderRight: "solid 1px #DDD"
      },
      className: "hover-display-child"
    }), this.renderLinks(), this.props.children);
  };

  return WrappedLinkComponent;

})(React.Component);
