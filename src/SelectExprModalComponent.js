// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let SelectExprModalComponent;
import PropTypes from 'prop-types';
import _ from 'lodash';
import React from 'react';
const R = React.createElement;

import { ExprUtils } from "mwater-expressions";
import ModalWindowComponent from 'react-library/lib/ModalWindowComponent';
import TabbedComponent from 'react-library/lib/TabbedComponent';
import SelectFieldExprComponent from './SelectFieldExprComponent';
import SelectFormulaExprComponent from './SelectFormulaExprComponent';
import SelectLiteralExprComponent from './SelectLiteralExprComponent';
import SelectVariableExprComponent from './SelectVariableExprComponent';

export default SelectExprModalComponent = (function() {
  SelectExprModalComponent = class SelectExprModalComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        onSelect: PropTypes.func.isRequired, // Called with new expression
        onCancel: PropTypes.func.isRequired, // Modal was cancelled
  
        schema: PropTypes.object.isRequired,
        dataSource: PropTypes.object.isRequired, // Data source to use to get values
        variables: PropTypes.array.isRequired,
  
        table: PropTypes.string,   // Current table. If none, then literal-only
        value: PropTypes.object,   // Current expression value
  
        // Props to narrow down choices
        types: PropTypes.array,    // If specified, the types (value type) of expression required. e.g. ["boolean"]
        enumValues: PropTypes.array, // Array of { id:, name: } of enum values that can be selected. Only when type = "enum"
        idTable: PropTypes.string, // If specified the table from which id-type expressions must come
        initialMode: PropTypes.oneOf(['field', 'formula', 'literal']), // Initial mode. Default "field" unless no table, then "literal"
        allowCase: PropTypes.bool,    // Allow case statements
        aggrStatuses: PropTypes.array, // statuses of aggregation to allow. list of "individual", "literal", "aggregate". Default: ["individual", "literal"]
        refExpr: PropTypes.object,     // expression to get values for (used for literals). This is primarily for text fields to allow easy selecting of literal values
        booleanOnly: PropTypes.bool,   // Hint that must be boolean (even though boolean can take any type)
  
        placeholder: PropTypes.string // Placeholder text (default Select...)
      };
   
      this.contextTypes =
        {locale: PropTypes.string};  // e.g. "en"
  
      this.defaultProps = {
        placeholder: "Select...",
        initialMode: "field",
        aggrStatuses: ['individual', 'literal']
      };
    }

    renderContents() {
      const table = this.props.table ? this.props.schema.getTable(this.props.table) : undefined;

      const tabs = [];

      if (table) {
        tabs.push({
          id: "field",
          label: [R('i', {className: "fa fa-table"}), ` ${ExprUtils.localizeString(table.name, this.context.locale)} Field`],
          elem: R(SelectFieldExprComponent, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            variables: this.props.variables,
            onChange: this.props.onSelect,
            table: this.props.table,
            types: this.props.types,
            allowCase: this.props.allowCase,
            enumValues: this.props.enumValues,
            idTable: this.props.idTable,
            aggrStatuses: this.props.aggrStatuses
          }
          )
        });
      }

      if (table || this.props.aggrStatuses.includes("literal")) {
        tabs.push({
          id: "formula",
          label: [R('i', {className: "fa fa-calculator"}), " Formula"],
          elem: R(SelectFormulaExprComponent, {
            table: this.props.table,
            onChange: this.props.onSelect,
            types: this.props.types,
            allowCase: this.props.allowCase,
            aggrStatuses: this.props.aggrStatuses,
            enumValues: this.props.enumValues,
            locale: this.context.locale
          }
          )
        });
      }

      if (this.props.aggrStatuses.includes("literal")) {
        tabs.push({
          id: "literal",
          label: [R('i', {className: "fa fa-pencil"}), " Value"],
          elem: R(SelectLiteralExprComponent, {
            value: this.props.value,
            onChange: this.props.onSelect,
            onCancel: this.props.onCancel,
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            types: this.props.booleanOnly ? ["boolean"] : this.props.types,
            enumValues: this.props.enumValues,
            idTable: this.props.idTable,
            refExpr: this.props.refExpr
          }
          )
        });
      }

      if ((this.props.variables || []).length > 0) {
        tabs.push({
          id: "variables",
          label: ["Variables"],
          elem: R(SelectVariableExprComponent, {
            value: this.props.value,
            variables: this.props.variables,
            onChange: this.props.onSelect,
            types: this.props.types,
            enumValues: this.props.enumValues,
            idTable: this.props.idTable
          }
          )
        });
      }

      return R('div', null,
        R('h3', {style: { marginTop: 0 }}, "Select Field, Formula or Value"),
        R(TabbedComponent, {
          tabs,
          initialTabId: table ? this.props.initialMode : "literal"
        }
        )
      );
    }

    render() {
      return R(ModalWindowComponent, { 
        isOpen: true,
        onRequestClose: this.props.onCancel
      },
          this.renderContents());
    }
  };
  SelectExprModalComponent.initClass();
  return SelectExprModalComponent;
})();

  