var BuildEnumsetExprComponent, EnumSetComponent, ExprElementBuilder, ExprLinkComponent, ExprUtils, H, IdLiteralComponent, LinkComponent, PropTypes, R, React, ScoreExprComponent, StackedComponent, WrappedLinkComponent, _,
  indexOf = [].indexOf;

PropTypes = require('prop-types');

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

// Builds a react element for an expression
module.exports = ExprElementBuilder = class ExprElementBuilder {
  constructor(schema, dataSource, locale) {
    this.schema = schema;
    this.dataSource = dataSource;
    this.locale = locale;
    this.exprUtils = new ExprUtils(this.schema);
  }

  // Build the tree for an expression
  // Options include:
  //   types: required value types of expression e.g. ['boolean']
  //   key: key of the resulting element
  //   enumValues: array of { id, name } for the enumerable values to display
  //   idTable: the table from which id-type expressions must come
  //   refExpr: expression to get values for (used for literals). This is primarily for text fields to allow easy selecting of literal values
  //   preferLiteral: to preferentially choose literal expressions (used for RHS of expressions)
  //   suppressWrapOps: pass ops to *not* offer to wrap in
  //   includeAggr: true to include count (id) item at root level in expression selector
  //   aggrStatuses: statuses of aggregation to allow. list of "individual", "literal", "aggregate". Default: ["individual", "literal"]
  //   placeholder: empty placeholder
  //   exprLinkRef: ref to put on expr link component
  build(expr, table, onChange, options = {}) {
    var anyTypeAllowed, booleanOnly, createWrapOp, elem, exprType, links;
    _.defaults(options, {
      aggrStatuses: ["individual", "literal"]
    });
    // True if a boolean expression is required
    booleanOnly = options.types && options.types.length === 1 && options.types[0] === "boolean";
    
    // True if an aggregate number or individual boolean is required, in which case any expression can be transformed into it
    anyTypeAllowed = !options.types || (indexOf.call(options.types, "boolean") >= 0 && indexOf.call(options.aggrStatuses, "individual") >= 0 && options.types.length === 1) || (indexOf.call(options.types, "number") >= 0 && indexOf.call(options.aggrStatuses, "aggregate") >= 0);
    // Get current expression type
    exprType = this.exprUtils.getExprType(expr);
    // Handle empty and literals and fields with ExprLinkComponent
    if (!expr || !expr.type || expr.type === "literal" || expr.type === "field") {
      elem = R(ExprLinkComponent, {
        schema: this.schema,
        dataSource: this.dataSource,
        table: table,
        value: expr,
        onChange: onChange,
        // Allow any type if transformable
        types: !anyTypeAllowed ? options.types : void 0,
        // Case statements only when not boolean
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
    // else if expr.type == "field"
    //   elem = @buildField(expr, onChange, { key: options.key })
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
      throw new Error(`Unhandled expression type ${expr.type}`);
    }
    // Wrap element with hover links to build more complex expressions or to clear it
    links = [];
    // Create a link to wrap the expression with an op. type is "n" for +/* that can take n, "binary" for -//, "unary" for sum, etc.
    createWrapOp = (op, name, type = "unary") => {
      if (indexOf.call(options.suppressWrapOps || [], op) < 0) {
        if (type === "unary") {
          return links.push({
            label: name,
            onClick: () => {
              return onChange({
                type: "op",
                op: op,
                table: table,
                exprs: [expr]
              });
            }
          });
        // Prevent nesting when simple adding would work
        } else if (expr.op !== op || type === "binary") {
          return links.push({
            label: name,
            onClick: () => {
              return onChange({
                type: "op",
                op: op,
                table: table,
                exprs: [expr, null]
              });
            }
          });
        } else {
          // Just add extra element for n items
          return links.push({
            label: name,
            onClick: () => {
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
    // If boolean, add and/or link. 
    if (exprType === "boolean") {
      createWrapOp("and", "+ And", "n");
      createWrapOp("or", "+ Or", "n");
      createWrapOp("not", "Not", "unary");
      createWrapOp("is null", "Is blank", "unary");
    }
    if (exprType === "number") {
      createWrapOp("+", "+", "n");
      createWrapOp("-", "-", "binary");
      createWrapOp("*", "*", "n");
      createWrapOp("/", "/", "binary");
      // If option to wrap in sum
      if (indexOf.call(options.aggrStatuses, "aggregate") >= 0 && this.exprUtils.getExprAggrStatus(expr) === "individual") {
        createWrapOp("sum", "Total", "unary");
      }
    }
    // Add + If
    if (expr && expr.type === "case") {
      links.push({
        label: "+ If",
        onClick: () => {
          var cases;
          cases = expr.cases.slice();
          cases.push({
            when: null,
            then: null
          });
          return onChange(_.extend({}, expr, {
            cases: cases
          }));
        }
      });
    }
    // links.push({ label: "Remove", onClick: => onChange(null) })
    if (links.length > 0) {
      elem = R(WrappedLinkComponent, {
        links: links
      }, elem);
    }
    return elem;
  }

  // Build an id component. Displays table name. Only remove option
  buildId(expr, onChange, options = {}) {
    return R(LinkComponent, {
      dropdownItems: [
        {
          id: "remove",
          name: [
            H.i({
              className: "fa fa-remove text-muted"
            }),
            " Remove"
          ]
        }
      ],
      onDropdownItemClicked: () => {
        return onChange(null);
      }
    }, this.exprUtils.summarizeExpr(expr));
  }

  buildScalar(expr, onChange, options = {}) {
    var anyTypeAllowed, destTable, innerAggrStatuses, innerElem, innerOnChange, j, join, joinCol, joinsStr, len, multipleJoins, ref, ref1, summary;
    // Get joins string
    destTable = expr.table;
    joinsStr = "";
    ref = expr.joins;
    for (j = 0, len = ref.length; j < len; j++) {
      join = ref[j];
      joinCol = this.schema.getColumn(destTable, join);
      joinsStr += ExprUtils.localizeString(joinCol.name, this.locale) + " > ";
      destTable = joinCol.join.toTable;
    }
    // If just a field or id inside, add to string and make a simple link control
    if (expr.expr && ((ref1 = expr.expr.type) === "field" || ref1 === "id")) {
      // Summarize without aggregation
      summary = this.exprUtils.summarizeExpr(_.omit(expr, "aggr"));
      return H.div({
        style: {
          display: "flex",
          alignItems: "baseline"
        }
      // Aggregate dropdown
      }, R(LinkComponent, {
        dropdownItems: [
          {
            id: "remove",
            name: [
              H.i({
                className: "fa fa-remove text-muted"
              }),
              " Remove"
            ]
          }
        ],
        onDropdownItemClicked: () => {
          return onChange(null);
        }
      }, summary));
    } else {
      // Create inner expression onChange
      innerOnChange = (value) => {
        return onChange(_.extend({}, expr, {
          expr: value
        }));
      };
      // Determine if can allow aggregation
      multipleJoins = this.exprUtils.isMultipleJoins(expr.table, expr.joins);
      innerAggrStatuses = multipleJoins ? ["literal", "aggregate"] : ["literal", "individual"];
      // True if an individual boolean is required, in which case any expression can be transformed into it
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
      dropdownItems: [
        {
          id: "remove",
          name: [
            H.i({
              className: "fa fa-remove text-muted"
            }),
            " Remove"
          ]
        }
      ],
      onDropdownItemClicked: () => {
        return onChange(null);
      }
    }, joinsStr), innerElem);
  }

  // Builds on op component
  buildOp(expr, table, onChange, options = {}) {
    var aggr, innerAggrStatuses, items, lhsElem, lhsOnChange, lhsTypes, opElem, opItem, opItems, rhs1OnChange, rhs2OnChange, rhsElem, rhsOnChange;
    switch (expr.op) {
      // For vertical ops (ones with n values or other arithmetic)
      case 'and':
      case 'or':
      case '+':
      case '*':
      case '-':
      case "/":
        // Create inner items
        items = _.map(expr.exprs, (innerExpr, i) => {
          var elem, handleRemove, innerElemOnChange, ref, types;
          // Create onChange that switched single value
          innerElemOnChange = (newValue) => {
            var newExprs;
            newExprs = expr.exprs.slice();
            newExprs[i] = newValue;
            // Set expr value
            return onChange(_.extend({}, expr, {
              exprs: newExprs
            }));
          };
          types = (ref = expr.op) === 'and' || ref === 'or' ? ["boolean"] : ["number"];
          elem = this.build(innerExpr, table, innerElemOnChange, {
            types: types,
            aggrStatuses: options.aggrStatuses,
            suppressWrapOps: [expr.op],
            key: `expr${i}`
          });
          handleRemove = () => {
            var exprs;
            exprs = expr.exprs.slice();
            exprs.splice(i, 1);
            // If only one left, remove op entirely
            if (exprs.length === 1) {
              return onChange(exprs[0]);
            } else {
              return onChange(_.extend({}, expr, {
                exprs: exprs
              }));
            }
          };
          return {
            elem: elem,
            onRemove: handleRemove
          };
        });
        
        // Create stacked expression
        return R(StackedComponent, {
          joinLabel: expr.op,
          items: items
        });
      default:
        // Horizontal expression. Render each part
        opItems = this.exprUtils.findMatchingOpItems({
          op: expr.op,
          resultTypes: options.types,
          lhsExpr: expr.exprs[0]
        });
        opItem = opItems[0];
        if (!opItem) {
          throw new Error(`No opItem defined for op:${expr.op}, resultType: ${options.types}, lhs:${JSON.stringify(expr.exprs[0])}`);
        }
        // Special case for no expressions
        if (opItem.exprTypes.length === 0) {
          return R(LinkComponent, {
            dropdownItems: [
              {
                id: "remove",
                name: [
                  H.i({
                    className: "fa fa-remove text-muted"
                  }),
                  " Remove"
                ]
              }
            ],
            onDropdownItemClicked: (() => {
              return onChange(null);
            })
          }, this.exprUtils.summarizeExpr(expr, this.locale));
        }
        innerAggrStatuses = opItem.aggr ? ["literal", "individual"] : options.aggrStatuses;
        lhsOnChange = (newValue) => {
          var newExprs;
          newExprs = expr.exprs.slice();
          newExprs[0] = newValue;
          // Set expr value
          return onChange(_.extend({}, expr, {
            exprs: newExprs
          }));
        };
        
        // lhs type is matching op item
        lhsTypes = [opItem.exprTypes[0]];
        // However, if there are multiple possibilities and there is no existing lhs, allow all (as in days difference can take date or datetime)
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
        // Special case for between 
        if (expr.op === "between") {
          rhs1OnChange = (newValue) => {
            var newExprs;
            newExprs = expr.exprs.slice();
            newExprs[1] = newValue;
            // Set expr value
            return onChange(_.extend({}, expr, {
              exprs: newExprs
            }));
          };
          rhs2OnChange = (newValue) => {
            var newExprs;
            newExprs = expr.exprs.slice();
            newExprs[2] = newValue;
            // Set expr value
            return onChange(_.extend({}, expr, {
              exprs: newExprs
            }));
          };
          // Build rhs
          rhsElem = [
            this.build(expr.exprs[1],
            table,
            rhs1OnChange,
            {
              types: [opItem.exprTypes[1]],
              enumValues: this.exprUtils.getExprEnumValues(expr.exprs[0]),
              idTable: this.exprUtils.getExprIdTable(expr.exprs[0]),
              refExpr: expr.exprs[0],
              preferLiteral: true,
              aggrStatuses: innerAggrStatuses,
              key: "expr1"
            }),
            "\u00A0and\u00A0",
            this.build(expr.exprs[2],
            table,
            rhs2OnChange,
            {
              types: [opItem.exprTypes[2]],
              enumValues: this.exprUtils.getExprEnumValues(expr.exprs[0]),
              idTable: this.exprUtils.getExprIdTable(expr.exprs[0]),
              refExpr: expr.exprs[0],
              preferLiteral: true,
              aggrStatuses: innerAggrStatuses,
              key: "expr2"
            })
          ];
        } else if (opItem.exprTypes.length > 1) { // If has two expressions
          rhsOnChange = (newValue) => {
            var newExprs;
            newExprs = expr.exprs.slice();
            newExprs[1] = newValue;
            // Set expr value
            return onChange(_.extend({}, expr, {
              exprs: newExprs
            }));
          };
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
        // Create op dropdown (finding matching type and lhs, not op). Allow aggregates if appropriate
        aggr = null;
        if (indexOf.call(options.aggrStatuses, "aggregate") < 0) {
          aggr = false;
        }
        opItems = this.exprUtils.findMatchingOpItems({
          resultTypes: options.types,
          lhsExpr: expr.exprs[0],
          aggr: aggr
        });
        // Remove current op
        opItems = _.filter(opItems, function(oi) {
          return oi.op !== expr.op;
        });
        // Prefix toggle must be the same as current expr
        opItems = _.filter(opItems, function(oi) {
          return oi.prefix === opItem.prefix;
        });
        // Keep distinct ops
        opItems = _.uniq(opItems, "op");
        opElem = R(LinkComponent, {
          dropdownItems: [
            {
              id: "_remove",
              name: [
                H.i({
                  className: "fa fa-remove text-muted"
                }),
                " Remove"
              ]
            }
          ].concat(_.map(opItems, function(oi) {
            return {
              id: oi.op,
              name: oi.name
            };
          })),
          onDropdownItemClicked: (op) => {
            if (op === "_remove") {
              return onChange(null);
            } else {
              return onChange(_.extend({}, expr, {
                op: op
              }));
            }
          }
        }, opItem.prefixLabel || opItem.name);
        // Some ops have prefix (e.g. "latitude of")
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
  }

  buildCase(expr, onChange, options) {
    var items, labelStyle, onElseChange;
    // Style for labels "if", "then", "else"
    labelStyle = {
      flex: "0 0 auto", // Don't resize
      padding: 5,
      color: "#AAA"
    };
    // Create inner elements
    items = _.map(expr.cases, (cse, i) => {
      var elem, handleRemove, innerElemOnThenChange, innerElemOnWhenChange;
      // Create onChange functions
      innerElemOnWhenChange = (newWhen) => {
        var cases;
        cases = expr.cases.slice();
        cases[i] = _.extend({}, cases[i], {
          when: newWhen
        });
        return onChange(_.extend({}, expr, {
          cases: cases
        }));
      };
      innerElemOnThenChange = (newThen) => {
        var cases;
        cases = expr.cases.slice();
        cases[i] = _.extend({}, cases[i], {
          then: newThen
        });
        return onChange(_.extend({}, expr, {
          cases: cases
        }));
      };
      // Build a flexbox that wraps with a when and then flexbox
      elem = H.div({
        key: `${i}`,
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
      }, "if"), this.build(cse.when, expr.table, innerElemOnWhenChange, {
        key: "content",
        types: ["boolean"],
        suppressWrapOps: ["if"],
        aggrStatuses: options.aggrStatuses
      })), H.div({
        key: "then",
        style: {
          display: "flex",
          alignItems: "baseline"
        }
      }, H.div({
        key: "label",
        style: labelStyle
      }, "then"), this.build(cse.then, expr.table, innerElemOnThenChange, {
        key: "content",
        types: options.types,
        preferLiteral: true,
        enumValues: options.enumValues,
        aggrStatuses: options.aggrStatuses
      })));
      handleRemove = () => {
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
    });
    
    // Add else
    onElseChange = (newValue) => {
      return onChange(_.extend({}, expr, {
        else: newValue
      }));
    };
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
      }, "else"), this.build(expr.else, expr.table, onElseChange, {
        key: "content",
        types: options.types,
        preferLiteral: true,
        enumValues: options.enumValues,
        aggrStatuses: options.aggrStatuses
      }))
    });
    // Create stacked expression
    return R(StackedComponent, {
      items: items
    });
  }

  buildScore(expr, onChange, options) {
    return R(ScoreExprComponent, {
      schema: this.schema,
      dataSource: this.dataSource,
      value: expr,
      onChange: onChange
    });
  }

  buildBuildEnumset(expr, onChange, options) {
    return R(BuildEnumsetExprComponent, {
      schema: this.schema,
      dataSource: this.dataSource,
      value: expr,
      enumValues: options.enumValues,
      onChange: onChange
    });
  }

};

WrappedLinkComponent = (function() {
  // TODO DOC
  class WrappedLinkComponent extends React.Component {
    renderLinks() {
      return H.div({
        style: {
          position: "absolute",
          left: 10,
          bottom: 0,
          whiteSpace: "nowrap"
        },
        className: "hover-display-child"
      }, _.map(this.props.links, (link, i) => {
        return H.a({
          key: `${i}`,
          style: {
            paddingLeft: 3,
            paddingRight: 3,
            backgroundColor: "white",
            cursor: "pointer",
            fontSize: 12
          },
          onClick: link.onClick
        }, link.label);
      }));
    }

    render() {
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
    }

  };

  WrappedLinkComponent.propTypes = {
    links: PropTypes.array.isRequired // Shape is label, onClick
  };

  return WrappedLinkComponent;

}).call(this);
