_ = require 'lodash'
React = require 'react'
R = React.createElement
H = React.DOM

ExprUtils = require("mwater-expressions").ExprUtils
ModalWindowComponent = require('react-library/lib/ModalWindowComponent')
TabbedComponent = require('react-library/lib/TabbedComponent')

SelectFieldExprComponent = require './SelectFieldExprComponent'
SelectFormulaExprComponent = require './SelectFormulaExprComponent'
SelectLiteralExprComponent = require './SelectLiteralExprComponent'

module.exports = class SelectExprModalComponent extends React.Component
  @propTypes:
    onSelect: React.PropTypes.func.isRequired # Called with new expression
    onCancel: React.PropTypes.func.isRequired # Modal was cancelled

    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired # Data source to use to get values

    table: React.PropTypes.string.isRequired # Current table
    value: React.PropTypes.object   # Current expression value

    # Props to narrow down choices
    types: React.PropTypes.array    # If specified, the types (value type) of expression required. e.g. ["boolean"]
    enumValues: React.PropTypes.array # Array of { id:, name: } of enum values that can be selected. Only when type = "enum"
    idTable: React.PropTypes.string # If specified the table from which id-type expressions must come
    initialMode: React.PropTypes.oneOf(['field', 'formula', 'literal']) # Initial mode. Default field
    allowCase: React.PropTypes.bool    # Allow case statements
    aggrStatuses: React.PropTypes.array # statuses of aggregation to allow. list of "individual", "literal", "aggregate". Default: ["individual", "literal"]
    refExpr: React.PropTypes.object     # expression to get values for (used for literals). This is primarily for text fields to allow easy selecting of literal values

    placeholder: React.PropTypes.string # Placeholder text (default Select...)
 
  @contextTypes:
    locale: React.PropTypes.string  # e.g. "en"

  @defaultProps:
    placeholder: "Select..."
    initialMode: "field"
    aggrStatuses: ['individual', 'literal']

  renderContents: ->
    table = @props.schema.getTable(@props.table)

    tabs = [          
      {
        id: "field"
        label: [H.i(className: "fa fa-table"), " #{ExprUtils.localizeString(table.name, @context.locale)} Field"]
        elem: R SelectFieldExprComponent,
          schema: @props.schema
          dataSource: @props.dataSource
          onChange: @props.onSelect
          table: @props.table
          types: @props.types
          allowCase: @props.allowCase
          enumValues: @props.enumValues
          idTable: @props.idTable
          aggrStatuses: @props.aggrStatuses
      }
      {
        id: "formula"
        label: [H.i(className: "fa fa-calculator"), " Formula"]
        elem: R SelectFormulaExprComponent,
          table: @props.table
          onChange: @props.onSelect
          types: @props.types
          allowCase: @props.allowCase
          aggrStatuses: @props.aggrStatuses
          enumValues: @props.enumValues
      }
    ]

    if "literal" in @props.aggrStatuses
      tabs.push({
        id: "literal"
        label: [H.i(className: "fa fa-pencil"), " Value"]
        elem: R SelectLiteralExprComponent,
          value: @props.value
          onChange: @props.onSelect
          onCancel: @props.onCancel
          schema: @props.schema
          dataSource: @props.dataSource
          table: @props.table
          types: @props.types
          enumValues: @props.enumValues
          idTable: @props.idTable
          refExpr: @props.refExpr
      })

    H.div null,
      H.h3 style: { marginTop: 0 }, "Select Field, Formula or Value"
      R TabbedComponent,
        tabs: tabs
        initialTabId: @props.initialMode

  render: ->
    R ModalWindowComponent, 
      isOpen: true
      onRequestClose: @props.onCancel,
        @renderContents()

  