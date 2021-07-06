// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let SelectLiteralExprComponent;
import PropTypes from 'prop-types';
import _ from 'lodash';
import React from 'react';
const R = React.createElement;

import moment from 'moment';
import { ExprUtils } from 'mwater-expressions';
import DateTimePickerComponent from './DateTimePickerComponent';
import TextArrayComponent from './TextArrayComponent';
import IdLiteralComponent from './IdLiteralComponent';
import { Toggle } from 'react-library/lib/bootstrap';

export default SelectLiteralExprComponent = (function() {
  SelectLiteralExprComponent = class SelectLiteralExprComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        value: PropTypes.object,   // Current expression value
        onChange: PropTypes.func.isRequired, // Called with new expression
        onCancel: PropTypes.func.isRequired, // Called to cancel
  
        schema: PropTypes.object.isRequired,
        dataSource: PropTypes.object.isRequired,
  
        // Props to narrow down choices
        types: PropTypes.array,    // If specified, the types (value type) of expression required. e.g. ["boolean"]
        enumValues: PropTypes.array, // Array of { id:, name: } of enum values that can be selected. Only when type = "enum"
        idTable: PropTypes.string, // If specified the table from which id-type expressions must come
        refExpr: PropTypes.object
      };
           // expression to get values for (used for literals). This is primarily for text fields to allow easy selecting of literal values
    }

    constructor(props) {
      super(props);

      this.state = {
        value: props.value,
        inputText: null,   // Unparsed input text. Null if not used
        changed: false,
        inputTextError: false
      };

      // Set input text to value if text/number
      if (props.value && ['text', 'number'].includes(props.value.valueType)) {
        this.state.inputText = "" + props.value.value;
      }
    }

    componentDidMount() {
      return this.inputComp?.focus();
    }

    handleChange = value => {
      return this.setState({value, changed: true, inputText: null});
    };

    handleDateSelected = date => {
      if (date) {
        return this.setState({value: { type: "literal", valueType: "date", value: date.format("YYYY-MM-DD") }, changed: true});
      } else {
        return this.setState({value: null, changed: true});
      }
    };

    handleDateTimeSelected = datetime => {
      if (datetime) {
        return this.setState({value: { type: "literal", valueType: "datetime", value: datetime.toISOString() }, changed: true});
      } else {
        return this.setState({value: null, changed: true});
      }
    };

    handleAccept = () => {
      // Parse text value if text
      let value;
      if (this.state.inputText != null) {
        // Empty means no value
        if (this.state.inputText === "") {
          this.props.onChange(null);
          return;
        }

        // Prefer number over text if can be parsed as number
        if (((this.props.value && (this.props.value.valueType === "number")) || (this.props.types || ['number']).includes("number")) && this.state.inputText.match(/^-?\d+(\.\d+)?$/)) {
          value = parseFloat(this.state.inputText);
          return this.props.onChange({ type: "literal", valueType: "number", value });
        // If text
        } else if ((this.props.value && (this.props.value.valueType === "text")) || (this.props.types || ['text']).includes("text")) {
          return this.props.onChange({ type: "literal", valueType: "text", value: this.state.inputText });
        // If id (only allow if idTable is explicit)
        } else if ((this.props.types || ['id']).includes("id") && this.props.idTable) {
          return this.props.onChange({ type: "literal", valueType: "id", idTable: this.props.idTable, value: this.state.inputText });
        } else {
          // Set error condition
          return this.setState({inputTextError: true});
        }
      } else {
        return this.props.onChange(this.state.value);
      }
    };

    handleTextChange = ev => {
      return this.setState({inputText: ev.target.value, changed: true});
    };

    // Render a text box for inputting text/number
    renderTextBox() {
      return R('div', {className: (this.state.inputTextError ? "has-error" : undefined)},
        R('input', { 
          type: "text",
          className: "form-control",
          value: this.state.inputText || "",
          onChange: this.handleTextChange,
          placeholder: "Enter value..."
        }
        )
      );
    }

    renderInput() {
      let idTable;
      const expr = this.state.value;

      // Get current expression type
      const exprUtils = new ExprUtils(this.props.schema);
      const exprType = exprUtils.getExprType(expr);

      // If boolean, use Toggle
      if ((exprType === "boolean") || _.isEqual(this.props.types, ["boolean"])) {
        return R(Toggle, { 
          value: expr?.value,
          allowReset: true,
          options: [{ value: false, label: "False" }, { value: true, label: "True" }],
          onChange: value => this.handleChange((value != null) ? { type: "literal", valueType: "boolean", value } : null)
        });
      }

      // If text[], enumset or id literal, use special component
      if ((exprType === "text[]") || _.isEqual(this.props.types, ["text[]"])) {
        return R(TextArrayComponent, { 
          value: expr,
          refExpr: this.props.refExpr,
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          onChange: this.handleChange
        });
      }

      if ((exprType === "enum") || _.isEqual(this.props.types, ["enum"])) {
        return R(EnumAsListComponent, { 
          value: expr,
          enumValues: this.props.enumValues,
          onChange: this.handleChange
        });
      }

      if ((exprType === "enumset") || _.isEqual(this.props.types, ["enumset"])) {
        return R(EnumsetAsListComponent, { 
          value: expr,
          enumValues: this.props.enumValues,
          onChange: this.handleChange
        });
      }

      if ((exprType === "id") || (_.isEqual(this.props.types, ["id"]) && this.props.idTable)) {
        idTable = this.props.idTable || exprUtils.getExprIdTable(expr);
        return R(IdLiteralComponent, { 
          value: expr?.value,
          idTable,
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          onChange: value => this.handleChange(value ? { type: "literal", valueType: "id", idTable, value } : null)
        });
      }

      if ((exprType === "id[]") || (_.isEqual(this.props.types, ["id[]"]) && this.props.idTable)) {
        idTable = this.props.idTable || exprUtils.getExprIdTable(expr);
        return R(IdLiteralComponent, { 
          value: expr?.value,
          idTable,
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          multi: true,
          onChange: value => this.handleChange(value && (value.length > 0) ? { type: "literal", valueType: "id[]", idTable, value } : null)
        });
      }

      // If already text/number, or text/number accepted, render field
      if (['text', 'number'].includes(exprType) || !this.props.types || this.props.types.includes("text") || this.props.types.includes("number")) { 
        return this.renderTextBox();
      }

      // If date type, display control
      if ((this.props.value && (this.props.value.valueType === "date")) || (this.props.types || []).includes("date")) {
        return R(DateTimePickerComponent, { 
          date: this.state.value ? moment(this.state.value.value, moment.ISO_8601) : undefined,
          onChange: this.handleDateSelected
        }
        );
      }

      // If datetime type, display control
      if ((this.props.value && (this.props.value.valueType === "datetime")) || (this.props.types || []).includes("datetime")) {
        return R(DateTimePickerComponent, { 
          date: this.state.value ? moment(this.state.value.value, moment.ISO_8601) : undefined,
          timepicker: true,
          onChange: this.handleDateTimeSelected
        }
        );
      }

      return R('div', {className: "text-warning"}, "Literal input not supported for this type");
    }

    render() {
      return R('div', null,
        R('div', {style: { paddingBottom: 10 }}, 
          R('button', {type: "button", className: "btn btn-primary", onClick: this.handleAccept, disabled: !this.state.changed},
            R('i', {className: "fa fa-check"}),
            " OK"),
          " ",
          R('button', {type: "button", className: "btn btn-default", onClick: this.props.onCancel},
            "Cancel")
        ),
        this.renderInput());
    }
  };
  SelectLiteralExprComponent.initClass();
  return SelectLiteralExprComponent;
})();

