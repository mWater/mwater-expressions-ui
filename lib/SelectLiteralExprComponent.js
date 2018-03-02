var DateTimePickerComponent, EnumAsListComponent, EnumComponent, EnumSetComponent, EnumsetAsListComponent, ExprUtils, H, IdLiteralComponent, PropTypes, R, React, SelectLiteralExprComponent, TextArrayComponent, _, moment,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } },
  indexOf = [].indexOf;

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

R = React.createElement;

H = React.DOM;

moment = require('moment');

ExprUtils = require('mwater-expressions').ExprUtils;

DateTimePickerComponent = require('./DateTimePickerComponent');

EnumSetComponent = require('./EnumSetComponent');

TextArrayComponent = require('./TextArrayComponent');

IdLiteralComponent = require('./IdLiteralComponent');

module.exports = SelectLiteralExprComponent = (function() {
  class SelectLiteralExprComponent extends React.Component {
    constructor(props) {
      var ref;
      super(props);
      this.handleChange = this.handleChange.bind(this);
      this.handleDateSelected = this.handleDateSelected.bind(this);
      this.handleDateTimeSelected = this.handleDateTimeSelected.bind(this);
      this.handleAccept = this.handleAccept.bind(this);
      this.handleTextChange = this.handleTextChange.bind(this);
      this.state = {
        value: props.value,
        inputText: null, // Unparsed input text. Null if not used
        changed: false,
        inputTextError: false
      };
      // Set input text to value if text/number
      if (props.value && ((ref = props.value.valueType) === 'text' || ref === 'number')) {
        this.state.inputText = "" + props.value.value;
      }
    }

    componentDidMount() {
      var ref;
      return (ref = this.refs.input) != null ? ref.focus() : void 0;
    }

    handleChange(value) {
      boundMethodCheck(this, SelectLiteralExprComponent);
      return this.setState({
        value: value,
        changed: true
      });
    }

    handleDateSelected(date) {
      boundMethodCheck(this, SelectLiteralExprComponent);
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
    }

    handleDateTimeSelected(datetime) {
      boundMethodCheck(this, SelectLiteralExprComponent);
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
    }

    handleAccept() {
      var value;
      boundMethodCheck(this, SelectLiteralExprComponent);
      // Parse text value if text
      if (this.state.inputText != null) {
        // Empty means no value
        if (this.state.inputText === "") {
          this.props.onChange(null);
          return;
        }
        // Prefer number over text if can be parsed as number
        if (((this.props.value && this.props.value.valueType === "number") || indexOf.call(this.props.types || ['number'], "number") >= 0) && this.state.inputText.match(/^-?\d+(\.\d+)?$/)) {
          value = parseFloat(this.state.inputText);
          return this.props.onChange({
            type: "literal",
            valueType: "number",
            value: value
          });
        // If text
        } else if ((this.props.value && this.props.value.valueType === "text") || indexOf.call(this.props.types || ['text'], "text") >= 0) {
          return this.props.onChange({
            type: "literal",
            valueType: "text",
            value: this.state.inputText
          });
        // If id (only allow if idTable is explicit)
        } else if (indexOf.call(this.props.types || ['id'], "id") >= 0 && this.props.idTable) {
          return this.props.onChange({
            type: "literal",
            valueType: "id",
            idTable: this.props.idTable,
            value: this.state.inputText
          });
        } else {
          // Set error condition
          return this.setState({
            inputTextError: true
          });
        }
      } else {
        return this.props.onChange(this.state.value);
      }
    }

    handleTextChange(ev) {
      boundMethodCheck(this, SelectLiteralExprComponent);
      return this.setState({
        inputText: ev.target.value,
        changed: true
      });
    }

    // Render a text box for inputting text/number
    renderTextBox() {
      return H.div({
        className: (this.state.inputTextError ? "has-error" : void 0)
      }, H.input({
        ref: "input",
        type: "text",
        className: "form-control",
        value: this.state.inputText || "",
        onChange: this.handleTextChange,
        placeholder: "Enter value..."
      }));
    }

    renderInput() {
      var expr, exprType, exprUtils, idTable;
      expr = this.state.value;
      // Get current expression type
      exprUtils = new ExprUtils(this.props.schema);
      exprType = exprUtils.getExprType(expr);
      // If text[], enumset or id literal, use special component
      if (exprType === "text[]" || _.isEqual(this.props.types, ["text[]"])) {
        return R(TextArrayComponent, {
          ref: "input",
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
          ref: "input",
          value: expr != null ? expr.value : void 0,
          idTable: idTable,
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          onChange: (value) => {
            return this.handleChange(value ? {
              type: "literal",
              valueType: "id",
              idTable: idTable,
              value: value
            } : null);
          }
        });
      }
      if (exprType === "id[]" || _.isEqual(this.props.types, ["id[]"]) && this.props.idTable) {
        idTable = this.props.idTable || exprUtils.getExprIdTable(expr);
        return R(IdLiteralComponent, {
          ref: "input",
          value: expr != null ? expr.value : void 0,
          idTable: idTable,
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          multi: true,
          onChange: (value) => {
            return this.handleChange(value && value.length > 0 ? {
              type: "literal",
              valueType: "id[]",
              idTable: idTable,
              value: value
            } : null);
          }
        });
      }
      // If already text/number, or text/number accepted, render field
      if ((exprType === 'text' || exprType === 'number') || !this.props.types || indexOf.call(this.props.types, "text") >= 0 || indexOf.call(this.props.types, "number") >= 0) {
        return this.renderTextBox();
      }
      // If date type, display control
      if ((this.props.value && this.props.value.valueType === "date") || indexOf.call(this.props.types || [], "date") >= 0) {
        return R(DateTimePickerComponent, {
          date: this.state.value ? moment(this.state.value.value, moment.ISO_8601) : void 0,
          onChange: this.handleDateSelected
        });
      }
      // If datetime type, display control
      if ((this.props.value && this.props.value.valueType === "datetime") || indexOf.call(this.props.types || [], "datetime") >= 0) {
        return R(DateTimePickerComponent, {
          date: this.state.value ? moment(this.state.value.value, moment.ISO_8601) : void 0,
          timepicker: true,
          onChange: this.handleDateTimeSelected
        });
      }
      return H.div({
        className: "text-warning"
      }, "Literal input not supported for this type");
    }

    render() {
      return H.div(null, H.div({
        style: {
          paddingBottom: 10
        }
      }, H.button({
        type: "button",
        className: "btn btn-primary",
        onClick: this.handleAccept,
        disabled: !this.state.changed
      }, H.i({
        className: "fa fa-check"
      }), " OK"), " ", H.button({
        type: "button",
        className: "btn btn-default",
        onClick: this.props.onCancel
      }, "Cancel")), this.renderInput());
    }

  };

  SelectLiteralExprComponent.propTypes = {
    value: PropTypes.object, // Current expression value
    onChange: PropTypes.func.isRequired, // Called with new expression
    onCancel: PropTypes.func.isRequired, // Called to cancel
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    // Props to narrow down choices
    table: PropTypes.string.isRequired, // Current table
    types: PropTypes.array, // If specified, the types (value type) of expression required. e.g. ["boolean"]
    enumValues: PropTypes.array, // Array of { id:, name: } of enum values that can be selected. Only when type = "enum"
    idTable: PropTypes.string, // If specified the table from which id-type expressions must come
    refExpr: PropTypes.object // expression to get values for (used for literals). This is primarily for text fields to allow easy selecting of literal values
  };

  return SelectLiteralExprComponent;

}).call(this);

