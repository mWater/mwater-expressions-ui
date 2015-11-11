Schema = require('mwater-expressions').Schema

exports.simpleSchema = ->
  schema = new Schema()
  schema = schema.addTable({ id: "t1", name: "T1", contents: [
    { id: "text", name: "Text", type: "text" }
    { id: "number", name: "Number", type: "number" }
    { id: "enum", name: "Enum", type: "enum", values: [{ id: "a", name: "A"}, { id: "b", name: "B"}] }
    { id: "date", name: "Date", type: "date" }
    { id: "datetime", name: "Datetime", type: "datetime" }
    { id: "boolean", name: "Boolean", type: "boolean" }
    { id: "1-2", name: "T1->T2", type: "join", join: { fromTable: "t1", fromColumn: "primary", toTable: "t2", toColumn: "t1", op: "=", multiple: true }}
  ]})

  schema = schema.addTable({ id: "t2", name: "T2", ordering: "number", contents: [
    { id: "t1", name: "T1", type: "uuid" }
    { id: "text", name: "Text", type: "text" }
    { id: "number", name: "Number", type: "number" }
    { id: "2-1", name: "T2->T1", type: "join", join: { fromTable: "t2", fromColumn: "t1", toTable: "t1", toColumn: "primary", op: "=", multiple: false }}
  ]})

  return schema