// Component which displays an enum as a list
class EnumAsListComponent extends React.Component {
  static initClass() {
    this.propTypes = { 
      value: PropTypes.object,
      onChange: PropTypes.func.isRequired, 
      enumValues: PropTypes.array.isRequired // Array of id and name (localized string)
    };
  
    this.contextTypes =
      {locale: PropTypes.string};
      // e.g. "en"
  }

  handleChange = val => {
    if (!val) {
      return this.props.onChange(null);
    } else {
      return this.props.onChange({ type: "literal", valueType: "enum", value: val });
    }
  };

  render() {
    const value = this.props.value?.value;

    const itemStyle = {
      padding: 4,
      marginLeft: 5,
      borderRadius: 4,
      cursor: "pointer"
    };

    return R('div', null,
      _.map(this.props.enumValues, val => { 
        return R('div', {key: val.id, className: "hover-grey-background", style: itemStyle, onClick: this.handleChange.bind(null, val.id)},
          val.id === value ?
            R('i', {className: "fa fa-fw fa-check", style: { color: "#2E6DA4" }})
          :
            R('i', {className: "fa fa-fw"}),
          " ",
          ExprUtils.localizeString(val.name, this.context.locale));
      })
    );
  }
}
EnumAsListComponent.initClass();

// Component which displays an enumset as a list
class EnumsetAsListComponent extends React.Component {
  static initClass() {
    this.propTypes = { 
      value: PropTypes.object,
      onChange: PropTypes.func.isRequired, 
      enumValues: PropTypes.array.isRequired // Array of id and name (localized string)
    };
  
    this.contextTypes =
      {locale: PropTypes.string};
      // e.g. "en"
  }

