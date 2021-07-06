// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
import { assert } from 'chai';
import _ from 'lodash';
import ScalarExprTreeBuilder from '../src/ScalarExprTreeBuilder';
import { Schema } from "mwater-expressions";
import canonical from 'canonical-json';

function compare(actual, expected) {
  return assert.equal(
    canonical(actual),
    canonical(expected),
    "\n" + canonical(actual) + "\n" + canonical(expected) + "\n"
  );
}

describe("ScalarExprTreeBuilder", function() {
  beforeEach(function() {
    this.schema = new Schema();
    this.schema = this.schema.addTable({ id: "t1", name: "T1", contents: [
      { id: "c1", name: { en: "C1" }, type: "text" }
    ]});

    return this.schema = this.schema.addTable({ id: "t2", name: "T2", label: "c1", contents: [
      { id: "c1", name: { en: "C1" }, type: "text" }
    ]});
  });

  it("returns columns", function() {
    const nodes = new ScalarExprTreeBuilder(this.schema).getTree({table: "t1"});
    assert.deepEqual(_.pluck(nodes, "name"), ["C1", "T1"]);
    return assert(_.isEqual(nodes[0].value, { table: "t1", joins: [], expr: { type: "field", table: "t1", column: "c1"}}), JSON.stringify(nodes[0].value));
  });

  it("allows selection of single join as id type", function() {
    // Join single column
    const join = { fromCol: "c1", toTable: "t2", toCol: "c1", type: "n-1" };
    this.schema = this.schema.addTable({ id: "t1", name: "T1", contents: [
      { id: "c1", name: { en: "C1" }, type: "text" },
      { id: "c2", name: { en: "C2" }, type: "join", join }
    ]});

    const nodes = new ScalarExprTreeBuilder(this.schema).getTree({table: "t1"});
    return compare(nodes[1].value, { table: "t1", joins: [], expr: { type: "field", table: "t1", column: "c2" }});
});

  it("does not allow selection of single join as id type if idTable is wrong", function() {
    // Join single column
    const join = { fromCol: "c1", toTable: "t2", toCol: "c1", type: "n-1" };
    this.schema = this.schema.addTable({ id: "t1", name: "T1", contents: [
      { id: "c1", name: { en: "C1" }, type: "text" },
      { id: "c2", name: { en: "C2" }, type: "join", join }
    ]});

    const nodes = new ScalarExprTreeBuilder(this.schema).getTree({table: "t1", idTable: "tx"});
    return assert(!nodes[1].value, JSON.stringify(nodes[1].value));
  });

  it("returns table sections if present", function() {
    this.schema = new Schema();
    this.schema = this.schema.addTable({ id: "t1", name: { en: "T1" }, contents: [
        { id: "c2", name: { en: "C2" }, type: "text" },
        { name: { en: "A" }, type: "section", contents: [
          { id: "c4", name: { en: "C4" }, type: "text" },
          { id: "c5", name: { en: "C5" }, type: "text" }
        ]}
    ]});

    const nodes = new ScalarExprTreeBuilder(this.schema).getTree({table: "t1"});
    assert.deepEqual(_.pluck(nodes, "name"), ["C2", "A", "T1"]);
    assert.equal(nodes[1].children().length, 2);
    return assert.equal(nodes[1].children()[0].name, "C4");
  });

  it("returns count expr as first if includeAggr is true", function() {
    // Should not add root node
    const nodes = new ScalarExprTreeBuilder(this.schema).getTree({ table: "t1", includeAggr: true });
    assert.deepEqual(_.pluck(nodes, "name"), ["Number of T1", "C1"]);
    return assert.deepEqual(nodes[0].value, { table: "t1", joins: [], expr: { type: "op", op: "count", table: "t1", exprs: [] } }, JSON.stringify(nodes[0].value));
  });

  describe("filtering", function() {
    it("filters by name", function() {
      this.schema = new Schema({ tables: [{ id: "t1", contents: [
        { id: "c1", name: { en: "abc" }, type: "text" },
        { id: "c2", name: { en: "BCD" }, type: "text" },
        { id: "c3", name: { en: "cde" }, type: "text" }
      ]}]});

      debugger;
      const nodes = new ScalarExprTreeBuilder(this.schema).getTree({ table: "t1", filter: "Cd" });
      return assert.deepEqual(_.pluck(nodes, "name"), ["BCD", "cde"]);
  });

    it("keeps all children of matching nodes with children", function() {
      this.schema = new Schema({ tables: [{ id: "t1", contents: [
        { id: "c1", name: { en: "abc" }, type: "text" }, // Not a match
        { id: "c2", name: { en: "BCD" }, type: "section", contents: [
          { id: "c3", name: { en: "xyz" }, type: "text" }  // Not a match
        ]}
      ]}]});

      const nodes = new ScalarExprTreeBuilder(this.schema).getTree({ table: "t1", filter: "Cd" });
      return assert.equal(nodes[0].children()[0].name, "xyz");
    });

    it("has level 1 initially closed when filtering matches the section", function() {
      this.schema = new Schema({ tables: [{ id: "t1", contents: [
        { id: "c1", name: { en: "abc" }, type: "text" }, // Not a match
        { id: "c2", name: { en: "BCD" }, type: "section", contents: [
          { id: "c3", name: { en: "xyz" }, type: "text" }  // Not a match
        ]}
      ]}]});

      const nodes = new ScalarExprTreeBuilder(this.schema).getTree({ table: "t1", filter: "Cd" });
      return assert(!nodes[0].initiallyOpen);
    });

    it("filters by level 0 name", function() {
      this.schema = new Schema({ tables: [{ id: "t1", contents: [
        { id: "c1", name: { en: "abc" }, type: "text" },
        { id: "c2", name: { en: "xyz" }, type: "text" }
      ]}]});

      const nodes = new ScalarExprTreeBuilder(this.schema).getTree({ table: "t1", filter: "xyz" });
      return assert.deepEqual(_.pluck(nodes, "name"), ["xyz"]);
  });

    it("filters by level 1 name", function() {
      this.schema = new Schema({ tables: [{ id: "t1", contents: [
        { id: "c1", name: { en: "c1" }, type: "text" },
        { id: "c2", name: { en: "c2" }, type: "section", contents: [
          { id: "c3", name: { en: "c3" }, type: "text" }
        ]}
      ]}]});

      const nodes = new ScalarExprTreeBuilder(this.schema).getTree({ table: "t1", filter: "c3" });
      assert.deepEqual(_.pluck(nodes, "name"), ["c2"]);
      return assert.deepEqual(_.pluck(nodes[0].children(), "name"), ["c3"]);
  });

    return it("filters by level 2 name", function() {
      this.schema = new Schema({ tables: [{ id: "t1", contents: [
        { id: "c1", name: { en: "c1" }, type: "text" },
        { id: "c2", name: { en: "c2" }, type: "section", contents: [
          { id: "c3", name: { en: "c3" }, type: "section", contents: [
            { id: "c4", name: { en: "c4" }, type: "text" }
          ]}
        ]}
      ]}]});

      const nodes = new ScalarExprTreeBuilder(this.schema).getTree({ table: "t1", filter: "c4" });
      assert.deepEqual(_.pluck(nodes, "name"), ["c2"]);
      assert.deepEqual(_.pluck(nodes[0].children(), "name"), ["c3"]);
      return assert.deepEqual(_.pluck(nodes[0].children()[0].children(), "name"), ["c4"]);
  });
});

  it("follows joins", function() {
    // Join column
    const join = { fromCol: "c1", toTable: "t2", toCol: "c1", type: "n-1" };
    
    this.schema = this.schema.addTable({ id: "t1", name: { en: "T1" }, contents: [
      { id: "c1", name: { en: "C1" }, type: "text" },
      { id: "c2", name: { en: "C2" }, type: "join", join }
    ]});

    const nodes = new ScalarExprTreeBuilder(this.schema).getTree({table: "t1"});
    // Go to 2nd child
    const subnode = nodes[1];

    return assert(_.isEqual(subnode.children()[0].value, { table: "t1", joins: ["c2"], expr: { type: "field", table: "t2", column: "c1"}}), JSON.stringify(subnode));
  });

  it("limits to one table", function() {
    // Should not add root node
    const nodes = new ScalarExprTreeBuilder(this.schema).getTree({ table: "t1" });
    return assert.deepEqual(_.pluck(nodes, "name"), ["C1", "T1"]);
});

  return describe("limits type", function() {
    it("includes direct types", function() {
      this.schema = this.schema.addTable({ id: "t1", name: { en: "T1" }, contents: [
        { id: "c1", name: { en: "C1" }, type: "text" },
        { id: "c2", name: { en: "C2" }, type: "number" }
      ]});

      // Get nodes 
      let nodes = new ScalarExprTreeBuilder(this.schema).getTree({ table: "t1", types: ["number"] });
      assert.equal(nodes.length, 1);

      // Get nodes of first table
      nodes = new ScalarExprTreeBuilder(this.schema).getTree({ table: "t1", types: ["enum"] });
      return assert.equal(nodes.length, 0, "Number not included");
    });

    return it("includes types formed by aggregation", function() {
      // Join column
      const join = { fromCol: "c1", toTable: "t2", toCol: "c1", type: "1-n" };
      this.schema = this.schema.addTable({ id: "t1", name: { en: "T1" }, contents: [
        { id: "c1", name: { en: "C1" }, type: "text" },
        { id: "c2", name: { en: "C2" }, type: "join", join }
      ]});

      // Go to 2nd child, children
      const nodes = new ScalarExprTreeBuilder(this.schema).getTree({ table: "t1", types: ["number"] })[0].children();
      
      assert.equal(nodes[0].name, "Number of T2");
      return assert.deepEqual(nodes[0].value.expr, { type: "op", op:"count", table: "t2", exprs: [] }, JSON.stringify(nodes[0].value.expr));
    });
  });
});
