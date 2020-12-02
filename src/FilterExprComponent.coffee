PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
R = React.createElement

update = require 'update-object'
ExprCleaner = require("mwater-expressions").ExprCleaner
ExprElementBuilder = require './ExprElementBuilder'
StackedComponent = require './StackedComponent'
RemovableComponent = require './RemovableComponent'
ExprLinkComponent = require './ExprLinkComponent'

# Displays a boolean filter expression. Just shows "+ Add filter" (or other add label) when empty
module.exports = class FilterExprComponent extends React.Component
  @propTypes:
    schema: PropTypes.object.isRequired
    dataSource: PropTypes.object.isRequired # Data source to use to get values

    table: PropTypes.string.isRequired # Current table

    value: PropTypes.object   # Current value
    onChange: PropTypes.func  # Called with new expression
    addLabel: PropTypes.node  # Label for adding item. Default "+ Add Label"

  @contextTypes:
    locale: PropTypes.string  # e.g. "en"

  @defaultProps:
    addLabel: "+ Add Filter"

  constructor: (props) ->
    super(props)

    @state = { displayNull: false } # Set true when initial null value should be displayed

  # Handle add filter clicked by wrapping in "and" if existing, otherwise adding a null
  handleAddFilter: =>
    # If already "and", add null
    if @props.value and @props.value.op == "and"
      @props.onChange(update(@props.value, exprs: { $push: [null] }))
      return

    # If already has value, wrap in and
    if @props.value
      @props.onChange({ type: "op", op: "and", table: @props.table, exprs: [@props.value, null] })
      return

    @setState(displayNull: true, => @newExpr?.showModal())

  # Clean expression and pass up
  handleChange: (expr) =>
    @props.onChange(@cleanExpr(expr))

  # Cleans an expression
  cleanExpr: (expr) ->
    return new ExprCleaner(@props.schema).cleanExpr(expr, {
      table: @props.table
      types: ["boolean"]
    })

  # Handle change to a single item
  handleAndChange: (i, expr) =>
    @handleChange(update(@props.value, exprs: { $splice: [[i, 1, expr]]}))

  handleAndRemove: (i) =>
    @handleChange(update(@props.value, exprs: { $splice: [[i, 1]]}))    

  handleRemove: =>
    @setState(displayNull: false)
    @handleChange(null)    

  renderAddFilter: ->
    R 'div', null, 
      R 'a', onClick: @handleAddFilter, @props.addLabel

  render: ->
    expr = @cleanExpr(@props.value)

    # Render each item of and
    if expr and expr.op == "and"
      return R 'div', null,
        R StackedComponent, 
          joinLabel: "and"
          items: _.map expr.exprs, (subexpr, i) =>
            elem: new ExprElementBuilder(@props.schema, @props.dataSource, @context.locale).build(subexpr, @props.table, (if @props.onChange then @handleAndChange.bind(null, i)), { 
              types: ["boolean"]
              preferLiteral: false
              suppressWrapOps: ['and']   # Don't allow wrapping in and since this is an and control
            })
            onRemove: if @props.onChange then @handleAndRemove.bind(null, i)

        # Only display add if last item is not null
        if _.last(expr.exprs) != null and @props.onChange
          @renderAddFilter()

    else if expr 
      return R 'div', null,
        R RemovableComponent, 
          onRemove: if @props.onChange then @handleRemove,
          new ExprElementBuilder(@props.schema, @props.dataSource, @context.locale).build(expr, @props.table, (if @props.onChange then @handleChange), { 
            types: ["boolean"]
            preferLiteral: false
            suppressWrapOps: ['and']  # Don't allow wrapping in and since this is an and control
          })

        # Only display add if has a value
        @renderAddFilter()
    else if @state.displayNull
      R ExprLinkComponent, 
        ref: (c) => @newExpr = c
        schema: @props.schema
        dataSource: @props.dataSource
        table: @props.table
        onChange: if @props.onChange then @handleChange
    else
      @renderAddFilter()
