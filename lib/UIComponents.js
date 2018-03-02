var ButtonToggleComponent, H, LinkComponent, OptionComponent, OptionListComponent, PropTypes, R, React, ReactDOM, SectionComponent, SwitchViewComponent, ToggleEditComponent, motion,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

PropTypes = require('prop-types');

React = require('react');

ReactDOM = require('react-dom');

H = React.DOM;

R = React.createElement;

motion = require('react-motion');

LinkComponent = require('./LinkComponent');

// Miscellaneous ui components

// Section with a title and icon
exports.SectionComponent = SectionComponent = (function() {
  class SectionComponent extends React.Component {
    render() {
      return H.div({
        style: {
          marginBottom: 15
        }
      }, H.label({
        className: "text-muted"
      }, H.span({
        className: `glyphicon glyphicon-${this.props.icon}`
      }), " ", this.props.label), H.div({
        style: {
          marginLeft: 10
        }
      }, this.props.children));
    }

  };

  SectionComponent.propTypes = {
    icon: PropTypes.string,
    label: PropTypes.node
  };

  return SectionComponent;

}).call(this);

// List of options with a name and description each
exports.OptionListComponent = OptionListComponent = (function() {
  class OptionListComponent extends React.Component {
    render() {
      return H.div(null, H.div({
        style: {
          color: "#AAA",
          fontStyle: "italic"
        },
        key: "hint"
      }, this.props.hint), H.div({
        className: "mwater-visualization-big-options",
        key: "options"
      }, _.map(this.props.items, (item) => {
        return R(OptionComponent, {
          name: item.name,
          desc: item.desc,
          onClick: item.onClick,
          key: item.name
        });
      })));
    }

  };

  OptionListComponent.propTypes = {
    items: PropTypes.array.isRequired, // name, desc, onClick
    hint: PropTypes.string
  };

  return OptionListComponent;

}).call(this);

OptionComponent = (function() {
  // Single option
  class OptionComponent extends React.Component {
    render() {
      return H.div({
        className: "mwater-visualization-big-option",
        onClick: this.props.onClick
      }, H.div({
        style: {
          fontWeight: "bold"
        }
      }, this.props.name), H.div({
        style: {
          color: "#888"
        }
      }, this.props.desc));
    }

  };

  OptionComponent.propTypes = {
    name: PropTypes.string,
    desc: PropTypes.string,
    onClick: PropTypes.func.isRequired
  };

  return OptionComponent;

}).call(this);

// Switches views smoothly
exports.SwitchViewComponent = SwitchViewComponent = (function() {
  class SwitchViewComponent extends React.Component {
    constructor(props) {
      super(props);
      // Save components
      this.refCallback = this.refCallback.bind(this);
      this.state = {
        measuring: false
      };
    }

    componentWillReceiveProps(nextProps) {
      // If view changes, measure all components
      if (nextProps.viewId !== this.props.viewId) {
        return this.setState({
          measuring: true
        });
      }
    }

    refCallback(id, comp) {
      boundMethodCheck(this, SwitchViewComponent);
      this.comps = this.comps || {};
      return this.comps[id] = comp;
    }

    componentDidUpdate(prevProps, prevState) {
      var id, j, len, ref;
      // If measuring, get the heights to interpolate
      if (this.state.measuring) {
        this.heights = {};
        ref = _.keys(this.props.views);
        // Get heights
        for (j = 0, len = ref.length; j < len; j++) {
          id = ref[j];
          this.heights[id] = ReactDOM.findDOMNode(this.comps[id]).clientHeight;
        }
        return this.setState({
          measuring: false
        });
      }
    }

    render() {
      var id, ref, style, view;
      // Create the style object that has the opacity for each view
      style = {};
      ref = this.props.views;
      for (id in ref) {
        view = ref[id];
        style[id] = motion.spring(id === this.props.viewId ? 1 : 0);
      }
      return R(motion.Motion, {
        style: style
      }, (style) => {
        var height, val;
        // If measuring, display all positioned at top
        if (this.state.measuring) {
          return H.div({
            style: {
              position: "relative"
            }
          }, _.map(_.keys(this.props.views), (v) => {
            return H.div({
              style: {
                position: "absolute",
                top: 0,
                opacity: style[v]
              },
              ref: this.refCallback.bind(null, v),
              key: v
            }, this.props.views[v]);
          }));
        }
        // If transitioning
        if (style[this.props.viewId] !== 1) {
          // Calculate interpolated height
          height = 0;
          for (id in style) {
            val = style[id];
            height += val * this.heights[id];
          }
          return H.div({
            style: {
              position: "relative",
              height: height
            }
          }, _.map(_.keys(this.props.views), (v) => {
            return H.div({
              style: {
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                opacity: style[v]
              },
              key: v
            }, this.props.views[v]);
          }));
        }
        // Just display (but wrapped to keep same component)
        return H.div(null, H.div({
          key: this.props.viewId
        }, this.props.views[this.props.viewId]));
      });
    }

  };

  SwitchViewComponent.propTypes = {
    views: PropTypes.object.isRequired, // Map of view id to view element
    viewId: PropTypes.string.isRequired // Current view id to display
  };

  return SwitchViewComponent;

}).call(this);

// Shows as editable link that can be clicked to open 
// Editor can be node or can be function that takes onClose function as first parameter
exports.ToggleEditComponent = ToggleEditComponent = (function() {
  class ToggleEditComponent extends React.Component {
    constructor(props) {
      super(props);
      this.close = this.close.bind(this);
      this.open = this.open.bind(this);
      this.handleToggle = this.handleToggle.bind(this);
      // Save editor comp
      this.editorRef = this.editorRef.bind(this);
      this.state = {
        open: props.initiallyOpen || false
      };
    }

    close() {
      boundMethodCheck(this, ToggleEditComponent);
      // Save height of editor
      if (this.editorComp) {
        this.editorHeight = ReactDOM.findDOMNode(this.editorComp).clientHeight;
      }
      return this.setState({
        open: false
      });
    }

    open() {
      boundMethodCheck(this, ToggleEditComponent);
      return this.setState({
        open: true
      });
    }

    handleToggle() {
      boundMethodCheck(this, ToggleEditComponent);
      return this.setState({
        open: !this.state.open
      });
    }

    editorRef(editorComp) {
      boundMethodCheck(this, ToggleEditComponent);
      return this.editorComp = editorComp;
    }

    render() {
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

  };

  ToggleEditComponent.propTypes = {
    forceOpen: PropTypes.bool,
    initiallyOpen: PropTypes.bool,
    label: PropTypes.node.isRequired,
    editor: PropTypes.any.isRequired,
    onRemove: PropTypes.func
  };

  return ToggleEditComponent;

}).call(this);

// Switch between several values as a series of radio buttons
exports.ButtonToggleComponent = ButtonToggleComponent = (function() {
  class ButtonToggleComponent extends React.Component {
    render() {
      return H.div({
        className: "btn-group btn-group-xs"
      }, _.map(this.props.options, (option, i) => {
        return H.button({
          type: "button",
          className: (option.value === this.props.value ? "btn btn-primary active" : "btn btn-default"),
          onClick: this.props.onChange.bind(null, option.value)
        }, option.label);
      }));
    }

  };

  ButtonToggleComponent.propTypes = {
    value: PropTypes.any,
    options: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.node.isRequired,
      value: PropTypes.any
    })).isRequired, // List of layers
    onChange: PropTypes.func.isRequired // Called with value
  };

  return ButtonToggleComponent;

}).call(this);
