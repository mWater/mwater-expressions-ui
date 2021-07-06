// assert = require('chai').assert
// _ = require 'lodash'
// React = require('react')
// ReactTestUtils = require('react-addons-test-utils')
// R = React.createElement
// canonical = require 'canonical-json'

// fixtures = require './fixtures'
// TestComponent = require('react-library/lib/TestComponent')

// OmniBoxExprComponent = require '../src/OmniBoxExprComponent'

// compare = (actual, expected) ->
//   assert.equal canonical(actual), canonical(expected), "\n" + canonical(actual) + "\n" + canonical(expected) + "\n"

// describe "OmniBoxExprComponent", ->
//   beforeEach ->
//     @schema = fixtures.simpleSchema()
//     @dataSource = {}

//     @toDestroy = []

//     @render = (options = {}) =>
//       elem = R(OmniBoxExprComponent, _.extend({}, { schema: @schema, dataSource: @dataSource, table: "t1" }, options))
//       comp = new TestComponent(elem)
//       @toDestroy.push(comp)
//       return comp
     
//     @value = null
//     @onChange = (value) => @value = value

//   afterEach ->
//     for comp in @toDestroy
//       comp.destroy()

//   describe "TODO", ->
//     it "add date and calendar"
//     it "add enum if building"

//   describe "null with no types specified", ->
//     beforeEach ->
//       @comp = @render({ types: null, value: null, onChange: @onChange })

//     it "does not show dropdown until focused", ->
//       assert not @comp.findComponentByText(/Number/), "Should not show yet"
//       TestComponent.click(@comp.findInput())
//       assert @comp.findComponentByText(/Number/), "Should show"

//     it "allows selecting Number field", ->
//       TestComponent.click(@comp.findInput())
//       TestComponent.click(@comp.findComponentByText(/Number/))
//       assert.equal @value.column, "number"

//     it "closes dropdown when selection is complete", ->
//       TestComponent.click(@comp.findInput())
//       TestComponent.click(@comp.findComponentByText(/Number/))
//       assert not @comp.findComponentByText(/Number/), "Should not show"

//   describe "null with number type specified", ->
//     beforeEach ->
//       @comp = @render({ types: ["number"], value: null, onChange: @onChange })

//     it "does not show text fields", ->
//       TestComponent.click(@comp.findInput())
//       assert not @comp.findComponentByText(/Text/), "Should not show"

//     it "allows selecting Number field", ->
//       TestComponent.click(@comp.findInput())
//       TestComponent.click(@comp.findComponentByText(/Number/))
//       assert.equal @value.column, "number"

//     it "clicking on 123 clears field", ->
//       TestComponent.click(@comp.findInput())
//       TestComponent.changeValue(@comp.findInput(), "xy")
//       TestComponent.click(@comp.findComponentByText(/123/))
//       assert.equal @comp.findInput().value, ""

//     it "clicking on 123 and entering number sets literal", ->
//       TestComponent.click(@comp.findInput())
//       TestComponent.click(@comp.findComponentByText(/123/))
//       TestComponent.changeValue(@comp.findInput(), "999")
//       TestComponent.pressEnter(@comp.findInput())
//       assert.equal @value.value, 999

//     it "respects literal initial mode"
//     it "allows changing to formula mode"

//   describe "null with enum type with different enumValues", ->
//     beforeEach ->
//       @comp = @render({ types: ["enum"], value: null, enumValues: [{ id: "aa", name: { en: "AA"} }, { id: "bb", name: { en: "BB"} }], onChange: @onChange })

//     it "creates if/then with enum", ->
//       TestComponent.click(@comp.findInput())
//       TestComponent.click(@comp.findComponentByText(/Enum/))

