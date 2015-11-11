assert = require('chai').assert
_ = require 'lodash'
React = require('react')
ReactTestUtils = require('react-addons-test-utils')
R = React.createElement
canonical = require 'canonical-json'

fixtures = require './fixtures'

ExprComponent = require '../src/ExprComponent'
SelectExprComponent = require '../src/SelectExprComponent'

compare = (actual, expected) ->
  assert.equal canonical(actual), canonical(expected), "\n" + canonical(actual) + "\n" + canonical(expected) + "\n"

describe "ExprComponent", ->
  describe "boolean required", ->
    before ->
      @schema = fixtures.simpleSchema()
      @dataSource = {}

    it "wraps number in =", (done) ->
      numberField = { type: "field", table: "t1", column: "number" }

      onChange = (value) =>
        # Should be wrapped in =
        compare(value, { type: "op", table: "t1", op: "=", exprs: [numberField, null]})
        done()

      # Create component
      elem = R(ExprComponent, schema: @schema, dataSource: @dataSource, table: "t1", value: null, onChange: onChange, type: "boolean")
      comp = ReactTestUtils.renderIntoDocument(elem)

      # Find SelectExprComponent
      selectComp = ReactTestUtils.findRenderedComponentWithType(comp, SelectExprComponent)

      # Fake selecting number field
      selectComp.props.onSelect(numberField)