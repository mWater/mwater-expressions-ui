// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let ButtonToggleComponent, OptionListComponent, SectionComponent, SwitchViewComponent, ToggleEditComponent;
import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
const R = React.createElement;
import motion from 'react-motion';
import LinkComponent from './LinkComponent';

// Miscellaneous ui components

// Section with a title and icon
let _SectionComponent = SectionComponent = (function() {
  SectionComponent = class SectionComponent extends React.Component {
    static initClass() {
      this.propTypes = { 
        icon: PropTypes.string,
        label: PropTypes.node
      };
    }

    render() {
      return R('div', {style: { marginBottom: 15 }}, 
        R('label', {className: "text-muted"}, 
          R('span', {className: `glyphicon glyphicon-${this.props.icon}`}),
          " ",
          this.props.label),
        R('div', {style: { marginLeft: 10 }},
          this.props.children)
      );
    }
  };
  SectionComponent.initClass();
  return SectionComponent;
})();

export { _SectionComponent as SectionComponent };

// List of options with a name and description each
let _OptionListComponent = OptionListComponent = (function() {
  OptionListComponent = class OptionListComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        items: PropTypes.array.isRequired, // name, desc, onClick
        hint: PropTypes.string
      };
    }

    render() {
      return R('div', null,
        R('div', {style: { color: "#AAA", fontStyle: "italic" }, key: "hint"}, this.props.hint),
        R('div', {className: "mwater-visualization-big-options", key: "options"},
          _.map(this.props.items, item => {
            return R(OptionComponent, {name: item.name, desc: item.desc, onClick: item.onClick, key: item.name});
          })
        )
      );
    }
  };
  OptionListComponent.initClass();
  return OptionListComponent;
})();

export { _OptionListComponent as OptionListComponent };

// Single option
class OptionComponent extends React.Component {
  static initClass() {
    this.propTypes = {
      name: PropTypes.string,
      desc: PropTypes.string,
      onClick: PropTypes.func.isRequired
    };
  }

  render() {
    return R('div', {className: "mwater-visualization-big-option", onClick: this.props.onClick},
      R('div', {style: { fontWeight: "bold" }}, this.props.name),
      R('div', {style: { color: "#888" }}, this.props.desc));
  }
}
OptionComponent.initClass();

// Switches views smoothly
let _SwitchViewComponent = SwitchViewComponent = (function() {
  SwitchViewComponent = class SwitchViewComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        views: PropTypes.object.isRequired,  // Map of view id to view element
        viewId: PropTypes.string.isRequired
      };
         // Current view id to display
    }

    constructor(props) {
      super(props);
      this.state = { 
        measuring: false
      };
    }

    componentWillReceiveProps(nextProps) {
      // If view changes, measure all components
      if (nextProps.viewId !== this.props.viewId) {
        return this.setState({measuring: true});
      }
    }

    // Save components
    refCallback = (id, comp) => { 
      this.comps = this.comps || {};
      return this.comps[id] = comp;
    };

    componentDidUpdate(prevProps, prevState) {
      // If measuring, get the heights to interpolate
      if (this.state.measuring) {
        this.heights = {};

        // Get heights
        for (let id of _.keys(this.props.views)) {
          this.heights[id] = ReactDOM.findDOMNode(this.comps[id]).clientHeight;
        }

        return this.setState({measuring: false});
      }
    }

    render() {
      // Create the style object that has the opacity for each view
      let id;
      const style = {};
      for (id in this.props.views) {
        const view = this.props.views[id];
        style[id] = motion.spring(id === this.props.viewId ? 1 : 0);
      }

      return R(motion.Motion,
        {style},
        style => {
          // If measuring, display all positioned at top
          if (this.state.measuring) {
            return R('div', {style: { position: "relative" }},
              _.map(_.keys(this.props.views), v => {
                return R('div', {style: { position: "absolute", top: 0, opacity: style[v] }, ref: this.refCallback.bind(null, v), key: v},
                  this.props.views[v]);
            }));
          }

          // If transitioning
          if (style[this.props.viewId] !== 1) {
            // Calculate interpolated height
            let height = 0;
            for (id in style) {
              const val = style[id];
              height += val * this.heights[id];
            }

            return R('div', {style: { position: "relative", height }},
              _.map(_.keys(this.props.views), v => {
                return R('div', {style: { position: "absolute", top: 0, left: 0, right: 0, opacity: style[v] }, key: v},
                  this.props.views[v]);
            }));
          }

          // Just display (but wrapped to keep same component)
          return R('div', null,
            R('div', {key: this.props.viewId},
              this.props.views[this.props.viewId]));
      });
    }
  };
  SwitchViewComponent.initClass();
  return SwitchViewComponent;
})();

export { _SwitchViewComponent as SwitchViewComponent };

// Shows as editable link that can be clicked to open 
// Editor can be node or can be function that takes onClose function as first parameter
let _ToggleEditComponent = ToggleEditComponent = (function() {
  ToggleEditComponent = class ToggleEditComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        forceOpen: PropTypes.bool,
        initiallyOpen: PropTypes.bool,
        label: PropTypes.node.isRequired,
        editor: PropTypes.any.isRequired,
        onRemove: PropTypes.func
      };
    }

    constructor(props) {
      super(props);
      this.state = { open: props.initiallyOpen || false };
    }

    close = () => {
      // Save height of editor
      if (this.editorComp) {
        this.editorHeight = ReactDOM.findDOMNode(this.editorComp).clientHeight;
      }

      return this.setState({open: false});
    };

    open = () => {
      return this.setState({open: true});
    };

    handleToggle = () => { 
      return this.setState({open: !this.state.open});
    };

    // Save editor comp
    editorRef = editorComp => { return this.editorComp = editorComp; };

    render() {
      let {
        editor
      } = this.props;
      if (_.isFunction(editor)) {
        editor = editor(this.close);
      }

      const link = R(LinkComponent, {onClick: this.open, onRemove: this.props.onRemove}, this.props.label);
    
      const isOpen = this.state.open || this.props.forceOpen;

      return R(SwitchViewComponent, {
        views: { editor, link },
        viewId: isOpen ? "editor" : "link"
      }
      );
    }
  };
  ToggleEditComponent.initClass();
  return ToggleEditComponent;
})();

export { _ToggleEditComponent as ToggleEditComponent };

// Switch between several values as a series of radio buttons
let _ButtonToggleComponent = ButtonToggleComponent = (function() {
  ButtonToggleComponent = class ButtonToggleComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        value: PropTypes.any,
        options: PropTypes.arrayOf(PropTypes.shape({
          label: PropTypes.node.isRequired,
          value: PropTypes.any
          })).isRequired, // List of layers
        onChange: PropTypes.func.isRequired
      };
       // Called with value
    }

    render() {
      return R('div', {className: "btn-group btn-group-xs"},
        _.map(this.props.options, (option, i) => {
          return R('button', {type: "button", className: (option.value === this.props.value ? "btn btn-primary active" : "btn btn-default"), onClick: this.props.onChange.bind(null, option.value)},
            option.label);
        })
      );
    }
  };
  ButtonToggleComponent.initClass();
  return ButtonToggleComponent;
})();

export { _ButtonToggleComponent as ButtonToggleComponent };
