"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var ButtonToggleComponent,
    LinkComponent,
    OptionComponent,
    OptionListComponent,
    PropTypes,
    R,
    React,
    ReactDOM,
    SectionComponent,
    SwitchViewComponent,
    ToggleEditComponent,
    _,
    motion,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

_ = require('lodash');
PropTypes = require('prop-types');
React = require('react');
ReactDOM = require('react-dom');
R = React.createElement;
motion = require('react-motion');
LinkComponent = require('./LinkComponent'); // Miscellaneous ui components
// Section with a title and icon

exports.SectionComponent = SectionComponent = function () {
  var SectionComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(SectionComponent, _React$Component);

    var _super = _createSuper(SectionComponent);

    function SectionComponent() {
      (0, _classCallCheck2["default"])(this, SectionComponent);
      return _super.apply(this, arguments);
    }

    (0, _createClass2["default"])(SectionComponent, [{
      key: "render",
      value: function render() {
        return R('div', {
          style: {
            marginBottom: 15
          }
        }, R('label', {
          className: "text-muted"
        }, R('span', {
          className: "glyphicon glyphicon-".concat(this.props.icon)
        }), " ", this.props.label), R('div', {
          style: {
            marginLeft: 10
          }
        }, this.props.children));
      }
    }]);
    return SectionComponent;
  }(React.Component);

  ;
  SectionComponent.propTypes = {
    icon: PropTypes.string,
    label: PropTypes.node
  };
  return SectionComponent;
}.call(void 0); // List of options with a name and description each


exports.OptionListComponent = OptionListComponent = function () {
  var OptionListComponent = /*#__PURE__*/function (_React$Component2) {
    (0, _inherits2["default"])(OptionListComponent, _React$Component2);

    var _super2 = _createSuper(OptionListComponent);

    function OptionListComponent() {
      (0, _classCallCheck2["default"])(this, OptionListComponent);
      return _super2.apply(this, arguments);
    }

    (0, _createClass2["default"])(OptionListComponent, [{
      key: "render",
      value: function render() {
        return R('div', null, R('div', {
          style: {
            color: "#AAA",
            fontStyle: "italic"
          },
          key: "hint"
        }, this.props.hint), R('div', {
          className: "mwater-visualization-big-options",
          key: "options"
        }, _.map(this.props.items, function (item) {
          return R(OptionComponent, {
            name: item.name,
            desc: item.desc,
            onClick: item.onClick,
            key: item.name
          });
        })));
      }
    }]);
    return OptionListComponent;
  }(React.Component);

  ;
  OptionListComponent.propTypes = {
    items: PropTypes.array.isRequired,
    // name, desc, onClick
    hint: PropTypes.string
  };
  return OptionListComponent;
}.call(void 0);

OptionComponent = function () {
  // Single option
  var OptionComponent = /*#__PURE__*/function (_React$Component3) {
    (0, _inherits2["default"])(OptionComponent, _React$Component3);

    var _super3 = _createSuper(OptionComponent);

    function OptionComponent() {
      (0, _classCallCheck2["default"])(this, OptionComponent);
      return _super3.apply(this, arguments);
    }

    (0, _createClass2["default"])(OptionComponent, [{
      key: "render",
      value: function render() {
        return R('div', {
          className: "mwater-visualization-big-option",
          onClick: this.props.onClick
        }, R('div', {
          style: {
            fontWeight: "bold"
          }
        }, this.props.name), R('div', {
          style: {
            color: "#888"
          }
        }, this.props.desc));
      }
    }]);
    return OptionComponent;
  }(React.Component);

  ;
  OptionComponent.propTypes = {
    name: PropTypes.string,
    desc: PropTypes.string,
    onClick: PropTypes.func.isRequired
  };
  return OptionComponent;
}.call(void 0); // Switches views smoothly


