assert = require('chai').assert
_ = require 'lodash'
ScalarExprTreeBuilder = require '../src/ScalarExprTreeBuilder'
Schema = require("mwater-expressions").Schema
canonical = require 'canonical-json'

compare = (actual, expected) ->
  assert.equal canonical(actual), canonical(expected), "\n" + canonical(actual) + "\n" + canonical(expected) + "\n"

describe "ScalarExprTreeBuilder", ->
  beforeEach ->
    @schema = new Schema()
    @schema = @schema.addTable({ id: "t1", name: "T1", contents: [
      { id: "c1", name: { en: "C1" }, type: "text" }
    ]})

    @schema = @schema.addTable({ id: "t2", name: "T2", label: "c1", contents: [
      { id: "c1", name: { en: "C1" }, type: "text" }
    ]})

  it "returns columns", ->
    nodes = new ScalarExprTreeBuilder(@schema).getTree(table: "t1")
    assert.deepEqual _.pluck(nodes, "name"), ["C1"]
    assert _.isEqual(nodes[0].value, { table: "t1", joins: [], expr: { type: "field", table: "t1", column: "c1"}}), JSON.stringify(nodes[0].value)

  it "allows selection of single join as id type", ->
    # Join single column
    join = { fromCol: "c1", toTable: "t2", toCol: "c1", type: "n-1" }
    @schema = @schema.addTable({ id: "t1", name: "T1", contents: [
      { id: "c1", name: { en: "C1" }, type: "text" }
      { id: "c2", name: { en: "C2" }, type: "join", join: join }
    ]})

    nodes = new ScalarExprTreeBuilder(@schema).getTree(table: "t1")
    console.log JSON.stringify(nodes)
    compare nodes[1].value, { table: "t1", joins: [], expr: { type: "field", table: "t1", column: "c2" }}

  it "does not allow selection of single join as id type if idTable is wrong", ->
    # Join single column
    join = { fromCol: "c1", toTable: "t2", toCol: "c1", type: "n-1" }
    @schema = @schema.addTable({ id: "t1", name: "T1", contents: [
      { id: "c1", name: { en: "C1" }, type: "text" }
      { id: "c2", name: { en: "C2" }, type: "join", join: join }
    ]})

    nodes = new ScalarExprTreeBuilder(@schema).getTree(table: "t1", idTable: "tx")
    assert not nodes[1].value, JSON.stringify(nodes[1].value)

  it "returns table sections if present", ->
    @schema = new Schema()
    @schema = @schema.addTable({ id: "t1", contents: [
        { id: "c2", name: { en: "C2" }, type: "text" }
        { name: { en: "A" }, type: "section", contents: [
          { id: "c4", name: { en: "C4" }, type: "text" }
          { id: "c5", name: { en: "C5" }, type: "text" }
        ]}
    ]})

    nodes = new ScalarExprTreeBuilder(@schema).getTree(table: "t1")
    assert.deepEqual _.pluck(nodes, "name"), ["C2", "A"]
    assert.equal nodes[1].children().length, 2
    assert.equal nodes[1].children()[0].name, "C4"

  it "returns count expr as first if includeAggr is true", ->
    # Should not add root node
    nodes = new ScalarExprTreeBuilder(@schema).getTree({ table: "t1", includeAggr: true })
    assert.deepEqual _.pluck(nodes, "name"), ["Number of T1", "C1"]
    assert.deepEqual nodes[0].value, { table: "t1", joins: [], expr: { type: "op", op: "count", table: "t1", exprs: [] } }, JSON.stringify(nodes[0].value)

  describe "filtering", ->
    it "filters by name", ->
      @schema = new Schema({ tables: [{ id: "t1", contents: [
        { id: "c1", name: { en: "abc" }, type: "text" }
        { id: "c2", name: { en: "BCD" }, type: "text" }
        { id: "c3", name: { en: "cde" }, type: "text" }
      ]}]})

      debugger
      nodes = new ScalarExprTreeBuilder(@schema).getTree({ table: "t1", filter: "Cd" })
      assert.deepEqual _.pluck(nodes, "name"), ["BCD", "cde"]

    it "keeps all children of matching nodes with children", ->
      @schema = new Schema({ tables: [{ id: "t1", contents: [
        { id: "c1", name: { en: "abc" }, type: "text" } # Not a match
        { id: "c2", name: { en: "BCD" }, type: "section", contents: [
          { id: "c3", name: { en: "xyz" }, type: "text" }  # Not a match
        ]}
      ]}]})

      nodes = new ScalarExprTreeBuilder(@schema).getTree({ table: "t1", filter: "Cd" })
      assert.equal nodes[0].children()[0].name, "xyz"

    it "has level 1 initially closed when filtering matches the section", ->
      @schema = new Schema({ tables: [{ id: "t1", contents: [
        { id: "c1", name: { en: "abc" }, type: "text" } # Not a match
        { id: "c2", name: { en: "BCD" }, type: "section", contents: [
          { id: "c3", name: { en: "xyz" }, type: "text" }  # Not a match
        ]}
      ]}]})

      nodes = new ScalarExprTreeBuilder(@schema).getTree({ table: "t1", filter: "Cd" })
      assert not nodes[0].initiallyOpen

    it "filters by level 0 name", ->
      @schema = new Schema({ tables: [{ id: "t1", contents: [
        { id: "c1", name: { en: "abc" }, type: "text" }
        { id: "c2", name: { en: "xyz" }, type: "text" }
      ]}]})

      nodes = new ScalarExprTreeBuilder(@schema).getTree({ table: "t1", filter: "xyz" })
      assert.deepEqual _.pluck(nodes, "name"), ["xyz"]

    it "filters by level 1 name", ->
      @schema = new Schema({ tables: [{ id: "t1", contents: [
        { id: "c1", name: { en: "c1" }, type: "text" }
        { id: "c2", name: { en: "c2" }, type: "section", contents: [
          { id: "c3", name: { en: "c3" }, type: "text" }
        ]}
      ]}]})

      nodes = new ScalarExprTreeBuilder(@schema).getTree({ table: "t1", filter: "c3" })
      assert.deepEqual _.pluck(nodes, "name"), ["c2"]
      assert.deepEqual _.pluck(nodes[0].children(), "name"), ["c3"]

    it "filters by level 2 name", ->
      @schema = new Schema({ tables: [{ id: "t1", contents: [
        { id: "c1", name: { en: "c1" }, type: "text" }
        { id: "c2", name: { en: "c2" }, type: "section", contents: [
          { id: "c3", name: { en: "c3" }, type: "section", contents: [
            { id: "c4", name: { en: "c4" }, type: "text" }
          ]}
        ]}
      ]}]})

      nodes = new ScalarExprTreeBuilder(@schema).getTree({ table: "t1", filter: "c4" })
      assert.deepEqual _.pluck(nodes, "name"), ["c2"]
      assert.deepEqual _.pluck(nodes[0].children(), "name"), ["c3"]
      assert.deepEqual _.pluck(nodes[0].children()[0].children(), "name"), ["c4"]

  it "follows joins", ->
    # Join column
    join = { fromCol: "c1", toTable: "t2", toCol: "c1", type: "n-1" }
    
    @schema = @schema.addTable({ id: "t1", name: { en: "T1" }, contents: [
      { id: "c1", name: { en: "C1" }, type: "text" }
      { id: "c2", name: { en: "C2" }, type: "join", join: join }
    ]})

    nodes = new ScalarExprTreeBuilder(@schema).getTree(table: "t1")
    # Go to 2nd child
    subnode = nodes[1]

    assert _.isEqual(subnode.children()[0].value, { table: "t1", joins: ["c2"], expr: { type: "field", table: "t2", column: "c1"}}), JSON.stringify(subnode)

  it "limits to one table", ->
    # Should not add root node
    nodes = new ScalarExprTreeBuilder(@schema).getTree({ table: "t1" })
    assert.deepEqual _.pluck(nodes, "name"), ["C1"]

  describe "limits type", ->
    it "includes direct types", ->
      @schema = @schema.addTable({ id: "t1", name: { en: "T1" }, contents: [
        { id: "c1", name: { en: "C1" }, type: "text" }
        { id: "c2", name: { en: "C2" }, type: "number" }
      ]})

      # Get nodes 
      nodes = new ScalarExprTreeBuilder(@schema).getTree({ table: "t1", types: ["number"] })
      assert.equal nodes.length, 1

      # Get nodes of first table
      nodes = new ScalarExprTreeBuilder(@schema).getTree({ table: "t1", types: ["enum"] })
      assert.equal nodes.length, 0, "Number not included"

    it "includes types formed by aggregation", ->
      # Join column
      join = { fromCol: "c1", toTable: "t2", toCol: "c1", type: "1-n" }
      @schema = @schema.addTable({ id: "t1", name: { en: "T1" }, contents: [
        { id: "c1", name: { en: "C1" }, type: "text" }
        { id: "c2", name: { en: "C2" }, type: "join", join: join }
      ]})

      # Go to 2nd child, children
      nodes = new ScalarExprTreeBuilder(@schema).getTree({ table: "t1", types: ["number"] })[0].children()
      
      assert.equal nodes[0].name, "Number of T2"
      assert.deepEqual nodes[0].value.expr, { type: "op", op:"count", table: "t2", exprs: [] }, JSON.stringify(nodes[0].value.expr)
