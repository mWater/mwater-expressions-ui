assert = require('chai').assert
_ = require 'lodash'
ScalarExprTreeBuilder = require '../src/ScalarExprTreeBuilder'
Schema = require("mwater-expressions").Schema

describe "ScalarExprTreeBuilder", ->
  beforeEach ->
    @schema = new Schema()
    @schema = @schema.addTable({ id: "t1", name: "T1", contents: [
      { id: "c1", name: { en: "C1" }, type: "text" }
    ]})

    @schema = @schema.addTable({ id: "t2", name: "T2", contents: [
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
    assert _.isEqual(nodes[1].value, { table: "t1", joins: ["c2"], expr: { type: "id", table: "t2" }}), JSON.stringify(nodes[1].value)

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

  it "returns id expr as first if includeCount is true", ->
    # Should not add root node
    nodes = new ScalarExprTreeBuilder(@schema).getTree({ table: "t1", includeCount: true })
    assert.deepEqual _.pluck(nodes, "name"), ["Number of T1", "C1"]
    assert.deepEqual nodes[0].value.expr, { type: "id", table: "t1" }, JSON.stringify(nodes[0].value)

  describe "filtering", ->
    it "filters by name", ->
      @schema = new Schema({ tables: [{ id: "t1", contents: [
        { id: "c1", name: { en: "abc" }, type: "text" }
        { id: "c2", name: { en: "BCD" }, type: "text" }
        { id: "c3", name: { en: "cde" }, type: "text" }
      ]}]})

      nodes = new ScalarExprTreeBuilder(@schema).getTree({ table: "t1", filter: /Cd/i })
      assert.deepEqual _.pluck(nodes, "name"), ["BCD", "cde"]

    it "keeps all children of matching nodes with children", ->
      @schema = new Schema({ tables: [{ id: "t1", contents: [
        { id: "c1", name: { en: "abc" }, type: "text" } # Not a match
        { id: "c2", name: { en: "BCD" }, type: "section", contents: [
          { id: "c3", name: { en: "xyz" }, type: "text" }  # Not a match
        ]}
      ]}]})

      nodes = new ScalarExprTreeBuilder(@schema).getTree({ table: "t1", filter: /Cd/i })
      assert.equal nodes[0].children()[0].name, "xyz"

    it "has level 1 initially open when filtering", ->
      @schema = new Schema({ tables: [{ id: "t1", contents: [
        { id: "c1", name: { en: "abc" }, type: "text" } # Not a match
        { id: "c2", name: { en: "BCD" }, type: "section", contents: [
          { id: "c3", name: { en: "xyz" }, type: "text" }  # Not a match
        ]}
      ]}]})

      nodes = new ScalarExprTreeBuilder(@schema).getTree({ table: "t1", filter: /Cd/i })
      assert.isTrue nodes[0].initiallyOpen

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
      
      # Should include id field, because can be aggregated to number via count
      assert.equal nodes.length, 1, "Should include id"

      assert.equal nodes[0].name, "Number of T2"
      assert.deepEqual nodes[0].value.expr, { type: "id", table: "t2" }
