# assert = require('chai').assert
# _ = require 'lodash'
# React = require('react')
# ReactTestUtils = require('react-addons-test-utils')
# R = React.createElement
# canonical = require 'canonical-json'

# fixtures = require './fixtures'
# TestComponent = require('react-library/lib/TestComponent')

# ExprComponent = require '../src/ExprComponent'
# EnumSetComponent = require '../src/EnumSetComponent'
# # OmniBoxExprComponent = require '../src/OmniBoxExprComponent'

# compare = (actual, expected) ->
#   assert.equal canonical(actual), canonical(expected), "\n" + canonical(actual) + "\n" + canonical(expected) + "\n"

# describe "ExprComponent", ->
#   beforeEach ->
#     @schema = fixtures.simpleSchema()
#     @dataSource = {}

#     @toDestroy = []

#     @render = (options = {}) =>
#       elem = R(ExprComponent, _.extend({}, { schema: @schema, dataSource: @dataSource, table: "t1" }, options))
#       comp = new TestComponent(elem)
#       @toDestroy.push(comp)
#       return comp

#   afterEach ->
#     for comp in @toDestroy
#       comp.destroy()

#   # describe "with null expression", ->
#   #   it "allows click selecting number", (done) ->
#   #     onChange = (value) =>
#   #       compare(value, { type: "field", table: "t1", column: "number" })
#   #       done()

#   #     comp = @render(value: null, onChange: onChange)

#   #     TestComponent.click(comp.findInput()) # Click to open dropdown
#   #     listItem = comp.findComponentByText(/Number/)
#   #     TestComponent.click(listItem)

#     # describe "boolean required", ->
#     #   it "wraps number in =", (done) ->
#     #     numberField = { type: "field", table: "t1", column: "number" }

#     #     onChange = (value) =>
#     #       # Should be wrapped in =
#     #       compare(value, { type: "op", table: "t1", op: "=", exprs: [numberField, null]})
#     #       done()

#     #     # Create component
#     #     comp = @render(value: null, onChange: onChange, types: ["boolean"])

#     #     # Find OmniBoxExprComponent
#     #     omniComp = ReactTestUtils.findRenderedComponentWithType(comp.getComponent(), OmniBoxExprComponent)

#     #     # Fake selecting number field
#     #     omniComp.props.onChange(numberField)

#     #   it "allows selecting any type", ->
#     #     comp = @render(value: null, types: ["boolean"])

#     #     TestComponent.click(comp.findInput()) # Click to open dropdown
#     #     assert comp.findComponentByText(/Text/)
#     #     assert comp.findComponentByText(/Enum/)

#   it "allows switching of operation", (done) ->
#     # Number = number
#     expr = {
#       type: "op"
#       table: "t1"
#       op: "="
#       exprs: [
#         { type: "field", table: "t1", column: "number" }
#         { type: "literal", valueType: "number", value: 3 }
#       ]
#     }

#     onChange = (value) =>
#       assert.equal value.op, ">"
#       done()

#     comp = @render(value: expr, onChange: onChange, types: ["boolean"])

#     # Open dropdown
#     TestComponent.click(comp.findComponentByText(/^is$/))
    
#     # Switch to "is greater than"
#     TestComponent.click(comp.findComponentByText(/is greater than/))

#   it "propagates inner changes to expressions upwards", (done) ->
#     expr = {
#       type: "op"
#       table: "t1"
#       op: "="
#       exprs: [
#         { type: "field", table: "t1", column: "number" }
#         { type: "literal", valueType: "number", value: 3 }
#       ]
#     }

#     onChange = (value) =>
#       compare(value.exprs[1], { type: "literal", valueType: "number", value: 4 })
#       done()

#     comp = @render(value: expr, onChange: onChange)

#     TestComponent.click(comp.findInput())
#     TestComponent.changeValue(comp.findInput(), "4")
#     TestComponent.pressEnter(comp.findInput())

#   it "displays EnumSetComponent when rhs is enumset but null", ->
#     expr = {
#       type: "op"
#       table: "t1"
#       op: "= any"
#       exprs: [
#         { type: "field", table: "t1", column: "enum" }
#         null
#       ]
#     }

#     # Find EnumSetComponent
#     comp = @render(value: expr)
#     enumComp = ReactTestUtils.findRenderedComponentWithType(comp.getComponent(), EnumSetComponent)

#     # Check enumValues
#     compare(enumComp.props.enumValues, @schema.getColumn("t1", "enum").enumValues)

#   it "displays scalar", ->
#     expr = {
#       type: "scalar"
#       table: "t1"
#       aggr: "sum"
#       joins: ["1-2"]
#       expr: { type: "field", table: "t2", column: "number" }
#     }

#     comp = @render(value: expr)

#     # Finds join listed
#     assert comp.findComponentByText(/T1->T2/)

#     # Finds dest column listed
#     assert comp.findComponentByText(/Number/)
  
#   #   describe "number required", ->
#   #     it "does not show text fields", ->
#   #       comp = @render(value: {}, type: "number")
#   #       assert not comp.findComponentByText(/Text/)

#   #     it "does show number fields", ->
#   #       comp = @render(value: {}, type: "number")
#   #       assert comp.findComponentByText(/Number/)

#   #     it "allows literal + enter key", (done) ->
#   #       onChange = (value) =>
#   #         compare(value, { type: "literal", valueType: "number", value: 123 })
#   #         done()

