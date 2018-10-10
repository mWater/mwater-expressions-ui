PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
R = React.createElement

ExprUtils = require("mwater-expressions").ExprUtils
ModalWindowComponent = require('react-library/lib/ModalWindowComponent')
TabbedComponent = require('react-library/lib/TabbedComponent')

SelectFieldExprComponent = require './SelectFieldExprComponent'
SelectFormulaExprComponent = require './SelectFormulaExprComponent'
SelectLiteralExprComponent = require './SelectLiteralExprComponent'
SelectVariableExprComponent = require './SelectVariableExprComponent'

module.exports = class SelectExprModalComponent extends React.Component
  @propTypes:
    onSelect: PropTypes.func.isRequired # Called with new expression
    onCancel: PropTypes.func.isRequired # Modal was cancelled

    schema: PropTypes.object.isRequired
    dataSource: PropTypes.object.isRequired # Data source to use to get values
    variables: PropTypes.array.isRequired

    table: PropTypes.string.isRequired # Current table
    value: PropTypes.object   # Current expression value

    # Props to narrow down choices
    types: PropTypes.array    # If specified, the types (value type) of expression required. e.g. ["boolean"]
    enumValues: PropTypes.array # Array of { id:, name: } of enum values that can be selected. Only when type = "enum"
    idTable: PropTypes.string # If specified the table from which id-type expressions must come
    initialMode: PropTypes.oneOf(['field', 'formula', 'literal']) # Initial mode. Default field
    allowCase: PropTypes.bool    # Allow case statements
    aggrStatuses: PropTypes.array # statuses of aggregation to allow. list of "individual", "literal", "aggregate". Default: ["individual", "literal"]
    refExpr: PropTypes.object     # expression to get values for (used for literals). This is primarily for text fields to allow easy selecting of literal values

    placeholder: PropTypes.string # Placeholder text (default Select...)
 
  @contextTypes:
    locale: PropTypes.string  # e.g. "en"

  @defaultProps:
    placeholder: "Select..."
    initialMode: "field"
    aggrStatuses: ['individual', 'literal']

  renderContents: ->
    table = @props.schema.getTable(@props.table)

    tabs = []

    if table
      tabs.push({
        id: "field"
        label: [R('i', className: "fa fa-table"), " #{ExprUtils.localizeString(table.name, @context.locale)} Field"]
        elem: R SelectFieldExprComponent,
          schema: @props.schema
          dataSource: @props.dataSource
          variables: @props.variables
          onChange: @props.onSelect
          table: @props.table
          types: @props.types
          allowCase: @props.allowCase
          enumValues: @props.enumValues
          idTable: @props.idTable
          aggrStatuses: @props.aggrStatuses
      })

    tabs.push({
      id: "formula"
      label: [R('i', className: "fa fa-calculator"), " Formula"]
      elem: R SelectFormulaExprComponent,
        table: @props.table
        onChange: @props.onSelect
        types: @props.types
        allowCase: @props.allowCase
        aggrStatuses: @props.aggrStatuses
        enumValues: @props.enumValues
    })

    if "literal" in @props.aggrStatuses
      tabs.push({
        id: "literal"
        label: [R('i', className: "fa fa-pencil"), " Value"]
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

    if _.find(@props.variables, (v) => !v.table) and ("literal" in @props.aggrStatuses)
      tabs.push({
        id: "variables"
        label: ["Variables"]
        elem: R SelectVariableExprComponent,
          value: @props.value
          variables: @props.variables
          onChange: @props.onSelect
          types: @props.types
          enumValues: @props.enumValues
          idTable: @props.idTable
      })

    R 'div', null,
      R 'h3', style: { marginTop: 0 }, "Select Field, Formula or Value"
      R TabbedComponent,
        tabs: tabs
        initialTabId: @props.initialMode

  render: ->
    R ModalWindowComponent, 
      isOpen: true
      onRequestClose: @props.onCancel,
        @renderContents()

  