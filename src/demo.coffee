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
ContentEditableComponent = require './ContentEditableComponent'
PropertyListComponent = require './properties/PropertyListComponent'
PropertyListEditorComponent = require './properties/PropertyListEditorComponent'

$ ->
  # $.getJSON "https://api.mwater.co/v3/jsonql/schema?formIds=f6d3b6deed734467932f4dca34af4175", (schemaJson) ->
  #   schema = new Schema(schemaJson)
  # dataSource = new MWaterDataSource("https://api.mwater.co/v3/", null, false)
    # # dataSource = new MWaterDataSource("http://localhost:1234/v3/", "e449acf016c362f19c4b65b52db23486", false)

  # ReactDOM.render(R(MockTestInlineExprsEditorComponent), document.getElementById("main"))
  ReactDOM.render(R(MockTestComponent), document.getElementById("main"))
  # ReactDOM.render(R(PropertyListContainerComponent), document.getElementById("main"))
  # ReactDOM.render(R(LiveTestComponent), document.getElementById("main"))
  # ReactDOM.render(R(ContentEditableTestComponent), document.getElementById("main"))

class PropertyListContainerComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired # schema of all data
    dataSource: React.PropTypes.object.isRequired # data source
    table: React.PropTypes.string.isRequired    # Table that properties are of
  constructor: ->
    super

    @state = { 
      properties: properties
    }
  render: ->
    H.div className: "row",
      H.div className: "col-md-6",
        H.div style: {padding: 20, border: "1px solid #aeaeae", width: 600},
          R PropertyListComponent, 
            properties: @state.properties
            schema: @props.schema
            dataSource: @props.dataSource
            table: @props.table
            features: [
              PropertyListEditorComponent.features.sql
              PropertyListEditorComponent.features.joinType
              PropertyListEditorComponent.features.idType
            ]
            onChange: (properties) => @setState(properties: properties) 
            createRoleDisplayElem: (roles) => H.span null, JSON.stringify(roles)
            createRoleEditElem: (roles, onChange) => 
              H.input className: "form-control", value: JSON.stringify(roles), onChange: (ev) -> onChange(JSON.parse(ev.target.value))
      H.div className: "col-md-6",
        H.pre null, JSON.stringify(@state.properties, null, 2)
          
    # H.div style: {padding: 20, border: "1px solid #aeaeae", width: 600},
    #   R PropertyListEditorComponent, 
    #     properties: @state.properties
    #     onChange: (properties) => @setState(properties: properties) 