#   #       comp = @render(value: {}, onChange: onChange, type: "number")

#   #       # Type 123 and enter
#   #       input = ReactTestUtils.findRenderedDOMComponentWithTag(comp.getComponent(), "input")
#   #       TestComponent.changeValue(input, "123")
#   #       TestComponent.pressEnter(input)

#   #     it "allows literal + click outside", (done) ->
#   #       onChange = (value) =>
#   #         compare(value, { type: "literal", valueType: "number", value: 123 })
#   #         done()

#   #       comp = @render(value: {}, onChange: onChange, type: "number")

#   #       _.defer () =>
#   #         # Type 123 and enter
#   #         input = ReactTestUtils.findRenderedDOMComponentWithTag(comp.getComponent(), "input")
#   #         TestComponent.changeValue(input, "123")
#   #         document.body.click()

#   #   describe "text required", ->
#   #     it "does not show number fields", ->
#   #       comp = @render(value: {}, type: "text")
#   #       assert not comp.findComponentByText(/Number/)

#   #     it "shows text fields", ->
#   #       comp = @render(value: {}, type: "text")
#   #       assert comp.findComponentByText(/Text/)

#   #     it "allows literal + enter key", (done) ->
#   #       onChange = (value) =>
#   #         compare(value, { type: "literal", valueType: "text", value: "abc" })
#   #         done()

#   #       comp = @render(value: {}, onChange: onChange, type: "text")

#   #       # Type 123 and enter
#   #       input = ReactTestUtils.findRenderedDOMComponentWithTag(comp.getComponent(), "input")
#   #       TestComponent.changeValue(input, "abc")
#   #       TestComponent.pressEnter(input)

#   #     it "allows literal + click outside", (done) ->
#   #       onChange = (value) =>
#   #         compare(value, { type: "literal", valueType: "text", value: "abc" })
#   #         done()

#   #       comp = @render(value: {}, onChange: onChange, type: "text")

#   #       _.defer () =>
#   #         # Type 123 and enter
#   #         input = ReactTestUtils.findRenderedDOMComponentWithTag(comp.getComponent(), "input")
#   #         TestComponent.changeValue(input, "abc")
#   #         document.body.click()

#   #   describe "enum required", ->
#   #     it "allows clicking on enum name", (done) ->
#   #       onChange = (value) =>
#   #         compare(value, { type: "literal", valueType: "enum", value: "b" })
#   #         done()

#   #       comp = @render(value: {}, onChange: onChange, type: "enum", enumValues: [{ id: "a", name: "ValueA" }, { id: "b", name: "ValueB" }])
#   #       TestComponent.click(comp.findComponentByText(/ValueB/))

#   #     it "does not show enum fields (since they prob don't match types)", ->
#   #       comp = @render(value: {}, type: "enum", enumValues: [{ id: "a", name: "ValueA" }, { id: "b", name: "ValueB" }])
#   #       assert not comp.findComponentByText(/Enum/)

#   #     it "does not show number fields", ->
#   #       comp = @render(value: {}, type: "enum", enumValues: [{ id: "a", name: "ValueA" }, { id: "b", name: "ValueB" }])
#   #       assert not comp.findComponentByText(/Number/)

#   # it "sets enumValues for literal being compared to enum field with =", ->
#   #   expr = {
#   #     type: "op"
#   #     table: "t1"
#   #     op: "="
#   #     exprs: [
#   #       { type: "field", table: "t1", column: "enum" }
#   #       { type: "literal", valueType: "enum", value: null }
#   #     ]
#   #   }

#   #   # Find EnumComponent
#   #   comp = @render(value: expr)
#   #   enumComp = ReactTestUtils.findRenderedComponentWithType(comp.getComponent(), literalComponents.EnumComponent)

#   #   # Check enumValues
#   #   compare(enumComp.props.enumValues, @schema.getColumn("t1", "enum").values)

#   # it "sets enumValues for literal being compared to enum field with = any", ->
#   #   expr = {
#   #     type: "op"
#   #     table: "t1"
#   #     op: "="
#   #     exprs: [
#   #       { type: "field", table: "t1", column: "enum" }
#   #       { type: "literal", valueType: "enum[]", value: [] }
#   #     ]
#   #   }

#   #   # Find EnumArrComponent
#   #   comp = @render(value: expr)
#   #   enumComp = ReactTestUtils.findRenderedComponentWithType(comp.getComponent(), literalComponents.EnumArrComponent)

#   #   # Check enumValues
#   #   compare(enumComp.props.enumValues, @schema.getColumn("t1", "enum").values)

    
#   # it "allows switching of scalar aggr", ->


#   # it "creates literal components for nulls on rhs of expressions", ->
#   #   expr = {
#   #     type: "op"
#   #     table: "t1"
#   #     op: "="
#   #     exprs: [
#   #       { type: "field", table: "t1", column: "number" }
#   #       null  # Should create temporary literal for display
#   #     ]
#   #   }

#   #   comp = ReactTestUtils.renderIntoDocument(R(ExprComponent, schema: @schema, dataSource: @dataSource, table: "t1", value: expr))

#   #   # Find EnumComponent
#   #   enumComp = ReactTestUtils.findRenderedComponentWithType(comp, literalComponents.EnumComponent)

#   #   # Check enumValues
#   #   compare(enumComp.props.enumValues, @schema.getColumn("t1", "enum").values)
