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

    # the default date/datetime
    defaultDate: React.PropTypes.string

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

    if @props.defaultDate
      pickerOptions.defaultDate = @props.defaultDate

    console.log pickerOptions
    picker = $(node).datetimepicker(pickerOptions)
    $(node).on("dp.change", @onDateChanged)

  componentWillUnmount: ->
    node = ReactDOM.findDOMNode(this)
    $(node).data("DateTimePicker").destroy()

  render: ->
    H.div null