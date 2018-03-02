var ExprUtils, H, ModalWindowComponent, PropTypes, R, React, SelectExprModalComponent, SelectFieldExprComponent, SelectFormulaExprComponent, SelectLiteralExprComponent, TabbedComponent, _,
  indexOf = [].indexOf;

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

R = React.createElement;

H = React.DOM;

ExprUtils = require("mwater-expressions").ExprUtils;

ModalWindowComponent = require('react-library/lib/ModalWindowComponent');

TabbedComponent = require('react-library/lib/TabbedComponent');

SelectFieldExprComponent = require('./SelectFieldExprComponent');

SelectFormulaExprComponent = require('./SelectFormulaExprComponent');

SelectLiteralExprComponent = require('./SelectLiteralExprComponent');

module.exports = SelectExprModalComponent = (function() {
  class SelectExprModalComponent extends React.Component {
    renderContents() {
      var table, tabs;
      table = this.props.schema.getTable(this.props.table);
      tabs = [];
      if (table) {
        tabs.push({
          id: "field",
          label: [
            H.i({
              className: "fa fa-table"
            }),
            ` ${ExprUtils.localizeString(table.name,
            this.context.locale)} Field`
          ],
          elem: R(SelectFieldExprComponent, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            onChange: this.props.onSelect,
            table: this.props.table,
            types: this.props.types,
            allowCase: this.props.allowCase,
            enumValues: this.props.enumValues,
            idTable: this.props.idTable,
            aggrStatuses: this.props.aggrStatuses
          })
        });
      }
      tabs.push({
        id: "formula",
        label: [
          H.i({
            className: "fa fa-calculator"
          }),
          " Formula"
        ],
        elem: R(SelectFormulaExprComponent, {
          table: this.props.table,
          onChange: this.props.onSelect,
          types: this.props.types,
          allowCase: this.props.allowCase,
          aggrStatuses: this.props.aggrStatuses,
          enumValues: this.props.enumValues
        })
      });
      if (indexOf.call(this.props.aggrStatuses, "literal") >= 0) {
        tabs.push({
          id: "literal",
          label: [
            H.i({
              className: "fa fa-pencil"
            }),
            " Value"
          ],
          elem: R(SelectLiteralExprComponent, {
            value: this.props.value,
            onChange: this.props.onSelect,
            onCancel: this.props.onCancel,
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            table: this.props.table,
            types: this.props.types,
            enumValues: this.props.enumValues,
            idTable: this.props.idTable,
            refExpr: this.props.refExpr
          })
        });
      }
      return H.div(null, H.h3({
        style: {
          marginTop: 0
        }
      }, "Select Field, Formula or Value"), R(TabbedComponent, {
        tabs: tabs,
        initialTabId: this.props.initialMode
      }));
    }

    render() {
      return R(ModalWindowComponent, {
        isOpen: true,
        onRequestClose: this.props.onCancel
      }, this.renderContents());
    }

  };

  SelectExprModalComponent.propTypes = {
    onSelect: PropTypes.func.isRequired, // Called with new expression
    onCancel: PropTypes.func.isRequired, // Modal was cancelled
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired, // Data source to use to get values
    table: PropTypes.string.isRequired, // Current table
    value: PropTypes.object, // Current expression value
    
    // Props to narrow down choices
    types: PropTypes.array, // If specified, the types (value type) of expression required. e.g. ["boolean"]
    enumValues: PropTypes.array, // Array of { id:, name: } of enum values that can be selected. Only when type = "enum"
    idTable: PropTypes.string, // If specified the table from which id-type expressions must come
    initialMode: PropTypes.oneOf([
      'field',
      'formula',
      'literal' // Initial mode. Default field
    ]),
    allowCase: PropTypes.bool, // Allow case statements
    aggrStatuses: PropTypes.array, // statuses of aggregation to allow. list of "individual", "literal", "aggregate". Default: ["individual", "literal"]
    refExpr: PropTypes.object, // expression to get values for (used for literals). This is primarily for text fields to allow easy selecting of literal values
    placeholder: PropTypes.string // Placeholder text (default Select...)
  };

  SelectExprModalComponent.contextTypes = {
    locale: PropTypes.string // e.g. "en"
  };

  SelectExprModalComponent.defaultProps = {
    placeholder: "Select...",
    initialMode: "field",
    aggrStatuses: ['individual', 'literal']
  };

  return SelectExprModalComponent;

}).call(this);
