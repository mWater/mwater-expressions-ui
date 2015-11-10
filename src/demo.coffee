React = require 'react'
ReactDOM = require 'react-dom'
R = React.createElement
H = React.DOM
Schema = require("mwater-expressions").Schema

ExprComponent = require './ExprComponent'
ExprCleaner = require("mwater-expressions").ExprCleaner

$ ->
  $.getJSON "https://api.mwater.co/v3/jsonql/schema?formIds=f6d3b6deed734467932f4dca34af4175", (schemaJson) ->
    schema = new Schema(schemaJson)
  # schema = schema.addTable({ id: "t1", name: "T1", contents: [
  #   { id: "text", name: "Text", type: "text" }
  #   { id: "number", name: "Number", type: "number" }
  #   { id: "enum", name: "Enum", type: "enum", values: [{ id: "a", name: "A"}, { id: "b", name: "B"}] }
  #   { id: "date", name: "Date", type: "date" }
  #   { id: "datetime", name: "Datetime", type: "datetime" }
  #   { id: "boolean", name: "Boolean", type: "boolean" }
  #   { id: "1-2", name: "T1->T2", type: "join", join: { fromTable: "t1", fromColumn: "primary", toTable: "t2", toColumn: "t1", op: "=", multiple: true }}
  # ]})

  # schema = schema.addTable({ id: "t2", name: "T2", ordering: "number", contents: [
  #   { id: "t1", name: "T1", type: "uuid" }
  #   { id: "text", name: "Text", type: "text" }
  #   { id: "number", name: "number", type: "number" }
  #   { id: "2-1", name: "T2->T1", type: "join", join: { fromTable: "t2", fromColumn: "t1", toTable: "t1", toColumn: "primary", op: "=", multiple: false }}
  #   ]})
    alert("ho!!")
    class TestComponent extends React.Component
      constructor: ->
        super
        @state = { value: {} }

      handleValueChange: (value) => 
        value = new ExprCleaner(schema).cleanExpr(value, { types: ['boolean'] })
        @setState(value: value)

      render: ->
        R(ExprComponent, schema: schema, dataSource: {}, table: "responses:f6d3b6deed734467932f4dca34af4175", value: @state.value, onChange: @handleValueChange)

    ReactDOM.render(R(TestComponent), document.getElementById("main"))



# class SelectExprComponent extends React.Component
#   constructor: ->
#     super
#     @state = { active: false }
  
#   handleActivate: =>
#     @setState(active: true)

#   handleDeactivate: =>
#     @setState(active: false)

#   render: ->
#     if @state.active
#       R ClickOutHandler, onClickOut: @handleDeactivate,
#         H.input type: "text", initialValue: ""
#     else
#       H.a onClick: @handleActivate, "Select..."      