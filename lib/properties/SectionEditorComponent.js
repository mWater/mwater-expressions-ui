"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var IdFieldComponent, LocalizedStringEditorComp, PropTypes, R, React, SectionEditorComponent, _, ui;

PropTypes = require('prop-types');
React = require('react');
R = React.createElement;
_ = require('lodash');
ui = require('react-library/lib/bootstrap');
LocalizedStringEditorComp = require('../LocalizedStringEditorComp');
IdFieldComponent = require('./IdFieldComponent'); // edit section

module.exports = SectionEditorComponent = function () {
  var SectionEditorComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(SectionEditorComponent, _React$Component);

    var _super = _createSuper(SectionEditorComponent);

    function SectionEditorComponent() {
      (0, _classCallCheck2["default"])(this, SectionEditorComponent);
      return _super.apply(this, arguments);
    }

    (0, _createClass2["default"])(SectionEditorComponent, [{
      key: "render",
      value: function render() {
        var _this = this;

        // todo: validate id
        // Sections need an id
        return R('div', null, _.includes(this.props.features, "idField") ? (R(IdFieldComponent, {
          value: this.props.property.id,
          onChange: function onChange(value) {
            return _this.props.onChange(_.extend({}, _this.props.property, {
              id: value
            }));
          }
        }), R(ui.FormGroup, {
          label: "ID"
        }, R('input', {
          type: "text",
          className: "form-control",
          value: this.props.property.id,
          onChange: function onChange(ev) {
            return _this.props.onChange(_.extend({}, _this.props.property, {
              id: ev.target.value
            }));
          }
        }), R('p', {
          className: "help-block"
        }, "Letters lowercase, numbers and _ only. No spaces or uppercase"))) : void 0, _.includes(this.props.features, "code") ? R(ui.FormGroup, {
          label: "Code"
        }, R('input', {
          type: "text",
          className: "form-control",
          value: this.props.property.code,
          onChange: function onChange(ev) {
            return _this.props.onChange(_.extend({}, _this.props.property, {
              code: ev.target.value
            }));
          }
        })) : void 0, R(ui.FormGroup, {
          label: "Name"
        }, R(LocalizedStringEditorComp, {
          value: this.props.property.name,
          onChange: function onChange(value) {
            return _this.props.onChange(_.extend({}, _this.props.property, {
              name: value
            }));
          }
        })), R(ui.FormGroup, {
          label: "Description"
        }, R(LocalizedStringEditorComp, {
          value: this.props.property.desc,
          onChange: function onChange(value) {
            return _this.props.onChange(_.extend({}, _this.props.property, {
              desc: value
            }));
          }
        })));
      }
    }]);
    return SectionEditorComponent;
  }(React.Component);

  ;
  SectionEditorComponent.propTypes = {
    property: PropTypes.object.isRequired,
    // The property being edited
    onChange: PropTypes.func.isRequired,
    // Function called when anything is changed in the editor
    features: PropTypes.array // Features to be enabled apart from the default features

  };
  SectionEditorComponent.defaultProps = {
    features: []
  };
  return SectionEditorComponent;
}.call(void 0);