class ContentEditableTestComponent extends React.Component
  constructor: ->
    super

    @state = { 
      html: "World Water Week"
    }

  render: ->
    H.div null,
      H.div null, "Sdfsdfsd"
      H.div null, "Sdfsdfsd"
      H.div null, "Sdfsdfsd"
      R ContentEditableComponent,
        ref: "editor"
        html: @state.html
        onChange: (elem) => 
          console.log elem
          @setState(html: elem.innerHTML)
      H.button 
        onClick: => 
          console.log "click!"
          @refs.editor.pasteHTML("HELLO!", false)
        type: "button",
        "Paste"

  pasteHTML: (html, selectPastedContent) ->
    @refs.editor.focus()


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
      { id: "", name: { en: "EnumSet" }, type: "enumset", enumValues: [{ id: "a", name: { en: "A"}}, { id: "b", name: { en: "B"}}] }
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
        types: ['boolean']
        aggrStatuses: ["individual", "literal"]
        multiline: true
        rows: 5
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

      # Expressions
      { id: "expr_enum", name: { en: "Expr Enum"}, type: "expr", expr: { type: "field", table: "t1", column: "enum" } }
      { id: "expr_number", name: { en: "Expr Number"}, type: "expr", expr: { type: "field", table: "t1", column: "number" } }
      { id: "expr_id", name: { en: "Expr Id"}, type: "expr", expr: { type: "id", table: "t1" } }
      { id: "expr_sum", name: { en: "Expr Sum"}, type: "expr", expr: { type: "op", op: "sum", exprs: [{ type: "field", table: "t1", column: "number" }] }}
    ]})

    schema = schema.addTable({ id: "t2", name: { en: "T2" }, primaryKey: "primary", contents: [
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
      
    R PropertyListContainerComponent, 
      schema: @state.schema
      dataSource: @state.dataSource
      table: "t1"
      

    # H.div style: { padding: 10, marginTop: 0 },
    #   R(ExprComponent, 
    #     schema: @state.schema
    #     dataSource: @state.dataSource
    #     table: "t1"
    #     # types: ["text", "enum", "boolean", "date", "number", "datetime"]
    #     types: ['enumset']
    #     enumValues: [{ id: "aa", name: { en: "A" }}, { id: "bb", name: { en: "B" }}] 
    #     # idTable: "t4"
    #     value: @state.value
    #     onChange: @handleValueChange
    #     aggrStatuses: ["literal", "individual"]
    #   )
    #   H.br()
    #   H.br()
    #   H.pre null, JSON.stringify(@state.value, null, 2)



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
    value = new ExprCleaner(@state.schema).cleanExpr(value, { aggrStatuses: ['literal', 'aggregate']}) #, { type: 'boolean' })
    @setState(value: value)

  render: ->
    if not @state.schema
      return null
      
    H.div style: { padding: 10 },
      R(ExprComponent, 
        schema: @state.schema
        dataSource: @state.dataSource
        table: "entities.water_point"
        types: ['number']
        aggrStatuses: ['literal', 'aggregate']
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


properties = [
  {
    "_id": "7f88d07d-4dab-4d32-94df-d39d55549f90",
    "type": "enum",
    "entity_type": "water_point",
    "code": "wo_program_type",
    "name": {
      "_base": "en",
      "en": "Water.org Program Type"
    },
    "desc": {
      "_base": "en",
      "en": "Water.org Program Type"
    },
    "physical_quantity": null,
    "ref_entity_type": null,
    "deprecated": false,
    "limited": null,
    "limited_subst": null,
    "enumValues": [
      {
        "code": "watercredit",
        "name": {
          "en": "WaterCredit",
          "_base": "en"
        }
      },
      {
        "code": "directimpact",
        "name": {
          "en": "Direct Impact",
          "_base": "en"
        }
      }
    ],
    "units": null,
    "unique_code": null,
    "_roles": [
      {
        "to": "group:Water.org Water Quality",
        "role": "edit"
      },
      {
        "to": "user:admin",
        "role": "admin"
      }
    ]
  },
  {
    "_id": "c64df46b-96c3-4539-a5c4-f902c1cbf06c",
    "type": "boolean",
    "entity_type": "water_point",
    "code": "wpdx_converted_fields",
    "name": {
      "_base": "en",
      "en": "WPDX Converted fields"
    },
    "desc": {
      "_base": "en",
      "en": "WPDX Converted fields"
    },
    "physical_quantity": null,
    "ref_entity_type": null,
    "deprecated": true,
    "limited": null,
    "limited_subst": null,
    "values": null,
    "units": null,
    "unique_code": null,
    "_roles": [
      {
        "to": "all",
        "role": "edit"
      },
      {
        "to": "user:admin",
        "role": "admin"
      }
    ]
  },
  {
    "_id": "cfb1147d-54af-405c-818d-e94510177fd9",
    "type": "geometry",
    "entity_type": "water_point",
    "code": "wpdx_country",
    "name": {
      "_base": "en",
      "en": "WPDX Country (ISO 2-letter code)"
    },
    "desc": {
      "_base": "en",
      "en": "WPDX Country (ISO 2-letter code)"
    },
    "physical_quantity": null,
    "ref_entity_type": null,
    "deprecated": false,
    "limited": null,
    "limited_subst": null,
    "values": null,
    "units": null,
    "unique_code": null,
    "_roles": [
      {
        "to": "all",
        "role": "edit"
      },
      {
        "to": "user:admin",
        "role": "admin"
      }
    ]
  },
  {
    "_id": "b9fc3ed5-f830-4aa8-8824-965f287dbc44",
    "type": "text",
    "entity_type": "water_point",
    "code": "wpdx_data_source",
    "name": {
      "_base": "en",
      "en": "WPDX Data source"
    },
    "desc": {
      "_base": "en",
      "en": "WPDX Data source"
    },
    "physical_quantity": null,
    "ref_entity_type": null,
    "deprecated": true,
    "limited": null,
    "limited_subst": null,
    "values": null,
    "units": null,
    "unique_code": null,
    "_roles": [
      {
        "to": "all",
        "role": "edit"
      },
      {
        "to": "user:admin",
        "role": "admin"
      }
    ]
  },
  {
    "_id": "84a5557f-d531-4438-bb9d-801acffd7272",
    "type": "date",
    "entity_type": "water_point",
    "code": "wpdx_date_of_data_inventory",
    "name": {
      "_base": "en",
      "en": "Date of data inventory"
    },
    "desc": {
      "_base": "en",
      "en": "Date of data inventory"
    },
    "physical_quantity": null,
    "ref_entity_type": null,
    "deprecated": false,
    "limited": null,
    "limited_subst": null,
    "values": null,
    "units": null,
    "unique_code": null,
    "_roles": [
      {
        "to": "all",
        "role": "edit"
      },
      {
        "to": "group:mWater Staff",
        "role": "admin"
      },
      {
        "to": "user:admin",
        "role": "admin"
      }
    ]
  },
  {
      "_id": "a384e163-41a5-4986-bba2-b82bab31063asd",
      "type": "section",
      "name": {
        "_base": "en",
        "en": "Sample Section"
      },
      "desc": {
        "_base": "en",
        "en": "k akjsd aksjdasudha sd aksjd aksjdha k"
      },
      "contents": [
        {
          "_id": "a384e163-41a5-4986-bba2-b82bab31063e",
          "type": "text",
          "entity_type": "water_point",
          "code": "wpdx_installer",
          "name": {
            "_base": "en",
            "en": "WPDX Installer"
          },
          "desc": {
            "_base": "en",
            "en": "Description for WPDX Installer"
          },
          "physical_quantity": null,
          "ref_entity_type": null,
          "deprecated": true,
          "limited": null,
          "limited_subst": null,
          "values": null,
          "units": null,
          "unique_code": null,
          "_roles": [
            {
              "to": "all",
              "role": "edit"
            },
            {
              "to": "group:mWater Staff",
              "role": "admin"
            },
            {
              "to": "user:admin",
              "role": "admin"
            }
          ]
        },
        {
          "_id": "8a40fd46-205e-48eb-88bf-77dce043dc85",
          "type": "enum",
          "entity_type": "water_point",
          "code": "wpdx_management_structure",
          "name": {
            "_base": "en",
            "en": "WPDX Management structure"
          },
          "desc": {
            "_base": "en",
            "en": "WPDX Management structure"
          },
          "physical_quantity": null,
          "ref_entity_type": null,
          "deprecated": false,
          "limited": null,
          "limited_subst": null,
          "enumValues": [
            {
              "code": "direct_gov",
              "name": {
                "en": "Direct government operation",
                "_base": "en"
              }
            },
            {
              "code": "private_operator",
              "name": {
                "en": "Private operator/delegated management",
                "_base": "en"
              }
            },
            {
              "code": "community",
              "name": {
                "en": "Community management",
                "_base": "en"
              }
            },
            {
              "code": "institutional",
              "name": {
                "en": "Institutional management",
                "_base": "en"
              }
            },
            {
              "code": "other",
              "name": {
                "en": "Other",
                "_base": "en"
              }
            }
          ],
          "units": null,
          "unique_code": null,
          "_roles": [
            {
              "to": "all",
              "role": "edit"
            },
            {
              "to": "user:admin",
              "role": "admin"
            }
          ]
        },
        {
          "_id": "09d1c4d9-7273-47eb-a46e-8dffb593e32d",
          "type": "text",
          "entity_type": "water_point",
          "code": "wpdx_management_structure_other",
          "name": {
            "_base": "en",
            "en": "WPDX Management Structure - Other (please specify) text"
          },
          "desc": {
            "_base": "en",
            "en": "WPDX Management Structure - Other (please specify) text"
          },
          "physical_quantity": null,
          "ref_entity_type": null,
          "deprecated": false,
          "limited": null,
          "limited_subst": null,
          "values": null,
          "units": null,
          "unique_code": null,
          "_roles": [
            {
              "to": "all",
              "role": "edit"
            },
            {
              "to": "group:mWater Staff",
              "role": "admin"
            },
            {
              "to": "user:admin",
              "role": "admin"
            }
          ]
        }
      ]
  },
  {
    "_id": "e32580ab-c877-40e0-a7b6-6e0fd00322f3",
    "type": "image",
    "entity_type": "water_point",
    "code": "wpdx_id",
    "name": {
      "_base": "en",
      "en": "WPDX Water point ID"
    },
    "desc": {
      "_base": "en",
      "en": "WPDX Water point ID"
    },
    "physical_quantity": null,
    "ref_entity_type": null,
    "deprecated": true,
    "limited": null,
    "limited_subst": null,
    "values": null,
    "units": null,
    "unique_code": null,
    "_roles": [
      {
        "to": "all",
        "role": "edit"
      },
      {
        "to": "user:admin",
        "role": "admin"
      }
    ]
  }
]