EnumAsListComponent = (function() {
  // Component which displays an enum as a list
  class EnumAsListComponent extends React.Component {
    constructor() {
      super(...arguments);
      this.handleChange = this.handleChange.bind(this);
    }

    handleChange(val) {
      boundMethodCheck(this, EnumAsListComponent);
      if (!val) {
        return this.props.onChange(null);
      } else {
        return this.props.onChange({
          type: "literal",
          valueType: "enum",
          value: val
        });
      }
    }

    render() {
      var itemStyle, ref, value;
      value = (ref = this.props.value) != null ? ref.value : void 0;
      itemStyle = {
        padding: 4,
        marginLeft: 5,
        borderRadius: 4,
        cursor: "pointer"
      };
      return H.div(null, _.map(this.props.enumValues, (val) => {
        return H.div({
          key: val.id,
          className: "hover-grey-background",
          style: itemStyle,
          onClick: this.handleChange.bind(null, val.id)
        }, val.id === value ? H.i({
          className: "fa fa-fw fa-check",
          style: {
            color: "#2E6DA4"
          }
        }) : H.i({
          className: "fa fa-fw"
        }), " ", ExprUtils.localizeString(val.name, this.context.locale));
      }));
    }

  };

  EnumAsListComponent.propTypes = {
    value: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    enumValues: PropTypes.array.isRequired // Array of id and name (localized string)
  };

  EnumAsListComponent.contextTypes = {
    locale: PropTypes.string // e.g. "en"
  };

  return EnumAsListComponent;

}).call(this);

