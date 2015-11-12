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
    # # Fake data source
    # dataSource = {
    #   performQuery: (query, cb) =>
    #     cb(null, [
    #       { value: "abc" }
    #       { value: "xyz" }
    #       ])
    # }

    dataSource = new MWaterDataSource("http://localhost:1234/v3/", "e449acf016c362f19c4b65b52db23486", false)

    class TestComponent extends React.Component
      constructor: ->
        super
        @state = { 
          value: null
          # value: value
# }{"type":"op","table":"responses:f6d3b6deed734467932f4dca34af4175","op":"= any","exprs":[{"type":"field","table":"responses:f6d3b6deed734467932f4dca34af4175","column":"data:dd4ba7ef310949c7ba11aa46e2529efb:value"},null]}
          # value: { type: "literal", valueType: "enum", value: "a" }
        }

      handleValueChange: (value) => 
        value = new ExprCleaner(schema).cleanExpr(value) #, { type: 'boolean' })
        @setState(value: value)

      handleCompute: =>
        exprCompiler = new ExprCompiler(schema)

        compiledExpr = exprCompiler.compileExpr(expr: @state.value, tableAlias: "main")

        # Create query
        query = {
          type: "query"
          selects: [
            { type: "select", expr: compiledExpr, alias: "value" }
          ]
          from: exprCompiler.compileTable("responses:f6d3b6deed734467932f4dca34af4175", "main")
        }

        dataSource.performQuery(query, (err, rows) =>
          console.log rows
          )

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
          R(ExprComponent, 
            schema: schema
            dataSource: dataSource
            table: "responses:f6d3b6deed734467932f4dca34af4175"
            value: @state.value
            onChange: @handleValueChange
            type: "enum"
            enumValues: [
              { id: "high", name: "High" }
              { id: "medium", name: "Medium" }
              { id: "low", name: "Low" }
            ]
          )
          H.br()
          H.br()
          H.pre null, JSON.stringify(@state.value, null, 2)
          H.button type: "button", className: "btn btn-primary", onClick: @handleCompute, "Compute"

    ReactDOM.render(R(TestComponent), document.getElementById("main"))


value = {
  "type": "op",
  "table": "responses:f6d3b6deed734467932f4dca34af4175",
  "op": "=",
  "exprs": [
    {
      "type": "op",
      "op": "+",
      "table": "responses:f6d3b6deed734467932f4dca34af4175",
      "exprs": [
        {
          "type": "case",
          "table": "responses:f6d3b6deed734467932f4dca34af4175",
          "cases": [
            {
              "when": null,
              "then": null
            }
          ],
          "else": null
        },
        null
      ]
    },
    null
  ]
}

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
