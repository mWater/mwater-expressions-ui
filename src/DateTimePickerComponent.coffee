$ = require 'jquery'
PropTypes = require('prop-types')
React = require 'react'
R = React.createElement
moment = require 'moment'

require("eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js")

module.exports = class DateTimePickerComponent extends React.Component
  @propTypes:
    # do we need time picker?
    timepicker: PropTypes.bool

    # callback on date change
    # argument: moment object for currently selected datetime
    onChange: PropTypes.func

    # date as moment
    date: PropTypes.object

    # default date as moment 
    defaultDate: PropTypes.object

  @defaultProps:
    timepicker: false

  onChange: (event) =>
    @props.onChange?(event.date)

  componentDidMount: ->
    node = @main

    pickerOptions =
      format: if @props.timepicker then "YYYY-MM-DD HH-mm-ss" else "YYYY-MM-DD"
      inline: true
      sideBySide: true

    if @props.defaultDate
      pickerOptions.defaultDate = @props.defaultDate

    picker = $(node).datetimepicker(pickerOptions)

    $(node).data("DateTimePicker").date(@props.date or null)
    $(node).on("dp.change", @onChange)

  componentWillReceiveProps: (nextProps) ->
    # If unchanged
    if nextProps.date == null and @props.date == null
      return
    if nextProps.date? and @props.date? and nextProps.date.isSame(@props.date)
      return

    node = @main
    $(node).off("dp.change", @onChange)
    $(node).data("DateTimePicker").date(nextProps.date or null)
    $(node).on("dp.change", @onChange)

  componentWillUnmount: ->
    node = @main
    $(node).data("DateTimePicker").destroy()

  render: ->
    R 'div', ref: (c) => @main = c