EnumsetAsListComponent = (function() {
  // Component which displays an enumset as a list
  class EnumsetAsListComponent extends React.Component {
    constructor() {
      super(...arguments);
      this.handleToggle = this.handleToggle.bind(this);
    }

    handleToggle(val) {
      var items, ref;
      boundMethodCheck(this, EnumsetAsListComponent);
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
    }

    render() {
      var itemStyle, items, ref;
      items = ((ref = this.props.value) != null ? ref.value : void 0) || [];
      itemStyle = {
        padding: 4,
        marginLeft: 5,
        borderRadius: 4,
        cursor: "pointer"
      };
      return H.div(null, _.map(this.props.enumValues, (val) => {
        var ref1;
        return H.div({
          key: val.id,
          className: "hover-grey-background",
          style: itemStyle,
          onClick: this.handleToggle.bind(null, val.id)
        }, (ref1 = val.id, indexOf.call(items, ref1) >= 0) ? H.i({
          className: "fa fa-fw fa-check-square",
          style: {
            color: "#2E6DA4"
          }
        }) : H.i({
          className: "fa fa-fw fa-square",
          style: {
            color: "#DDDDDD"
          }
        }), " ", ExprUtils.localizeString(val.name, this.context.locale));
      }));
    }

  };

  EnumsetAsListComponent.propTypes = {
    value: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    enumValues: PropTypes.array.isRequired // Array of id and name (localized string)
  };

  EnumsetAsListComponent.contextTypes = {
    locale: PropTypes.string // e.g. "en"
  };

  return EnumsetAsListComponent;

}).call(this);

EnumComponent = (function() {
  // Component which displays an enum dropdown
  class EnumComponent extends React.Component {
    constructor() {
      super(...arguments);
      this.handleChange = this.handleChange.bind(this);
    }

    handleChange(val) {
      boundMethodCheck(this, EnumComponent);
      if (!val) {
        return this.props.onChange(null);
      } else {
        return this.props.onChange({
          type: "literal",
          valueType: "enum",
          value: JSON.parse(val)
        });
      }
    }

    render() {
      var options, value;
      value = this.props.value.value;
      // Use JSON to allow non-strings as ids
      options = _.map(this.props.enumValues, (val) => {
        return {
          value: JSON.stringify(val.id),
          label: ExprUtils.localizeString(val.name, this.context.locale)
        };
      });
      return H.div({
        style: {
          width: "100%"
        }
      }, React.createElement(ReactSelect, {
        value: value,
        multi: false,
        options: options,
        onChange: this.handleChange
      }));
    }

  };

  EnumComponent.propTypes = {
    value: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    enumValues: PropTypes.array.isRequired // Array of id and name (localized string)
  };

  EnumComponent.contextTypes = {
    locale: PropTypes.string // e.g. "en"
  };

  return EnumComponent;

}).call(this);
