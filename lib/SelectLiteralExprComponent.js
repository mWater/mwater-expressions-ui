var DateTimePickerComponent, EnumAsListComponent, EnumComponent, EnumsetAsListComponent, ExprUtils, IdLiteralComponent, PropTypes, R, React, SelectLiteralExprComponent, TextArrayComponent, _, moment,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

R = React.createElement;

moment = require('moment');

ExprUtils = require('mwater-expressions').ExprUtils;

DateTimePickerComponent = require('./DateTimePickerComponent');

TextArrayComponent = require('./TextArrayComponent');

IdLiteralComponent = require('./IdLiteralComponent');

module.exports = SelectLiteralExprComponent = (function(superClass) {
  extend(SelectLiteralExprComponent, superClass);

  SelectLiteralExprComponent.propTypes = {
    value: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    table: PropTypes.string.isRequired,
    types: PropTypes.array,
    enumValues: PropTypes.array,
    idTable: PropTypes.string,
    refExpr: PropTypes.object
  };

  function SelectLiteralExprComponent(props) {
    this.handleTextChange = bind(this.handleTextChange, this);
    this.handleAccept = bind(this.handleAccept, this);
    this.handleDateTimeSelected = bind(this.handleDateTimeSelected, this);
    this.handleDateSelected = bind(this.handleDateSelected, this);
    this.handleChange = bind(this.handleChange, this);
    var ref;
    SelectLiteralExprComponent.__super__.constructor.call(this, props);
    this.state = {
      value: props.value,
      inputText: null,
      changed: false,
      inputTextError: false
    };
    if (props.value && ((ref = props.value.valueType) === 'text' || ref === 'number')) {
      this.state.inputText = "" + props.value.value;
    }
  }

  SelectLiteralExprComponent.prototype.componentDidMount = function() {
    var ref;
    return (ref = this.inputComp) != null ? ref.focus() : void 0;
  };

  SelectLiteralExprComponent.prototype.handleChange = function(value) {
    return this.setState({
      value: value,
      changed: true
    });
  };

  SelectLiteralExprComponent.prototype.handleDateSelected = function(date) {
    if (date) {
      return this.setState({
        value: {
          type: "literal",
          valueType: "date",
          value: date.format("YYYY-MM-DD")
        },
        changed: true
      });
    } else {
      return this.setState({
        value: null,
        changed: true
      });
    }
  };

  SelectLiteralExprComponent.prototype.handleDateTimeSelected = function(datetime) {
    if (datetime) {
      return this.setState({
        value: {
          type: "literal",
          valueType: "datetime",
          value: datetime.toISOString()
        },
        changed: true
      });
    } else {
      return this.setState({
        value: null,
        changed: true
      });
    }
  };

  SelectLiteralExprComponent.prototype.handleAccept = function() {
    var value;
    if (this.state.inputText != null) {
      if (this.state.inputText === "") {
        this.props.onChange(null);
        return;
      }
      if (((this.props.value && this.props.value.valueType === "number") || indexOf.call(this.props.types || ['number'], "number") >= 0) && this.state.inputText.match(/^-?\d+(\.\d+)?$/)) {
        value = parseFloat(this.state.inputText);
        return this.props.onChange({
          type: "literal",
          valueType: "number",
          value: value
        });
      } else if ((this.props.value && this.props.value.valueType === "text") || indexOf.call(this.props.types || ['text'], "text") >= 0) {
        return this.props.onChange({
          type: "literal",
          valueType: "text",
          value: this.state.inputText
        });
      } else if (indexOf.call(this.props.types || ['id'], "id") >= 0 && this.props.idTable) {
        return this.props.onChange({
          type: "literal",
          valueType: "id",
          idTable: this.props.idTable,
          value: this.state.inputText
        });
      } else {
        return this.setState({
          inputTextError: true
        });
      }
    } else {
      return this.props.onChange(this.state.value);
    }
  };

  SelectLiteralExprComponent.prototype.handleTextChange = function(ev) {
    return this.setState({
      inputText: ev.target.value,
      changed: true
    });
  };

  SelectLiteralExprComponent.prototype.renderTextBox = function() {
    return R('div', {
      className: (this.state.inputTextError ? "has-error" : void 0)
    }, R('input', {
      type: "text",
      className: "form-control",
      value: this.state.inputText || "",
      onChange: this.handleTextChange,
      placeholder: "Enter value..."
    }));
  };

  SelectLiteralExprComponent.prototype.renderInput = function() {
    var expr, exprType, exprUtils, idTable;
    expr = this.state.value;
    exprUtils = new ExprUtils(this.props.schema);
    exprType = exprUtils.getExprType(expr);
    if (exprType === "text[]" || _.isEqual(this.props.types, ["text[]"])) {
      return R(TextArrayComponent, {
        value: expr,
        refExpr: this.props.refExpr,
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        onChange: this.handleChange
      });
    }
    if (exprType === "enum" || _.isEqual(this.props.types, ["enum"])) {
      return R(EnumAsListComponent, {
        value: expr,
        enumValues: this.props.enumValues,
        onChange: this.handleChange
      });
    }
    if (exprType === "enumset" || _.isEqual(this.props.types, ["enumset"])) {
      return R(EnumsetAsListComponent, {
        value: expr,
        enumValues: this.props.enumValues,
        onChange: this.handleChange
      });
    }
    if (exprType === "id" || _.isEqual(this.props.types, ["id"]) && this.props.idTable) {
      idTable = this.props.idTable || exprUtils.getExprIdTable(expr);
      return R(IdLiteralComponent, {
        value: expr != null ? expr.value : void 0,
        idTable: idTable,
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        onChange: (function(_this) {
          return function(value) {
            return _this.handleChange(value ? {
              type: "literal",
              valueType: "id",
              idTable: idTable,
              value: value
            } : null);
          };
        })(this)
      });
    }
    if (exprType === "id[]" || _.isEqual(this.props.types, ["id[]"]) && this.props.idTable) {
      idTable = this.props.idTable || exprUtils.getExprIdTable(expr);
      return R(IdLiteralComponent, {
        value: expr != null ? expr.value : void 0,
        idTable: idTable,
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        multi: true,
        onChange: (function(_this) {
          return function(value) {
            return _this.handleChange(value && value.length > 0 ? {
              type: "literal",
              valueType: "id[]",
              idTable: idTable,
              value: value
            } : null);
          };
        })(this)
      });
    }
    if ((exprType === 'text' || exprType === 'number') || !this.props.types || indexOf.call(this.props.types, "text") >= 0 || indexOf.call(this.props.types, "number") >= 0) {
      return this.renderTextBox();
    }
    if ((this.props.value && this.props.value.valueType === "date") || indexOf.call(this.props.types || [], "date") >= 0) {
      return R(DateTimePickerComponent, {
        date: this.state.value ? moment(this.state.value.value, moment.ISO_8601) : void 0,
        onChange: this.handleDateSelected
      });
    }
    if ((this.props.value && this.props.value.valueType === "datetime") || indexOf.call(this.props.types || [], "datetime") >= 0) {
      return R(DateTimePickerComponent, {
        date: this.state.value ? moment(this.state.value.value, moment.ISO_8601) : void 0,
        timepicker: true,
        onChange: this.handleDateTimeSelected
      });
    }
    return R('div', {
      className: "text-warning"
    }, "Literal input not supported for this type");
  };

  SelectLiteralExprComponent.prototype.render = function() {
    return R('div', null, R('div', {
      style: {
        paddingBottom: 10
      }
    }, R('button', {
      type: "button",
      className: "btn btn-primary",
      onClick: this.handleAccept,
      disabled: !this.state.changed
    }, R('i', {
      className: "fa fa-check"
    }), " OK"), " ", R('button', {
      type: "button",
      className: "btn btn-default",
      onClick: this.props.onCancel
    }, "Cancel")), this.renderInput());
  };

  return SelectLiteralExprComponent;

})(React.Component);

