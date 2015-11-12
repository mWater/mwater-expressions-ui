assert = require('chai').assert
_ = require 'lodash'
React = require('react')
ReactTestUtils = require('react-addons-test-utils')
R = React.createElement
canonical = require 'canonical-json'

fixtures = require './fixtures'
TestComponent = require './TestComponent'

OmniBoxExprComponent = require '../src/OmniBoxExprComponent'

compare = (actual, expected) ->
  assert.equal canonical(actual), canonical(expected), "\n" + canonical(actual) + "\n" + canonical(expected) + "\n"

describe "OmniBoxExprComponent", ->
  beforeEach ->
    @schema = fixtures.simpleSchema()
    @dataSource = {}

    @toDestroy = []

    @render = (options = {}) =>
      elem = R(OmniBoxExprComponent, _.extend({}, { schema: @schema, dataSource: @dataSource, table: "t1" }, options))
      comp = new TestComponent(elem)
      @toDestroy.push(comp)
      return comp
     
    @value = null
    @onChange = (value) => @value = value

  afterEach ->
    for comp in @toDestroy
      comp.destroy()

  describe "null with no type specified", ->
    beforeEach ->
      @comp = @render({ type: null, value: null, onChange: @onChange })

    it "does not show dropdown until focused", ->
      assert not @comp.findComponentByText(/Number/), "Should not show yet"
      TestComponent.click(@comp.findInput())
      assert @comp.findComponentByText(/Number/), "Should show"

    it "allows selecting Number field", ->
      TestComponent.click(@comp.findInput())
      TestComponent.click(@comp.findComponentByText(/Number/))
      assert.equal @value.column, "number"

    it "closes dropdown when selection is complete", ->
      TestComponent.click(@comp.findInput())
      TestComponent.click(@comp.findComponentByText(/Number/))
      assert not @comp.findComponentByText(/Number/), "Should not show"

  describe "null with number type specified", ->
    it "does not show text fields"
    it "allows selecting Number field"
    it "clicking on 123 clears field"
    it "clicking on 123 and entering number sets literal"
    it "respects literal initial mode"
    it "allows changing to formula mode"

  describe "null with enum type specified", ->
    it "allows searching for item"
    it "does not show Enum field"


  describe "existing number literal", ->
    beforeEach ->
      @comp = @render({ type: null, value: { type: "literal", valueType: "number", value: 234 }, onChange: @onChange })

    it "displays number", ->
      assert.equal @comp.findInput().value, "234"

    it "does not update value until tab", ->
      TestComponent.click(@comp.findInput())
      TestComponent.changeValue(@comp.findInput(), "567")
      assert.isNull @value

      TestComponent.pressTab(@comp.findInput())
      assert.equal @value.value, 567

    # it "does not update value until enter", ->
    # it "does not update value until click out", ->

    it "allows nulling by emptying"

    it "allows switching to formula mode"


  # describe "with placeholder (empty) expression", ->
  #   it "allows click selecting number", (done) ->
  #     onChange = (value) =>
  #       compare(value, { type: "field", table: "t1", column: "number" })
  #       done()

  #     comp = @render(value: {}, onChange: onChange)
  #     listItem = comp.findComponentByText(/Number/)
  #     TestComponent.click(listItem)

  #   describe "boolean required", ->
  #     it "wraps number in =", (done) ->
  #       numberField = { type: "field", table: "t1", column: "number" }

  #       onChange = (value) =>
  #         # Should be wrapped in =
  #         compare(value, { type: "op", table: "t1", op: "=", exprs: [numberField, null]})
  #         done()
