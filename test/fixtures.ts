// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
import { Schema } from 'mwater-expressions';

export function simpleSchema() {
  let schema = new Schema();
  schema = schema.addTable({ id: "t1", name: { en: "T1" }, primaryKey: "primary", contents: [
    { id: "text", name: { en: "Text" }, type: "text" },
    { id: "number", name: { en: "Number" }, type: "number" },
    { id: "enum", name: { en: "Enum" }, type: "enum", enumValues: [{ id: "a", name: { en: "A" } }, { id: "b", name: { en: "B" } }] },
    { id: "enumset", name: { en: "EnumSet" }, type: "enumset", enumValues: [{ id: "a", name: { en: "A" } }, { id: "b", name: { en: "B" } }] },
    { id: "date", name: { en: "Date" }, type: "date" },
    { id: "datetime", name: { en: "Datetime" }, type: "datetime" },
    { id: "boolean", name: { en: "Boolean" }, type: "boolean" },
    { id: "1-2", name: { en: "T1->T2" }, type: "join", join: { fromTable: "t1", fromColumn: "primary", toTable: "t2", toColumn: "t1", op: "=", multiple: true }},

    // Expressions
    { id: "expr_enum", name: { en: "Expr Enum"}, type: "expr", expr: { type: "field", table: "t1", column: "enum" } },
    { id: "expr_number", name: { en: "Expr Number"}, type: "expr", expr: { type: "field", table: "t1", column: "number" } },
    { id: "expr_id", name: { en: "Expr Id"}, type: "expr", expr: { type: "id", table: "t1" } },
    { id: "expr_sum", name: { en: "Expr Sum"}, type: "expr", expr: { type: "op", op: "sum", exprs: [{ type: "field", table: "t1", column: "number" }] }}
  ]});

  schema = schema.addTable({ id: "t2", name: { en: "T2" }, primaryKey: "primary", ordering: "number", contents: [
    { id: "t1", name: { en: "T1" }, type: "uuid" },
    { id: "text", name: { en: "Text" }, type: "text" },
    { id: "number", name: { en: "Number" }, type: "number" },
    { id: "2-1", name: { en: "T2->T1" }, type: "join", join: { fromTable: "t2", fromColumn: "t1", toTable: "t1", toColumn: "primary", op: "=", multiple: false }}
  ]});

  return schema;
}