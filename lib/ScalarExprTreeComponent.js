var H, PropTypes, R, React, ReactDOM, ScalarExprTreeComponent, ScalarExprTreeLeafComponent, ScalarExprTreeNodeComponent, ScalarExprTreeTreeComponent,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

PropTypes = require('prop-types');

React = require('react');

ReactDOM = require('react-dom');

H = React.DOM;

R = React.createElement;

// Shows a tree that selects table + joins + expr of a scalar expression
// Supports some React context properties for special. See individual classes
module.exports = ScalarExprTreeComponent = (function() {
  class ScalarExprTreeComponent extends React.Component {
    render() {
      return H.div({
        style: {
          overflowY: (this.props.height ? "auto" : void 0),
          height: this.props.height
        }
      }, R(ScalarExprTreeTreeComponent, {
        tree: this.props.tree,
        onChange: this.props.onChange,
        filter: this.props.filter
      }));
    }

  };

  ScalarExprTreeComponent.propTypes = {
    tree: PropTypes.array.isRequired, // Tree from ScalarExprTreeBuilder
    onChange: PropTypes.func.isRequired, // Called with newly selected value
    height: PropTypes.number, // Render height of the component
    filter: PropTypes.text // Optional string filter 
  };

  return ScalarExprTreeComponent;

}).call(this);

ScalarExprTreeTreeComponent = (function() {
  class ScalarExprTreeTreeComponent extends React.Component {
    render() {
      var elems, i, item, j, len, ref;
      elems = [];
      ref = this.props.tree;
      // Get tree
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        item = ref[i];
        if (item.children) {
          elems.push(R(ScalarExprTreeNodeComponent, {
            key: item.key,
            item: item,
            prefix: this.props.prefix,
            onChange: this.props.onChange,
            filter: this.props.filter
          }));
        } else {
          elems.push(R(ScalarExprTreeLeafComponent, {
            key: item.key,
            item: item,
            prefix: this.props.prefix,
            onChange: this.props.onChange
          }));
        }
      }
      return H.div(null, elems);
    }

  };

  ScalarExprTreeTreeComponent.propTypes = {
    tree: PropTypes.array.isRequired, // Tree from ScalarExprTreeBuilder
    onChange: PropTypes.func.isRequired, // Called with newly selected value
    prefix: PropTypes.string, // String to prefix names with
    filter: PropTypes.text // Optional string filter 
  };

  return ScalarExprTreeTreeComponent;

}).call(this);

ScalarExprTreeLeafComponent = (function() {
  class ScalarExprTreeLeafComponent extends React.Component {
    constructor() {
      super(...arguments);
      this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
      boundMethodCheck(this, ScalarExprTreeLeafComponent);
      return this.props.onChange(this.props.item.value);
    }

    render() {
      var style;
      style = {
        padding: 4,
        borderRadius: 4,
        cursor: "pointer",
        color: "#478"
      };
      return H.div({
        style: style,
        className: "hover-grey-background",
        onClick: this.handleClick
      }, this.props.prefix ? H.span({
        className: "text-muted"
      }, this.props.prefix) : void 0, this.props.item.name, this.props.item.desc ? H.span({
        className: "text-muted",
        style: {
          fontSize: 12,
          paddingLeft: 3
        }
      }, " - " + this.props.item.desc) : void 0);
    }

  };

  ScalarExprTreeLeafComponent.propTypes = {
    item: PropTypes.object.isRequired, // Contains item "name" and "value"
    prefix: PropTypes.string // String to prefix names with
  };

  return ScalarExprTreeLeafComponent;

}).call(this);

