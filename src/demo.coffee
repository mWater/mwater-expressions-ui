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
InlineExprsEditorComponent = require './InlineExprsEditorComponent'

$ ->
  # $.getJSON "https://api.mwater.co/v3/jsonql/schema?formIds=f6d3b6deed734467932f4dca34af4175", (schemaJson) ->
  #   schema = new Schema(schemaJson)
  # dataSource = new MWaterDataSource("https://api.mwater.co/v3/", null, false)
    # # dataSource = new MWaterDataSource("http://localhost:1234/v3/", "e449acf016c362f19c4b65b52db23486", false)

  # ReactDOM.render(R(MockTestInlineExprsEditorComponent), document.getElementById("main"))
  ReactDOM.render(R(MockTestComponent), document.getElementById("main"))
  # ReactDOM.render(R(LiveTestComponent), document.getElementById("main"))

class MockTestInlineExprsEditorComponent extends React.Component
  constructor: ->
    super

    @state = { 
      schema: null
      dataSource: null

      text: ""
      exprs: []
      # text: "This is a {0}"
      # exprs: [{ type: "field", table: "t1", column: "text" }]
    }

  componentWillMount: ->
    schema = new Schema()
    schema = schema.addTable({ id: "t1", name: { en: "T1" }, primaryKey: "primary", contents: [
      { id: "text", name: { en: "Text" }, type: "text" }
      { id: "number", name: { en: "Number" }, type: "number" }
      { id: "enum", name: { en: "Enum" }, type: "enum", enumValues: [{ id: "a", name: { en: "A"}}, { id: "b", name: { en: "B"}}] }
      { id: "enumset", name: { en: "EnumSet" }, type: "enumset", enumValues: [{ id: "a", name: { en: "A"}}, { id: "b", name: { en: "B"}}] }
      { id: "date", name: { en: "Date" }, type: "date" }
      { id: "datetime", name: { en: "Datetime" }, type: "datetime" }
      { id: "boolean", name: { en: "Boolean" }, type: "boolean" }
      { id: "1-2", name: { en: "T1->T2" }, type: "join", join: { fromColumn: "primary", toTable: "t2", toColumn: "t1", type: "1-n" }}
    ]})

    schema = schema.addTable({ id: "t2", name: { en: "T2" }, primaryKey: "primary", ordering: "number", contents: [
      { id: "text", name: { en: "Text" }, type: "text" }
      { id: "number", name: { en: "Number" }, type: "number" }
      { id: "2-1", name: { en: "T2->T1" }, type: "join", join: { fromColumn: "t1", toTable: "t1", toColumn: "primary", type: "n-1" }}
    ]})

    schema = schema.addTable({ id: "t3", name: { en: "T3" }, primaryKey: "primary", ordering: "number", contents: [
      { id: "text", name: { en: "Text" }, type: "text" }
      { id: "number", name: { en: "Number" }, type: "number" }
    ]})

    # Fake data source
    dataSource = {
      performQuery: (query, cb) =>
        cb(null, [
          { value: "abc" }
          { value: "xyz" }
          ])
    }

    @setState(schema: schema, dataSource: dataSource)

  handleChange: (text, exprs) => 
    console.log "handleChange: #{text}"
    @setState(text: text, exprs: exprs)

  render: ->
    if not @state.schema
      return null

    H.div style: { padding: 10 },
      R(InlineExprsEditorComponent, 
        schema: @state.schema
        dataSource: @state.dataSource
        table: "t1"
        text: @state.text
        exprs: @state.exprs
        onChange: @handleChange
        types: ['number']
        aggrStatuses: ["aggregate", "literal"]
      )
      # H.br()
      # H.br()
      # H.pre null, JSON.stringify(@state.value, null, 2)