//       # Make a series of compare statements
//       compare(@value, {
//         type: "case"
//         table: "t1"
//         cases: [
//           { when: { type: "op", table: "t1", op: "= any", exprs: [{ type: "field", table: "t1", column: "enum"}, null] }, then: { type: "literal", valueType: "enum", value: "aa" } }
//           { when: { type: "op", table: "t1", op: "= any", exprs: [{ type: "field", table: "t1", column: "enum"}, null] }, then: { type: "literal", valueType: "enum", value: "bb" } }
//         ]
//         else: null
//       })

//   describe "null with enum type with same named enumValues", ->
//     beforeEach ->
//       @comp = @render({ types: ["enum"], value: null, enumValues: [{ id: "aa", name: { en: "A" } }, { id: "bb", name: { en: "B"} }], onChange: @onChange })

//     it "creates if/then with enum, matching value names", ->
//       TestComponent.click(@comp.findInput())
//       TestComponent.click(@comp.findComponentByText(/Enum/))

//       # Make a series of compare statements
//       compare(@value, {
//         type: "case"
//         table: "t1"
//         cases: [
//           { 
//             when: { type: "op", table: "t1", op: "= any", exprs: [{ type: "field", table: "t1", column: "enum"}, { type: "literal", valueType: "enumset", value: ["a"] }] }
//             then: { type: "literal", valueType: "enum", value: "aa" } 
//           }
//           { 
//             when: { type: "op", table: "t1", op: "= any", exprs: [{ type: "field", table: "t1", column: "enum"}, { type: "literal", valueType: "enumset", value: ["b"] }] }
//             then: { type: "literal", valueType: "enum", value: "bb" } 
//           }
//         ]
//         else: null
//       })


//   describe "null with enum type specified", ->
//     it "allows searching for item"
//     it "does not show Enum field"

//   describe "existing number literal", ->
//     beforeEach ->
//       @comp = @render({ types: null, value: { type: "literal", valueType: "number", value: 234 }, onChange: @onChange })

//     it "displays number", ->
//       assert.equal @comp.findInput().value, "234"

//     it "does not update value until tab", ->
//       TestComponent.click(@comp.findInput())
//       TestComponent.changeValue(@comp.findInput(), "567")
//       assert.isNull @value

//       TestComponent.pressTab(@comp.findInput())
//       assert.equal @value.value, 567

//     # it "does not update value until enter", ->
//     # it "does not update value until click out", ->

//     it "allows nulling by emptying", ->
//       TestComponent.click(@comp.findInput())
//       TestComponent.changeValue(@comp.findInput(), "567")
//       TestComponent.pressTab(@comp.findInput())

//       TestComponent.click(@comp.findInput())
//       TestComponent.changeValue(@comp.findInput(), "")
//       TestComponent.pressTab(@comp.findInput())

//       assert.isNull @value

//     it "allows switching to formula mode"


//   describe "if/then", ->
//     beforeEach ->
//       @comp = @render({ types: null, value: null, allowCase: true, onChange: @onChange })

//     it "adds if/then with single empty clause", ->
//       # Open dropdown
//       TestComponent.click(@comp.findInput())

//       # Click on if/then
//       TestComponent.click(@comp.findComponentByText(/then/i))

//       compare(@value, {
//         type: "case"
//         table: "t1"
//         cases: [
//           { when: null, then: null }
//         ]
//         else: null
//         })

//   # describe "with placeholder (empty) expression", ->
//   #   it "allows click selecting number", (done) ->
//   #     onChange = (value) =>
//   #       compare(value, { type: "field", table: "t1", column: "number" })
//   #       done()

//   #     comp = @render(value: {}, onChange: onChange)
//   #     listItem = comp.findComponentByText(/Number/)
//   #     TestComponent.click(listItem)

//   #   describe "boolean required", ->
//   #     it "wraps number in =", (done) ->
//   #       numberField = { type: "field", table: "t1", column: "number" }

//   #       onChange = (value) =>
//   #         # Should be wrapped in =
//   #         compare(value, { type: "op", table: "t1", op: "=", exprs: [numberField, null]})
//   #         done()
