var ExprUtils, H, ModalWindowComponent, R, React, SelectExprModalComponent, SelectFieldExprComponent, SelectFormulaExprComponent, SelectLiteralExprComponent, TabbedComponent, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

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

module.exports = SelectExprModalComponent = (function(superClass) {
  extend(SelectExprModalComponent, superClass);

  function SelectExprModalComponent() {
    return SelectExprModalComponent.__super__.constructor.apply(this, arguments);
  }

  SelectExprModalComponent.propTypes = {
    onSelect: React.PropTypes.func.isRequired,
    onCancel: React.PropTypes.func.isRequired,
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    table: React.PropTypes.string.isRequired,
    value: React.PropTypes.object,
    types: React.PropTypes.array,
    enumValues: React.PropTypes.array,
    idTable: React.PropTypes.string,
    initialMode: React.PropTypes.oneOf(['field', 'formula', 'literal']),
    allowCase: React.PropTypes.bool,
    aggrStatuses: React.PropTypes.array,
    refExpr: React.PropTypes.object,
    placeholder: React.PropTypes.string
  };

  SelectExprModalComponent.contextTypes = {
    locale: React.PropTypes.string
  };

  SelectExprModalComponent.defaultProps = {
    placeholder: "Select...",
    initialMode: "field",
    aggrStatuses: ['individual', 'literal']
  };

  SelectExprModalComponent.prototype.renderContents = function() {
    var table, tabs;
    table = this.props.schema.getTable(this.props.table);
    tabs = [
      {
        id: "field",
        label: [
          H.i({
            className: "fa fa-table"
          }), " " + (ExprUtils.localizeString(table.name, this.context.locale)) + " Field"
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
      }, {
        id: "formula",
        label: [
          H.i({
            className: "fa fa-calculator"
          }), " Formula"
        ],
        elem: R(SelectFormulaExprComponent, {
          table: this.props.table,
          onChange: this.props.onSelect,
          types: this.props.types,
          allowCase: this.props.allowCase,
          aggrStatuses: this.props.aggrStatuses,
          enumValues: this.props.enumValues
        })
      }
    ];
    if (indexOf.call(this.props.aggrStatuses, "literal") >= 0) {
      tabs.push({
        id: "literal",
        label: [
          H.i({
            className: "fa fa-pencil"
          }), " Value"
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
  };

  SelectExprModalComponent.prototype.render = function() {
    return R(ModalWindowComponent, {
      isOpen: true,
      onRequestClose: this.props.onCancel
    }, this.renderContents());
  };

  return SelectExprModalComponent;

})(React.Component);