ScalarExprTreeNodeComponent = (function() {
  class ScalarExprTreeNodeComponent extends React.Component {
    constructor(props) {
      super(props);
      this.handleArrowClick = this.handleArrowClick.bind(this);
      this.handleItemClick = this.handleItemClick.bind(this);
      this.state = {
        collapse: this.props.item.initiallyOpen ? "open" : "closed"
      };
    }

    componentWillReceiveProps(nextProps) {
      // If initially open changed, then update collapse
      if (nextProps.item.initiallyOpen !== this.props.item.initiallyOpen) {
        return this.setState({
          collapse: nextProps.item.initiallyOpen ? "open" : "closed"
        });
      }
    }

    handleArrowClick() {
      boundMethodCheck(this, ScalarExprTreeNodeComponent);
      if (this.state.collapse === "open") {
        return this.setState({
          collapse: "closed"
        });
      } else if (this.state.collapse === "closed") {
        return this.setState({
          collapse: "open"
        });
      }
    }

    handleItemClick() {
      boundMethodCheck(this, ScalarExprTreeNodeComponent);
      // If no value, treat as arrow click
      if (!this.props.item.value) {
        return this.handleArrowClick();
      } else {
        return this.props.onChange(this.props.item.value);
      }
    }

    render() {
      var arrow, childItems, children, color, prefix;
      arrow = null;
      if (this.state.collapse === "closed") {
        arrow = H.i({
          className: "fa fa-plus-square-o",
          style: {
            width: 15
          }
        });
      } else if (this.state.collapse === "open") {
        arrow = H.i({
          className: "fa fa-minus-square-o",
          style: {
            width: 15
          }
        });
      }
      if (this.state.collapse === "open") {
        // Compute new prefix, adding when going into joins
        prefix = this.props.prefix || "";
        if (this.props.item.item.type === "join") {
          prefix = prefix + this.props.item.name + " > ";
        }
        // Render child items
        childItems = this.props.item.children();
        children = _.map(childItems, (item) => {
          if (item.children) {
            return R(ScalarExprTreeNodeComponent, {
              key: item.key,
              item: item,
              prefix: prefix,
              onChange: this.props.onChange,
              filter: this.props.filter
            });
          } else {
            return R(ScalarExprTreeLeafComponent, {
              key: item.key,
              item: item,
              prefix: prefix,
              onChange: this.props.onChange
            });
          }
        });
        // Decorate children if section
        if (this.context.decorateScalarExprTreeSectionChildren && this.props.item.item.type === "section") {
          children = this.context.decorateScalarExprTreeSectionChildren({
            children: children,
            tableId: this.props.item.tableId,
            section: this.props.item.item,
            filter: this.props.filter
          });
        }
        // Pad left and give key
        children = H.div({
          style: {
            paddingLeft: 18
          },
          key: "tree"
        }, children);
      }
      color = this.props.item.value ? "#478" : void 0;
      return H.div(null, H.div({
        style: {
          cursor: "pointer",
          padding: 4,
          marginLeft: 20,
          position: "relative"
        },
        key: "item",
        className: (this.props.item.value ? "hover-grey-background" : void 0)
      }, H.span({
        style: {
          color: "#478",
          cursor: "pointer",
          position: "absolute",
          left: -15
        },
        onClick: this.handleArrowClick
      }, arrow), H.div({
        style: {
          color: color,
          display: "inline-block"
        },
        onClick: this.handleItemClick
      }, this.props.prefix ? H.span({
        className: "text-muted"
      // if @props.item.item.type == "join"
      //   H.i className: "fa fa-link", style: { paddingRight: 5, paddingLeft: 5 }
      }, this.props.prefix) : void 0, this.props.item.name, this.props.item.desc ? H.span({
        className: "text-muted",
        style: {
          fontSize: 12,
          paddingLeft: 3
        }
      }, " - " + this.props.item.desc) : void 0)), children);
    }

  };

  ScalarExprTreeNodeComponent.propTypes = {
    item: PropTypes.object.isRequired, // Item to display
    onChange: PropTypes.func.isRequired, // Called when item is selected
    filter: PropTypes.text // Optional string filter 
  };

  ScalarExprTreeNodeComponent.contextTypes = {
    // Function to decorate the children component of a section. Passed { children: React element of children, tableId: id of table, section: section object from schema, filter: optional string filter }
    // Should return decorated element
    decorateScalarExprTreeSectionChildren: PropTypes.func
  };

  return ScalarExprTreeNodeComponent;

}).call(this);
