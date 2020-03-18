$ = require 'jquery'
PropTypes = require('prop-types')
React = require 'react'
R = React.createElement
moment = require 'moment'
DatePicker = require('react-datepicker').default
require("react-datepicker/dist/react-datepicker.css")
require("./DateTimePickerComponent.css")

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

  render: ->
    return R DatePicker,
      selected: if @props.date then @props.date.toDate() else null
      showTimeSelect: @props.timepicker
      inline: true
      showMonthDropdown: true
      showYearDropdown: true
      onChange: (v) =>
        @props.onChange(if v then moment(v) else null)

