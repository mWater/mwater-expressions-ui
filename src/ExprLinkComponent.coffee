_ = require 'lodash'
React = require 'react'
R = React.createElement
H = React.DOM

SelectExprModalComponent = require './SelectExprModalComponent'
LinkComponent = require './LinkComponent'
ExprUtils = require("mwater-expressions").ExprUtils
LiteralExprStringComponent = require './LiteralExprStringComponent'

# Allows user to select an expression or display an existing one. Shows as a link
module.exports = class ExprLinkComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired # Data source to use to get values

    table: React.PropTypes.string.isRequired # Current table
    value: React.PropTypes.object   # Current expression value
    onChange: React.PropTypes.func  # Called with new expression

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

  constructor: ->
    super

    @state = {
      modalVisible: false
    }

  handleClick: =>
    @setState(modalVisible: true)

  # Display placeholder if no value
  renderNone: =>
    H.a onClick: @handleClick, style: { cursor: "pointer", fontStyle: "italic", color: "#478" }, 
      @props.placeholder
    
  # Display summary if field
  renderField: =>
    exprUtils = new ExprUtils(@props.schema)

    R LinkComponent, 
      dropdownItems: [{ id: "edit", name: [H.i(className: "fa fa-pencil"), " Edit"] }, { id: "remove", name: [H.i(className: "fa fa-remove"), " Remove"] }]
      onDropdownItemClicked: ((id) => 
        if id == "edit"
          @setState(modalVisible: true)
        else
          @props.onChange(null)),
      exprUtils.summarizeExpr(@props.value)

  renderLiteral: =>
    R LinkComponent, 
      dropdownItems: [{ id: "edit", name: [H.i(className: "fa fa-pencil"), " Edit"] }, { id: "remove", name: [H.i(className: "fa fa-remove"), " Remove"] }]
      onDropdownItemClicked: ((id) => 
        if id == "edit"
          @setState(modalVisible: true)
        else
          @props.onChange(null)),
      R LiteralExprStringComponent,
        schema: @props.schema
        dataSource: @props.dataSource
        value: @props.value
        enumValues: @props.enumValues

  render: ->
    initialMode = @props.initialMode

    # Override if already has value
    if @props.value
      if @props.value.type in ["field", "scalar"]
        initialMode = "field"
      else if @props.value.type == "literal"
        initialMode = "literal"
      else
        initialMode = "formula"

    H.div null,
      if @state.modalVisible
        R SelectExprModalComponent, 
          schema: @props.schema
          dataSource: @props.dataSource
          table: @props.table
          value: @props.value
          types: @props.types
          enumValues: @props.enumValues
          idTable: @props.idTable
          initialMode: initialMode
          allowCase: @props.allowCase
          aggrStatuses: @props.aggrStatuses
          refExpr: @props.refExpr
          onCancel: => 
            @setState(modalVisible: false)
          onSelect: (expr) =>
            @setState(modalVisible: false)
            @props.onChange(expr)

      if not @props.value
        @renderNone()
      else if @props.value.type == "field"
        @renderField()
      else if @props.value.type == "literal"
        @renderLiteral()

