var EnumSetComponent, ExprElementBuilder, ExprUtils, H, LinkComponent, OmniBoxExprComponent, R, React, StackedComponent, TextArrayComponent, WrappedLinkComponent, _,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

R = React.createElement;

H = React.DOM;

ExprUtils = require("mwater-expressions").ExprUtils;

OmniBoxExprComponent = require('./OmniBoxExprComponent');

ExprUtils = require("mwater-expressions").ExprUtils;

EnumSetComponent = require('./EnumSetComponent');

TextArrayComponent = require('./TextArrayComponent');

LinkComponent = require('./LinkComponent');

StackedComponent = require('./StackedComponent');

module.exports = ExprElementBuilder = (function() {
  function ExprElementBuilder(schema, dataSource, locale) {
    this.schema = schema;
    this.dataSource = dataSource;
    this.locale = locale;
    this.exprUtils = new ExprUtils(this.schema);
  }

  ExprElementBuilder.prototype.build = function(expr, table, onChange, options) {
    var booleanOnly, createWrapOp, elem, exprType, innerOnChange, links;
    if (options == null) {
      options = {};
    }
    booleanOnly = options.types && options.types.length === 1 && options.types[0] === "boolean";
    innerOnChange = (function(_this) {
      return function(newExpr) {
        var args, exprType, i, j, opItem, ref;
        exprType = _this.exprUtils.getExprType(newExpr);
        if (booleanOnly && exprType && exprType !== "boolean") {
          opItem = _this.exprUtils.findMatchingOpItems({
            resultType: "boolean",
            exprTypes: [exprType]
          })[0];
          if (opItem) {
            newExpr = {
              type: "op",
              table: table,
              op: opItem.op,
              exprs: [newExpr]
            };
            args = opItem.exprTypes.length - 1;
            for (i = j = 1, ref = args; 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
              newExpr.exprs.push(null);
            }
          }
        }
        return onChange(newExpr);
      };
    })(this);
    exprType = this.exprUtils.getExprType(expr);
    if ((expr && expr.type === "literal") || (!expr && options.preferLiteral)) {
      if (exprType === "text[]" || _.isEqual(options.types, ["text[]"])) {
        return R(TextArrayComponent, {
          key: options.key,
          value: expr,
          refExpr: options.refExpr,
          schema: this.schema,
          dataSource: this.dataSource,
          onChange: onChange
        });
      }
      if (exprType === "enumset" || _.isEqual(options.types, ["enumset"])) {
        return R(EnumSetComponent, {
          key: options.key,
          value: expr,
          enumValues: options.enumValues,
          onChange: onChange
        });
      }
    }
    if (!expr || !expr.type || expr.type === "literal") {
      elem = R(OmniBoxExprComponent, {
        schema: this.schema,
        table: table,
        value: expr,
        onChange: innerOnChange,
        types: !booleanOnly ? options.types : void 0,
        enumValues: options.enumValues,
        initialMode: options.preferLiteral ? "literal" : void 0,
        includeCount: options.includeCount,
        enumValues: options.enumValues
      });
    } else if (expr.type === "op") {
      elem = this.buildOp(expr, table, innerOnChange, options);
    } else if (expr.type === "field") {
      elem = this.buildField(expr, innerOnChange, {
        key: options.key
      });
    } else if (expr.type === "scalar") {
      elem = this.buildScalar(expr, innerOnChange, {
        key: options.key,
        types: options.types
      });
    } else if (expr.type === "case") {
      elem = this.buildCase(expr, innerOnChange, {
        key: options.key,
        types: options.types,
        enumValues: options.enumValues
      });
    } else if (expr.type === "id") {
      elem = this.buildId(expr, innerOnChange, {
        key: options.key
      });
    } else {
      throw new Error("Unhandled expression type " + expr.type);
    }
    links = [];
    createWrapOp = (function(_this) {
      return function(op, name, binaryOnly) {
        if (indexOf.call(options.suppressWrapOps || [], op) < 0) {
          if (expr.op !== op || binaryOnly) {
            return links.push({
              label: name,
              onClick: function() {
                return innerOnChange({
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
                return innerOnChange(_.extend({}, expr, {
                  exprs: exprs
                }));
              }
            });
          }
        }
      };
    })(this);
    if (exprType === "boolean") {
      createWrapOp("and", "+ And", false);
      createWrapOp("or", "+ Or", false);
    }
    if (exprType === "number") {
      createWrapOp("+", "+", false);
      createWrapOp("-", "-", true);
      createWrapOp("*", "*", false);
      createWrapOp("/", "/", true);
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
            return innerOnChange(_.extend({}, expr, {
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

  ExprElementBuilder.prototype.buildField = function(expr, onChange, options) {
    if (options == null) {
      options = {};
    }
    return R(LinkComponent, {
      dropdownItems: [
        {
          id: "remove",
          name: "Remove"
        }
      ],
      onDropdownItemClicked: (function(_this) {
        return function() {
          return onChange(null);
        };
      })(this)
    }, this.exprUtils.summarizeExpr(expr));
  };

  ExprElementBuilder.prototype.buildId = function(expr, onChange, options) {
    if (options == null) {
      options = {};
    }
    return R(LinkComponent, {
      dropdownItems: [
        {
          id: "remove",
          name: "Remove"
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
    var aggr, aggrElem, aggrs, innerOnChange, j, join, joinCol, joinsStr, len, ref, ref1, t;
    if (options == null) {
      options = {};
    }
    if (expr.aggr) {
      aggrs = this.exprUtils.getAggrs(expr.expr);
      aggr = _.findWhere(aggrs, {
        id: expr.aggr
      });
      aggrElem = R(LinkComponent, {
        dropdownItems: _.map(aggrs, function(ag) {
          return {
            id: ag.id,
            name: ag.name
          };
        }),
        onDropdownItemClicked: (function(_this) {
          return function(aggr) {
            return onChange(_.extend({}, expr, {
              aggr: aggr
            }));
          };
        })(this)
      }, aggr.name);
    }
    t = expr.table;
    joinsStr = "";
    ref = expr.joins;
    for (j = 0, len = ref.length; j < len; j++) {
      join = ref[j];
      joinCol = this.schema.getColumn(t, join);
      joinsStr += ExprUtils.localizeString(joinCol.name, this.locale) + " > ";
      t = joinCol.join.toTable;
    }
    if (expr.expr && ((ref1 = expr.expr.type) === "field" || ref1 === "id")) {
      joinsStr = this.exprUtils.summarizeExpr(_.omit(expr, "aggr"));
      return R(LinkComponent, {
        dropdownItems: [
          {
            id: "remove",
            name: "Remove"
          }
        ],
        onDropdownItemClicked: (function(_this) {
          return function() {
            return onChange(null);
          };
        })(this)
      }, joinsStr);
    }
    innerOnChange = (function(_this) {
      return function(value) {
        return onChange(_.extend({}, expr, {
          expr: value
        }));
      };
    })(this);
    return H.div({
      style: {
        display: "flex",
        alignItems: "baseline"
      }
    }, aggrElem, R(LinkComponent, {
      dropdownItems: [
        {
          id: "remove",
          name: "Remove"
        }
      ],
      onDropdownItemClicked: (function(_this) {
        return function() {
          return onChange(null);
        };
      })(this)
    }, joinsStr), this.build(expr.expr, (expr.expr ? expr.expr.table : void 0), innerOnChange, {
      types: options.types
    }));
  };

  ExprElementBuilder.prototype.buildOp = function(expr, table, onChange, options) {
    var expr1Type, items, lhsElem, lhsOnChange, opElem, opItem, opItems, rhs1OnChange, rhs2OnChange, rhsElem, rhsOnChange;
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
              suppressWrapOps: [expr.op]
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
        expr1Type = this.exprUtils.getExprType(expr.exprs[0]);
        opItem = this.exprUtils.findMatchingOpItems({
          op: expr.op,
          resultType: options.types,
          exprTypes: [expr1Type]
        })[0];
        if (!opItem) {
          throw new Error("No opItem defined for op:" + expr.op + ", resultType: " + options.types + ", lhs:" + expr1Type);
        }
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
        lhsElem = this.build(expr.exprs[0], table, lhsOnChange, {
          types: [opItem.exprTypes[0]]
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
              refExpr: expr.exprs[0],
              preferLiteral: true
            }), "\u00A0and\u00A0", this.build(expr.exprs[2], table, rhs2OnChange, {
              types: [opItem.exprTypes[2]],
              enumValues: this.exprUtils.getExprEnumValues(expr.exprs[0]),
              refExpr: expr.exprs[0],
              preferLiteral: true
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
            types: [opItem.exprTypes[1]],
            enumValues: this.exprUtils.getExprEnumValues(expr.exprs[0]),
            refExpr: expr.exprs[0],
            preferLiteral: true
          });
        }
        opItems = this.exprUtils.findMatchingOpItems({
          resultType: options.types,
          exprTypes: [expr1Type]
        });
        opItems = _.filter(opItems, function(oi) {
          return oi.op !== expr.op;
        });
        opElem = R(LinkComponent, {
          dropdownItems: _.map(opItems, function(oi) {
            return {
              id: oi.op,
              name: oi.name
            };
          }),
          onDropdownItemClicked: (function(_this) {
            return function(op) {
              return onChange(_.extend({}, expr, {
                op: op
              }));
            };
          })(this)
        }, opItem.name);
        return H.div({
          style: {
            display: "flex",
            alignItems: "baseline",
            flexWrap: "wrap"
          }
        }, lhsElem, opElem, rhsElem);
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