exports.SwitchViewComponent = SwitchViewComponent = function () {
  var SwitchViewComponent = /*#__PURE__*/function (_React$Component4) {
    (0, _inherits2["default"])(SwitchViewComponent, _React$Component4);

    var _super4 = _createSuper(SwitchViewComponent);

    function SwitchViewComponent(props) {
      var _this;

      (0, _classCallCheck2["default"])(this, SwitchViewComponent);
      _this = _super4.call(this, props); // Save components

      _this.refCallback = _this.refCallback.bind((0, _assertThisInitialized2["default"])(_this));
      _this.state = {
        measuring: false
      };
      return _this;
    }

    (0, _createClass2["default"])(SwitchViewComponent, [{
      key: "componentWillReceiveProps",
      value: function componentWillReceiveProps(nextProps) {
        // If view changes, measure all components
        if (nextProps.viewId !== this.props.viewId) {
          return this.setState({
            measuring: true
          });
        }
      }
    }, {
      key: "refCallback",
      value: function refCallback(id, comp) {
        boundMethodCheck(this, SwitchViewComponent);
        this.comps = this.comps || {};
        return this.comps[id] = comp;
      }
    }, {
      key: "componentDidUpdate",
      value: function componentDidUpdate(prevProps, prevState) {
        var id, j, len, ref; // If measuring, get the heights to interpolate

        if (this.state.measuring) {
          this.heights = {};
          ref = _.keys(this.props.views); // Get heights

          for (j = 0, len = ref.length; j < len; j++) {
            id = ref[j];
            this.heights[id] = ReactDOM.findDOMNode(this.comps[id]).clientHeight;
          }

          return this.setState({
            measuring: false
          });
        }
      }
    }, {
      key: "render",
      value: function render() {
        var _this2 = this;

        var id, ref, style, view; // Create the style object that has the opacity for each view

        style = {};
        ref = this.props.views;

        for (id in ref) {
          view = ref[id];
          style[id] = motion.spring(id === this.props.viewId ? 1 : 0);
        }

        return R(motion.Motion, {
          style: style
        }, function (style) {
          var height, val; // If measuring, display all positioned at top

          if (_this2.state.measuring) {
            return R('div', {
              style: {
                position: "relative"
              }
            }, _.map(_.keys(_this2.props.views), function (v) {
              return R('div', {
                style: {
                  position: "absolute",
                  top: 0,
                  opacity: style[v]
                },
                ref: _this2.refCallback.bind(null, v),
                key: v
              }, _this2.props.views[v]);
            }));
          } // If transitioning


          if (style[_this2.props.viewId] !== 1) {
            // Calculate interpolated height
            height = 0;

            for (id in style) {
              val = style[id];
              height += val * _this2.heights[id];
            }

            return R('div', {
              style: {
                position: "relative",
                height: height
              }
            }, _.map(_.keys(_this2.props.views), function (v) {
              return R('div', {
                style: {
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  opacity: style[v]
                },
                key: v
              }, _this2.props.views[v]);
            }));
          } // Just display (but wrapped to keep same component)


          return R('div', null, R('div', {
            key: _this2.props.viewId
          }, _this2.props.views[_this2.props.viewId]));
        });
      }
    }]);
    return SwitchViewComponent;
  }(React.Component);

  ;
  SwitchViewComponent.propTypes = {
    views: PropTypes.object.isRequired,
    // Map of view id to view element
    viewId: PropTypes.string.isRequired // Current view id to display

  };
  return SwitchViewComponent;
}.call(void 0); // Shows as editable link that can be clicked to open 
// Editor can be node or can be function that takes onClose function as first parameter