EnumAsListComponent = (function(superClass) {
  extend(EnumAsListComponent, superClass);

  function EnumAsListComponent() {
    this.handleChange = bind(this.handleChange, this);
    return EnumAsListComponent.__super__.constructor.apply(this, arguments);
  }

  EnumAsListComponent.propTypes = {
    value: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    enumValues: PropTypes.array.isRequired
  };

  EnumAsListComponent.contextTypes = {
    locale: PropTypes.string
  };

  EnumAsListComponent.prototype.handleChange = function(val) {
    if (!val) {
      return this.props.onChange(null);
    } else {
      return this.props.onChange({
        type: "literal",
        valueType: "enum",
        value: val
      });
    }
  };

  EnumAsListComponent.prototype.render = function() {
    var itemStyle, ref, value;
    value = (ref = this.props.value) != null ? ref.value : void 0;
    itemStyle = {
      padding: 4,
      marginLeft: 5,
      borderRadius: 4,
      cursor: "pointer"
    };
    return R('div', null, _.map(this.props.enumValues, (function(_this) {
      return function(val) {
        return R('div', {
          key: val.id,
          className: "hover-grey-background",
          style: itemStyle,
          onClick: _this.handleChange.bind(null, val.id)
        }, val.id === value ? R('i', {
          className: "fa fa-fw fa-check",
          style: {
            color: "#2E6DA4"
          }
        }) : R('i', {
          className: "fa fa-fw"
        }), " ", ExprUtils.localizeString(val.name, _this.context.locale));
      };
    })(this)));
  };

  return EnumAsListComponent;

})(React.Component);

