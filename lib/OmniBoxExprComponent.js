var ClickOutHandler, DateTimePickerComponent, DropdownComponent, ExprUtils, H, LinkComponent, OmniBoxExprComponent, R, React, ScalarExprTreeBuilder, ScalarExprTreeComponent, _, moment,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

_ = require('lodash');

React = require('react');

R = React.createElement;

H = React.DOM;

ClickOutHandler = require('react-onclickout');

moment = require('moment');

ScalarExprTreeComponent = require('./ScalarExprTreeComponent');

ScalarExprTreeBuilder = require('./ScalarExprTreeBuilder');

DropdownComponent = require('./DropdownComponent');

LinkComponent = require('./LinkComponent');

DateTimePickerComponent = require('./DateTimePickerComponent');

ExprUtils = require('mwater-expressions').ExprUtils;

module.exports = OmniBoxExprComponent = (function(superClass) {
  extend(OmniBoxExprComponent, superClass);

  OmniBoxExprComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    table: React.PropTypes.string.isRequired,
    value: React.PropTypes.object,
    onChange: React.PropTypes.func,
    types: React.PropTypes.array,
    enumValues: React.PropTypes.array,
    noFormulaPlaceholder: React.PropTypes.string,
    noLiteralPlaceholder: React.PropTypes.string,
    initialMode: React.PropTypes.oneOf(['formula', 'literal']),
    idTable: React.PropTypes.string,
    includeCount: React.PropTypes.bool,
    allowCase: React.PropTypes.bool
  };

  OmniBoxExprComponent.defaultProps = {
    noFormulaPlaceholder: "Select...",
    noLiteralPlaceholder: "Enter Value...",
    initialMode: "formula"
  };

  OmniBoxExprComponent.contextTypes = {
    locale: React.PropTypes.string
  };

  function OmniBoxExprComponent(props) {
    this.handleDateTimeSelected = bind(this.handleDateTimeSelected, this);
    this.handleDateSelected = bind(this.handleDateSelected, this);
    this.handleModeChange = bind(this.handleModeChange, this);
    this.handleTreeChange = bind(this.handleTreeChange, this);
    this.handleIfSelected = bind(this.handleIfSelected, this);
    this.handleEnumSelected = bind(this.handleEnumSelected, this);
    this.handleKeyDown = bind(this.handleKeyDown, this);
    this.handleBlur = bind(this.handleBlur, this);
    this.handleFocus = bind(this.handleFocus, this);
    this.handleTextChange = bind(this.handleTextChange, this);
    OmniBoxExprComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      focused: false,
      mode: props.initialMode,
      inputText: ""
    };
    if (props.value && props.value.type === "literal") {
      this.state.mode = "literal";
      this.state.inputText = this.stringifyLiteral(props, props.value);
    }
    if (props.value && props.value.type !== "literal") {
      throw new Error("Cannot display expression type " + props.value.type);
    }
  }

  OmniBoxExprComponent.prototype.componentWillReceiveProps = function(newProps) {
    if (newProps.value && newProps.value.type === "literal") {
      this.setState({
        mode: "literal",
        inputText: this.stringifyLiteral(newProps, newProps.value)
      });
    } else {
      this.setState({
        mode: newProps.initialMode,
        inputText: ""
      });
    }
    if (newProps.value && newProps.value.type !== "literal") {
      throw new Error("Cannot display expression type " + newProps.value.type);
    }
  };

  OmniBoxExprComponent.prototype.stringifyLiteral = function(props, literalExpr) {
    var item;
    if (literalExpr && literalExpr.valueType === "enum") {
      item = _.findWhere(props.enumValues, {
        id: literalExpr.value
      });
      if (item) {
        return ExprUtils.localizeString(item.name, this.context.locale);
      }
      return "???";
    }
    if (literalExpr && (literalExpr.value != null)) {
      if (literalExpr.valueType === "date") {
        return moment(literalExpr.value, moment.ISO_8601).format("l");
      }
      if (literalExpr.valueType === "datetime") {
        return moment(literalExpr.value, moment.ISO_8601).format("lll");
      }
      return "" + literalExpr.value;
    }
    return "";
  };

  OmniBoxExprComponent.prototype.handleTextChange = function(ev) {
    return this.setState({
      inputText: ev.target.value
    });
  };

  OmniBoxExprComponent.prototype.handleFocus = function() {
    if (this.state.focused) {
      return;
    }
    this.setState({
      focused: true
    });
    if (this.props.value && this.props.value.valueType === "enum") {
      return this.setState({
        inputText: ""
      });
    }
  };

  OmniBoxExprComponent.prototype.handleBlur = function() {
    var date, value;
    if (!this.state.focused) {
      return;
    }
    this.setState({
      focused: false
    });
    if (this.state.mode === "literal") {
      if (!this.state.inputText) {
        if (this.props.value) {
          this.props.onChange(null);
        }
        return;
      }
      if ((this.props.value && this.props.value.valueType === "number") || indexOf.call(this.props.types || [], "number") >= 0) {
        value = parseFloat(this.state.inputText);
        if (_.isFinite(value)) {
          return this.props.onChange({
            type: "literal",
            valueType: "number",
            value: value
          });
        }
      } else if ((this.props.value && this.props.value.valueType === "text") || indexOf.call(this.props.types || [], "text") >= 0) {
        return this.props.onChange({
          type: "literal",
          valueType: "text",
          value: this.state.inputText
        });
      } else if (indexOf.call(this.props.types || [], "id") >= 0 && this.props.idTable) {
        return this.props.onChange({
          type: "literal",
          valueType: "id",
          idTable: this.props.idTable,
          value: this.state.inputText
        });
      } else if ((this.props.value && this.props.value.valueType === "date") || indexOf.call(this.props.types || [], "date") >= 0) {
        date = moment(this.state.inputText, "l");
        if (date.isValid()) {
          return this.props.onChange({
            type: "literal",
            valueType: "date",
            value: date.format("YYYY-MM-DD")
          });
        } else {
          return this.setState({
            inputText: ""
          });
        }
      } else if ((this.props.value && this.props.value.valueType === "datetime") || indexOf.call(this.props.types || [], "datetime") >= 0) {
        date = moment(this.state.inputText, "lll");
        if (date.isValid()) {
          return this.props.onChange({
            type: "literal",
            valueType: "datetime",
            value: date.toISOString()
          });
        } else {
          return this.setState({
            inputText: ""
          });
        }
      }
    }
  };

  OmniBoxExprComponent.prototype.handleKeyDown = function(ev) {
    if (ev.keyCode === 13 || ev.keyCode === 9) {
      return this.handleBlur();
    }
  };

  OmniBoxExprComponent.prototype.handleEnumSelected = function(id) {
    if (id != null) {
      this.props.onChange({
        type: "literal",
        valueType: "enum",
        value: id
      });
    } else {
      this.props.onChange(null);
    }
    return this.setState({
      focused: false
    });
  };

  OmniBoxExprComponent.prototype.handleIfSelected = function() {
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

  OmniBoxExprComponent.prototype.handleTreeChange = function(val) {
    var expr, exprUtils;
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

  OmniBoxExprComponent.prototype.handleModeChange = function(mode, ev) {
    ev.stopPropagation();
    this.refs.input.focus();
    if (mode === "formula") {
      return this.setState({
        mode: mode,
        inputText: "",
        focused: true
      });
    } else {
      return this.setState({
        mode: mode,
        inputText: this.stringifyLiteral(this.props, this.props.value),
        focused: true
      });
    }
  };

  OmniBoxExprComponent.prototype.renderModeSwitcher = function() {
    var label, ref;
    if ((!this.props.types || this.props.types.length !== 1) && !this.props.value) {
      return;
    }
    if (this.state.mode === "formula") {
      if (this.props.types[0] === "number") {
        label = "123";
      } else if ((ref = this.props.types[0]) === "text" || ref === "enum" || ref === "enumset" || ref === "date" || ref === "datetime" || ref === "id") {
        label = "abc";
      } else {
        return;
      }
      return H.a({
        onClick: this.handleModeChange.bind(null, "literal")
      }, H.i(null, label));
    } else {
      return H.a({
        onClick: this.handleModeChange.bind(null, "formula")
      }, H.i(null, "f", H.sub(null, "x")));
    }
  };

  OmniBoxExprComponent.prototype.handleDateSelected = function(date) {
    this.setState({
      inputText: date.format("l")
    });
    this.refs.input.blur();
    return this.handleBlur();
  };

  OmniBoxExprComponent.prototype.handleDateTimeSelected = function(datetime) {
    this.setState({
      inputText: datetime.format("lll")
    });
    this.refs.input.blur();
    return this.handleBlur();
  };

  OmniBoxExprComponent.prototype.renderLiteralDropdown = function() {
    var dropdown, escapeRegex, filter;
    if ((this.props.value && this.props.value.valueType === "enum") || indexOf.call(this.props.types || [], "enum") >= 0) {
      escapeRegex = function(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      };
      if (this.state.inputText) {
        filter = new RegExp(escapeRegex(this.state.inputText), "i");
      }
      dropdown = _.map(this.props.enumValues, (function(_this) {
        return function(ev) {
          var name;
          name = ExprUtils.localizeString(ev.name, _this.context.locale);
          if (filter && !name.match(filter)) {
            return null;
          }
          return H.li({
            key: ev.id
          }, H.a({
            onClick: _this.handleEnumSelected.bind(null, ev.id)
          }, name));
        };
      })(this));
      dropdown.unshift(H.li({
        key: "_null"
      }, H.a({
        onClick: this.handleEnumSelected.bind(null, null)
      }, H.i(null, "None"))));
      return dropdown;
    }
    if ((this.props.value && this.props.value.valueType === "date") || indexOf.call(this.props.types || [], "date") >= 0) {
      return R(DateTimePickerComponent, {
        onChange: this.handleDateSelected,
        defaultDate: this.state.inputText
      });
    }
    if ((this.props.value && this.props.value.valueType === "datetime") || indexOf.call(this.props.types || [], "datetime") >= 0) {
      return R(DateTimePickerComponent, {
        timepicker: true,
        onChange: this.handleDateTimeSelected,
        defaultDate: this.state.inputText
      });
    }
  };

  OmniBoxExprComponent.prototype.renderFormulaDropdown = function() {
    var dropdown, escapeRegex, filter, noTree, tree, treeBuilder;
    dropdown = [];
    if (this.props.allowCase) {
      dropdown.push(H.div({
        key: "special"
      }, H.a({
        onClick: this.handleIfSelected,
        style: {
          fontSize: "80%",
          paddingLeft: 10,
          cursor: "pointer"
        }
      }, "If/Then")));
    }
    noTree = this.props.enumValues && _.isEqual(this.props.types, ["enumset"]);
    if (!noTree) {
      escapeRegex = function(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      };
      if (this.state.inputText) {
        filter = new RegExp(escapeRegex(this.state.inputText), "i");
      }
      treeBuilder = new ScalarExprTreeBuilder(this.props.schema, this.context.locale);
      tree = treeBuilder.getTree({
        table: this.props.table,
        types: this.props.types,
        idTable: this.props.idTable,
        includeCount: this.props.includeCount,
        filter: filter
      });
      dropdown.push(R(ScalarExprTreeComponent, {
        key: "scalar_tree",
        tree: tree,
        onChange: this.handleTreeChange,
        height: 350
      }));
    }
    return dropdown;
  };

  OmniBoxExprComponent.prototype.render = function() {
    var dropdown;
    if (this.state.focused) {
      if (this.state.mode === "formula") {
        dropdown = this.renderFormulaDropdown();
      } else if (this.state.mode === "literal") {
        dropdown = this.renderLiteralDropdown();
      }
    }
    return R(ClickOutHandler, {
      onClickOut: this.handleBlur
    }, R(DropdownComponent, {
      dropdown: dropdown
    }, H.div({
      style: {
        position: "absolute",
        right: 10,
        top: 8,
        cursor: "pointer"
      }
    }, this.renderModeSwitcher()), H.input({
      type: "text",
      className: "form-control",
      ref: "input",
      value: this.state.inputText,
      onFocus: this.handleFocus,
      onClick: this.handleFocus,
      onChange: this.handleTextChange,
      onKeyDown: this.handleKeyDown,
      placeholder: this.state.mode === "literal" ? this.props.noLiteralPlaceholder : this.props.noFormulaPlaceholder
    })));
  };

  return OmniBoxExprComponent;

})(React.Component);
