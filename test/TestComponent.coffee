React = require('react')
ReactDOM = require('react-dom')
ReactTestUtils = require('react-addons-test-utils')
H = React.DOM
_ = require 'lodash'

# Test component that can be created, have its element changed, have clicks and other actions simulated
module.exports = class TestComponent
  constructor: (elem) ->
    @div = document.createElement('div')
    @comp = ReactDOM.render(elem, @div)

  setElement: (elem) ->
    ReactDOM.render(elem, @div)

  getComponent: ->
    return @comp

  destroy: ->
    ReactDOM.unmountComponentAtNode(@div)

  # Find a subcomponent by a patten
  findComponentByText: (pattern) ->
    return ReactTestUtils.findAllInRenderedTree(@comp, (c) -> 
      # Only match DOM components with a child node that is matching string
      if ReactTestUtils.isDOMComponent(c)
        _.any(c.childNodes, (node) -> 
          node.nodeType == 3 and node.textContent.match(pattern))
      )[0]

  # Find input field
  findInput: ->
    return ReactTestUtils.findRenderedDOMComponentWithTag(@comp, "input")

  @click: (comp) -> ReactTestUtils.Simulate.click(comp)
  @pressEnter: (comp) -> ReactTestUtils.Simulate.keyDown(comp, {key: "Enter", keyCode: 13, which: 13})
  @changeValue: (comp, value) -> 
    comp.value = value
    ReactTestUtils.Simulate.change(comp)
