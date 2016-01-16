React = require 'react'
ReactDOM = require 'react-dom'
R = React.createElement
H = React.DOM
Schema = require("mwater-expressions").Schema

ExprComponent = require './ExprComponent'
ExprCleaner = require("mwater-expressions").ExprCleaner
OmniBoxExprComponent = require './OmniBoxExprComponent'
ExprCompiler = require("mwater-expressions").ExprCompiler

DataSource = require('mwater-expressions').DataSource
FilterExprComponent = require './FilterExprComponent'

$ ->
  # $.getJSON "https://api.mwater.co/v3/jsonql/schema?formIds=f6d3b6deed734467932f4dca34af4175", (schemaJson) ->
  #   schema = new Schema(schemaJson)
    # dataSource = new MWaterDataSource("https://api.mwater.co/v3/", null, false)
    # # dataSource = new MWaterDataSource("http://localhost:1234/v3/", "e449acf016c362f19c4b65b52db23486", false)

  schema = new Schema()
  schema = schema.addTable({ id: "t1", name: { en: "T1" }, primaryKey: "primary", contents: [
    { id: "text", name: { en: "Text" }, type: "text" }
    { id: "number", name: { en: "Number" }, type: "number" }
    { id: "enum", name: { en: "Enum" }, type: "enum", enumValues: [{ id: "a", name: "A"}, { id: "b", name: "B"}] }
    { id: "enumset", name: { en: "EnumSet" }, type: "enumset", enumValues: [{ id: "a", name: "A"}, { id: "b", name: "B"}] }
    { id: "date", name: { en: "Date" }, type: "date" }
    { id: "datetime", name: { en: "Datetime" }, type: "datetime" }
    { id: "boolean", name: { en: "Boolean" }, type: "boolean" }
    { id: "1-2", name: { en: "T1->T2" }, type: "join", join: { fromColumn: "primary", toTable: "t2", toColumn: "t1", type: "1-n" }}
  ]})

  schema = schema.addTable({ id: "t2", name: { en: "T2" }, primaryKey: "primary", ordering: "number", contents: [
    { id: "t1", name: { en: "T1" }, type: "uuid" }
    { id: "text", name: { en: "Text" }, type: "text" }
    { id: "number", name: { en: "Number" }, type: "number" }
    { id: "2-1", name: { en: "T2->T1" }, type: "join", join: { fromColumn: "t1", toTable: "t1", toColumn: "primary", type: "n-1" }}
  ]})

  # Fake data source
  dataSource = {
    performQuery: (query, cb) =>
      cb(null, [
        { value: "abc" }
        { value: "xyz" }
        ])
  }


  class TestComponent extends React.Component
    constructor: ->
      super
      @state = { 
        value: value
      }

    handleValueChange: (value) => 
      value = new ExprCleaner(schema).cleanExpr(value) #, { type: 'boolean' })
      @setState(value: value)


    render: ->
      dataSource
      H.div style: { padding: 10 },
        # R(OmniBoxExprComponent, 
        #     schema: schema
        #     dataSource: dataSource
        #     table: "responses:f6d3b6deed734467932f4dca34af4175"
        #     value: @state.value
        #     enumValues: [{ id: "a", name: "ABC"}, { id: "b", name: "BCD"}]
        #     type: "enum"
        #     initialMode: "literal"
        #     onChange: @handleValueChange)
        # R(ExprComponent, 
        #   schema: schema
        #   dataSource: dataSource
        #   table: "t1"
        #   value: @state.value
        #   type: "boolean"
        #   onChange: @handleValueChange
        # )
        R(FilterExprComponent, 
          schema: schema
          dataSource: dataSource
          table: "t1"
          # types: ['boolean']
          value: @state.value
          onChange: @handleValueChange
        )
        H.br()
        H.br()
        H.pre null, JSON.stringify(@state.value, null, 2)

  ReactDOM.render(R(TestComponent), document.getElementById("main"))

expr1 = { type: "comparison", table: "t1", op: "=", lhs: { type: "field", table: "t1", column: "number" }, rhs: { type: "literal", valueType: "integer", value: 4 } }
expr2 = { type: "comparison", table: "t1", op: "=", lhs: { type: "field", table: "t1", column: "number" }, rhs: { type: "literal", valueType: "integer", value: 5 } }
value = { type: "logical", table: "t1", op: "and", exprs: [expr1, expr2] }


value = {
  "type": "op",
  "table": "t1",
  "op": "=",
  "exprs": [
    {
      "type": "scalar",
      "table": "t1",
      "joins": [
        "1-2"
      ],
      "expr": {
        "type": "field",
        "table": "t2",
        "column": "number"
      }
    },
    null
  ]
}

#   "type": "op",
#   "table": "t1",
#   "op": "contains",
#   "exprs": [
#     {
#       "type": "field",
#       "table": "t1",
#       "column": "enumset"
#     },
#     null
#   ]
# }

# value = {
#   "type": "op",
#   "op": "and",
#   "table": "t1",
#   "exprs": [
#     {
#       "type": "op",
#       "table": "t1",
#       "op": "= any",
#       "exprs": [
#         {
#           "type": "field",
#           "table": "t1",
#           "column": "enum"
#         },
#         null
#       ]
#     },
#     {
#       "type": "op",
#       "table": "t1",
#       "op": "between",
#       "exprs": [
#         {
#           "type": "field",
#           "table": "t1",
#           "column": "datetime"
#         },
#         null,
#         null
#       ]
#     }
#   ]
# }

# Caching data source for mWater. Requires jQuery
class MWaterDataSource extends DataSource
  # Caching allows server to send cached results
  constructor: (apiUrl, client, caching = true) ->
    @apiUrl = apiUrl
    @client = client
    @caching = caching

  performQuery: (query, cb) ->
    url = @apiUrl + "jsonql?jsonql=" + encodeURIComponent(JSON.stringify(query))
    if @client
      url += "&client=#{@client}"

    # Setup caching
    headers = {}
    if not @caching
      headers['Cache-Control'] = "no-cache"

    $.ajax({ dataType: "json", url: url, headers: headers })
      .done (rows) =>
        cb(null, rows)
      .fail (xhr) =>
        cb(new Error(xhr.responseText))