  handleToggle = val => {
    let items = this.props.value?.value || [];
    if (items.includes(val)) {
      items = _.without(items, val);
    } else {
      items = items.concat([val]);
    }

    if (items.length === 0) {
      return this.props.onChange(null);
    } else {
      return this.props.onChange({ type: "literal", valueType: "enumset", value: items });
    }
  };

  render() {
    const items = this.props.value?.value || [];

    const itemStyle = {
      padding: 4,
      marginLeft: 5,
      borderRadius: 4,
      cursor: "pointer"
    };

    return R('div', null,
      _.map(this.props.enumValues, val => { 
        return R('div', {key: val.id, className: "hover-grey-background", style: itemStyle, onClick: this.handleToggle.bind(null, val.id)},
          items.includes(val.id) ?
            R('i', {className: "fa fa-fw fa-check-square", style: { color: "#2E6DA4" }})
          :
            R('i', {className: "fa fa-fw fa-square", style: { color: "#DDDDDD" }}),
          " ",
          ExprUtils.localizeString(val.name, this.context.locale));
      })
    );
  }
}
EnumsetAsListComponent.initClass();

// Component which displays an enum dropdown
class EnumComponent extends React.Component {
  static initClass() {
    this.propTypes = { 
      value: PropTypes.object,
      onChange: PropTypes.func.isRequired, 
      enumValues: PropTypes.array.isRequired // Array of id and name (localized string)
    };
  
    this.contextTypes =
      {locale: PropTypes.string};
      // e.g. "en"
  }

  handleChange = val => {
    if (!val) {
      return this.props.onChange(null);
    } else {
      return this.props.onChange({ type: "literal", valueType: "enum", value: JSON.parse(val) });
    }
  };

  render() {
    const {
      value
    } = this.props.value;

    // Use JSON to allow non-strings as ids
    const options = _.map(this.props.enumValues, val => ({ value: JSON.stringify(val.id), label: ExprUtils.localizeString(val.name, this.context.locale) }));
    return R('div', {style: { width: "100%" }},
      React.createElement(ReactSelect, { 
        value,
        multi: false,
        options, 
        onChange: this.handleChange
      })
    );
  }
}
EnumComponent.initClass();

