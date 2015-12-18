React = require 'react'
R = React.createElement
H = React.DOM
ReactDOM = require 'react-dom'
moment = require 'moment'

module.exports = class DateTimepickerComponent extends React.Component
  @propTypes:
    # do we need time picker?
    timepicker: React.PropTypes.bool

    # callback on date change
    # argument: {date: moment object for currently selected datetime, oldDate: moment object for previous datetime}
    onChange: React.PropTypes.func

  @defaultProps:
    timepicker: false

  onDateChanged: (event) =>
    @props.onChange?(event)

  componentDidMount: ->
    node = ReactDOM.findDOMNode(this)

    pickerOptions =
      format: if @props.timepicker then "YYYY-MM-DD HH-mm-ss" else "YYYY-MM-DD"
      inline: true
      sideBySide: true

    picker = $(node).datetimepicker(pickerOptions)
    $(node).on("dp.change", @onDateChanged)

  componentWillUnmount: ->
    node = ReactDOM.findDOMNode(this)
    $(node).data("DateTimePicker").destroy()

  render: ->
    H.div null