EnumsetAsListComponent = (function(superClass) {
  extend(EnumsetAsListComponent, superClass);

  function EnumsetAsListComponent() {
    this.handleToggle = bind(this.handleToggle, this);
    return EnumsetAsListComponent.__super__.constructor.apply(this, arguments);
  }

  EnumsetAsListComponent.propTypes = {
    value: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    enumValues: PropTypes.array.isRequired
  };

  EnumsetAsListComponent.contextTypes = {
    locale: PropTypes.string
  };

  EnumsetAsListComponent.prototype.handleToggle = function(val) {
    var items, ref;
    items = ((ref = this.props.value) != null ? ref.value : void 0) || [];
    if (indexOf.call(items, val) >= 0) {
      items = _.without(items, val);
    } else {
      items = items.concat([val]);
    }
    if (items.length === 0) {
      return this.props.onChange(null);
    } else {
      return this.props.onChange({
        type: "literal",
        valueType: "enumset",
        value: items
      });
    }
  };

  EnumsetAsListComponent.prototype.render = function() {
    var itemStyle, items, ref;
    items = ((ref = this.props.value) != null ? ref.value : void 0) || [];
    itemStyle = {
      padding: 4,
      marginLeft: 5,
      borderRadius: 4,
      cursor: "pointer"
    };
    return R('div', null, _.map(this.props.enumValues, (function(_this) {
      return function(val) {
        var ref1;
        return R('div', {
          key: val.id,
          className: "hover-grey-background",
          style: itemStyle,
          onClick: _this.handleToggle.bind(null, val.id)
        }, (ref1 = val.id, indexOf.call(items, ref1) >= 0) ? R('i', {
          className: "fa fa-fw fa-check-square",
          style: {
            color: "#2E6DA4"
          }
        }) : R('i', {
          className: "fa fa-fw fa-square",
          style: {
            color: "#DDDDDD"
          }
        }), " ", ExprUtils.localizeString(val.name, _this.context.locale));
      };
    })(this)));
  };

  return EnumsetAsListComponent;

})(React.Component);

EnumComponent = (function(superClass) {
  extend(EnumComponent, superClass);

  function EnumComponent() {
    this.handleChange = bind(this.handleChange, this);
    return EnumComponent.__super__.constructor.apply(this, arguments);
  }

  EnumComponent.propTypes = {
    value: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    enumValues: PropTypes.array.isRequired
  };

  EnumComponent.contextTypes = {
    locale: PropTypes.string
  };

  EnumComponent.prototype.handleChange = function(val) {
    if (!val) {
      return this.props.onChange(null);
    } else {
      return this.props.onChange({
        type: "literal",
        valueType: "enum",
        value: JSON.parse(val)
      });
    }
  };

  EnumComponent.prototype.render = function() {
    var options, value;
    value = this.props.value.value;
    options = _.map(this.props.enumValues, (function(_this) {
      return function(val) {
        return {
          value: JSON.stringify(val.id),
          label: ExprUtils.localizeString(val.name, _this.context.locale)
        };
      };
    })(this));
    return R('div', {
      style: {
        width: "100%"
      }
    }, React.createElement(ReactSelect, {
      value: value,
      multi: false,
      options: options,
      onChange: this.handleChange
    }));
  };

  return EnumComponent;

})(React.Component);