exports.ToggleEditComponent = ToggleEditComponent = function () {
  var ToggleEditComponent = /*#__PURE__*/function (_React$Component5) {
    (0, _inherits2["default"])(ToggleEditComponent, _React$Component5);

    var _super5 = _createSuper(ToggleEditComponent);

    function ToggleEditComponent(props) {
      var _this3;

      (0, _classCallCheck2["default"])(this, ToggleEditComponent);
      _this3 = _super5.call(this, props);
      _this3.close = _this3.close.bind((0, _assertThisInitialized2["default"])(_this3));
      _this3.open = _this3.open.bind((0, _assertThisInitialized2["default"])(_this3));
      _this3.handleToggle = _this3.handleToggle.bind((0, _assertThisInitialized2["default"])(_this3)); // Save editor comp

      _this3.editorRef = _this3.editorRef.bind((0, _assertThisInitialized2["default"])(_this3));
      _this3.state = {
        open: props.initiallyOpen || false
      };
      return _this3;
    }

    (0, _createClass2["default"])(ToggleEditComponent, [{
      key: "close",
      value: function close() {
        boundMethodCheck(this, ToggleEditComponent); // Save height of editor

        if (this.editorComp) {
          this.editorHeight = ReactDOM.findDOMNode(this.editorComp).clientHeight;
        }

        return this.setState({
          open: false
        });
      }
    }, {
      key: "open",
      value: function open() {
        boundMethodCheck(this, ToggleEditComponent);
        return this.setState({
          open: true
        });
      }
    }, {
      key: "handleToggle",
      value: function handleToggle() {
        boundMethodCheck(this, ToggleEditComponent);
        return this.setState({
          open: !this.state.open
        });
      }
    }, {
      key: "editorRef",
      value: function editorRef(editorComp) {
        boundMethodCheck(this, ToggleEditComponent);
        return this.editorComp = editorComp;
      }
    }, {
      key: "render",
      value: function render() {
        var editor, isOpen, link;
        editor = this.props.editor;

        if (_.isFunction(editor)) {
          editor = editor(this.close);
        }

        link = R(LinkComponent, {
          onClick: this.open,
          onRemove: this.props.onRemove
        }, this.props.label);
        isOpen = this.state.open || this.props.forceOpen;
        return R(SwitchViewComponent, {
          views: {
            editor: editor,
            link: link
          },
          viewId: isOpen ? "editor" : "link"
        });
      }
    }]);
    return ToggleEditComponent;
  }(React.Component);

  ;
  ToggleEditComponent.propTypes = {
    forceOpen: PropTypes.bool,
    initiallyOpen: PropTypes.bool,
    label: PropTypes.node.isRequired,
    editor: PropTypes.any.isRequired,
    onRemove: PropTypes.func
  };
  return ToggleEditComponent;
}.call(void 0); // Switch between several values as a series of radio buttons


exports.ButtonToggleComponent = ButtonToggleComponent = function () {
  var ButtonToggleComponent = /*#__PURE__*/function (_React$Component6) {
    (0, _inherits2["default"])(ButtonToggleComponent, _React$Component6);

    var _super6 = _createSuper(ButtonToggleComponent);

    function ButtonToggleComponent() {
      (0, _classCallCheck2["default"])(this, ButtonToggleComponent);
      return _super6.apply(this, arguments);
    }

    (0, _createClass2["default"])(ButtonToggleComponent, [{
      key: "render",
      value: function render() {
        var _this4 = this;

        return R('div', {
          className: "btn-group btn-group-xs"
        }, _.map(this.props.options, function (option, i) {
          return R('button', {
            type: "button",
            className: option.value === _this4.props.value ? "btn btn-primary active" : "btn btn-default",
            onClick: _this4.props.onChange.bind(null, option.value)
          }, option.label);
        }));
      }
    }]);
    return ButtonToggleComponent;
  }(React.Component);

  ;
  ButtonToggleComponent.propTypes = {
    value: PropTypes.any,
    options: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.node.isRequired,
      value: PropTypes.any
    })).isRequired,
    // List of layers
    onChange: PropTypes.func.isRequired // Called with value

  };
  return ButtonToggleComponent;
}.call(void 0);