class MockTestComponent extends React.Component
  constructor: ->
    super
    @state = { 
      value: null # { type: "field", table: "t1", column: "1-2" }
      schema: null
      dataSource: null
    }

  componentWillMount: ->
    schema = new Schema()
    schema = schema.addTable({ id: "t1", name: { en: "T1" }, primaryKey: "primary", contents: [
      { id: "text", name: { en: "Text" }, desc: { en: "Text is a bunch of characters" }, type: "text" }
      { id: "number", name: { en: "Number" }, type: "number" }
      { id: "enum", name: { en: "Enum" }, type: "enum", enumValues: [{ id: "a", name: { en: "A"}}, { id: "b", name: { en: "B"}}] }
      { id: "enumset", name: { en: "EnumSet" }, type: "enumset", enumValues: [{ id: "a", name: { en: "A"}}, { id: "b", name: { en: "B"}}] }
      { id: "date", name: { en: "Date" }, type: "date" }
      { id: "datetime", name: { en: "Datetime" }, type: "datetime" }
      { id: "boolean", name: { en: "Boolean" }, type: "boolean" }
      { id: "geometry", name: { en: "Geometry" }, type: "geometry" }
      { id: "1-2", name: { en: "T1->T2" }, type: "join", join: { fromColumn: "primary", toTable: "t2", toColumn: "t1", type: "1-n" }}
    ]})

    schema = schema.addTable({ id: "t2", name: { en: "T2" }, primaryKey: "primary", ordering: "number", contents: [
      { id: "text", name: { en: "Text" }, type: "text" }
      { id: "enum", name: { en: "Enum" }, type: "enum", enumValues: [{ id: "a", name: { en: "A"}}, { id: "b", name: { en: "B"}}] }
      { id: "number", name: { en: "Number" }, type: "number" }
      { id: "2-1", name: { en: "T2->T1" }, type: "join", join: { fromColumn: "t1", toTable: "t1", toColumn: "primary", type: "n-1" }}
    ]})

    schema = schema.addTable({ id: "t3", name: { en: "T3" }, primaryKey: "primary", ordering: "number", contents: [
      { id: "text", name: { en: "Text" }, type: "text" }
      { id: "number", name: { en: "Number" }, type: "number" }
    ]})

    # Fake data source
    dataSource = {
      performQuery: (query, cb) =>
        cb(null, [
          { value: "abc", label: "ABC" }
          { value: "xyz", label: "XYZ" }
          ])
    }

    @setState(schema: schema, dataSource: dataSource)

  handleValueChange: (value) => 
    # value = new ExprCleaner(@state.schema).cleanExpr(value) #, { type: 'boolean' })
    @setState(value: value)

  render: ->
    if not @state.schema
      return null

    H.div style: { padding: 10 },
      R(ExprComponent, 
        schema: @state.schema
        dataSource: @state.dataSource
        table: "t1"
        types: ["text", "enum", "boolean", "date", "number", "datetime"]
        # types: ['number']
        # enumValues: [{ id: "aa", name: { en: "A" }}, { id: "bb", name: { en: "B" }}] 
        # idTable: "t4"
        value: @state.value
        onChange: @handleValueChange
        aggrStatuses: ["aggregate", "literal"]
      )
      H.br()
      H.br()
      H.pre null, JSON.stringify(@state.value, null, 2)



class LiveTestComponent extends React.Component
  constructor: ->
    super
    @state = { 
      value: null
      schema: null
      dataSource: null
    }

  componentWillMount: ->
    # apiUrl = "http://localhost:1234/v3/"
    apiUrl = "https://api.mwater.co/v3/"
    $.getJSON apiUrl + "jsonql/schema", (schemaJson) =>
      schema = new Schema(schemaJson)
      dataSource = new MWaterDataSource(apiUrl, null, false)

      @setState(schema: schema, dataSource: dataSource)

  handleValueChange: (value) => 
    value = new ExprCleaner(@state.schema).cleanExpr(value) #, { type: 'boolean' })
    @setState(value: value)

  render: ->
    if not @state.schema
      return null
      
    H.div style: { padding: 10 },
      R(ExprComponent, 
        schema: @state.schema
        dataSource: @state.dataSource
        table: "entities.water_point"
        types: ['boolean']
        # enumValues: [{ id: "aa", name: { en: "A" }}, { id: "bb", name: { en: "B" }}] 
        # idTable: "t4"
        value: @state.value
        onChange: @handleValueChange
      )
      H.br()
      H.br()
      H.pre null, JSON.stringify(@state.value, null, 2)

expr1 = { type: "comparison", table: "t1", op: "=", lhs: { type: "field", table: "t1", column: "number" }, rhs: { type: "literal", valueType: "integer", value: 4 } }
expr2 = { type: "comparison", table: "t1", op: "=", lhs: { type: "field", table: "t1", column: "number" }, rhs: { type: "literal", valueType: "integer", value: 5 } }
value = { type: "logical", table: "t1", op: "and", exprs: [expr1, expr2] }


value = {
  "type": "op",
  "table": "entities.water_point",
  "op": "within",
  "exprs": [
    {
      "type": "scalar",
      "table": "entities.water_point",
      "joins": [
        "admin_region"
      ],
      "expr": {
        "type": "id",
        "table": "admin_regions"
      }
    },
    {
      "type": "literal",
      "valueType": "id",
      "idTable": "admin_regions",
      "value": "dba202a4-95eb-47e2-8070-f872e08c3c84"
    }
  ]
}

value = null

value = {
  "type": "op",
  "table": "t1",
  "op": "percent where",
  "exprs": [
    {
      "type": "op",
      "table": "t1",
      "op": "= any",
      "exprs": [
        {
          "type": "scalar",
          "table": "t1",
          "joins": [
            "1-2"
          ],
          "expr": {
            "type": "op",
            "op": "last",
            "table": "t2",
            "exprs": [
              {
                "type": "field",
                "table": "t2",
                "column": "enum"
              }
            ]
          }
        },
        null
      ]
    }
  ]
}
#   {
#   "type": "op",
#   "table": "t1",
#   "op": "=",
#   "exprs": [
#     {
#       "type": "scalar",
#       "table": "t1",
#       "joins": [
#         "1-2"
#       ],
#       "expr": {
#         "type": "field",
#         "table": "t2",
#         "column": "number"
#       }
#     },
#     null
#   ]
# }

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
