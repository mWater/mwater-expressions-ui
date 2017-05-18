React = require 'react'
R = React.createElement
H = React.DOM
_ = require 'lodash'

ui = require 'react-library/lib/bootstrap'

LocalizedStringEditorComp = require '../LocalizedStringEditorComp'
PropertyListEditorComponent = require './PropertyListEditorComponent'
IdFieldComponent = require './IdFieldComponent'

# edit section
module.exports = class SectionEditorComponent extends React.Component
  @propTypes:
    property: React.PropTypes.object.isRequired # The property being edited
    onChange: React.PropTypes.func.isRequired # Function called when anything is changed in the editor
    features: React.PropTypes.array # Features to be enabled apart from the default features
    
  @defaultProps:
    features: []
    
  render: ->
    H.div null,
      # todo: validate id
      # Sections need an id
      if _.includes @props.features, "idField"
        R IdFieldComponent, 
          value: @props.property.id
          onChange: (value) => @props.onChange(_.extend({}, @props.property, id: value))
        R ui.FormGroup, label: "ID",
          H.input type: "text", className: "form-control", value: @props.property.id, onChange: (ev) => @props.onChange(_.extend({}, @props.property, id: ev.target.value))
          H.p className: "help-block", "Letters lowercase, numbers and _ only. No spaces or uppercase"
      if _.includes @props.features, "code"
        R ui.FormGroup, label: "Code",
          H.input type: "text", className: "form-control", value: @props.property.code, onChange: (ev) => @props.onChange(_.extend({}, @props.property, code: ev.target.value))
      R ui.FormGroup, label: "Name",
        R LocalizedStringEditorComp, value: @props.property.name, onChange: (value) => @props.onChange(_.extend({}, @props.property, name: value))
      R ui.FormGroup, label: "Description",
        R LocalizedStringEditorComp, value: @props.property.desc, onChange: (value) => @props.onChange(_.extend({}, @props.property, desc: value))
