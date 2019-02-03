var PropTypes, R, React, ReactDOM, ScalarExprTreeComponent, ScalarExprTreeLeafComponent, ScalarExprTreeNodeComponent, ScalarExprTreeTreeComponent, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

_ = require('lodash');

PropTypes = require('prop-types');

React = require('react');

ReactDOM = require('react-dom');

R = React.createElement;

module.exports = ScalarExprTreeComponent = (function(superClass) {
  extend(ScalarExprTreeComponent, superClass);

  function ScalarExprTreeComponent() {
    return ScalarExprTreeComponent.__super__.constructor.apply(this, arguments);
  }

  ScalarExprTreeComponent.propTypes = {
    tree: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    height: PropTypes.number,
    filter: PropTypes.string
  };

  ScalarExprTreeComponent.prototype.render = function() {
    return R('div', {
      style: {
        overflowY: (this.props.height ? "auto" : void 0),
        height: this.props.height
      }
    }, R(ScalarExprTreeTreeComponent, {
      tree: this.props.tree,
      onChange: this.props.onChange,
      filter: this.props.filter
    }));
  };

  return ScalarExprTreeComponent;

})(React.Component);

ScalarExprTreeTreeComponent = (function(superClass) {
  extend(ScalarExprTreeTreeComponent, superClass);

  function ScalarExprTreeTreeComponent() {
    return ScalarExprTreeTreeComponent.__super__.constructor.apply(this, arguments);
  }

  ScalarExprTreeTreeComponent.propTypes = {
    tree: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    prefix: PropTypes.string,
    filter: PropTypes.string
  };

  ScalarExprTreeTreeComponent.prototype.render = function() {
    var elems, i, item, j, len, ref;
    elems = [];
    ref = this.props.tree;
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
    return R('div', null, elems);
  };

  return ScalarExprTreeTreeComponent;

})(React.Component);

ScalarExprTreeLeafComponent = (function(superClass) {
  extend(ScalarExprTreeLeafComponent, superClass);

  function ScalarExprTreeLeafComponent() {
    this.handleClick = bind(this.handleClick, this);
    return ScalarExprTreeLeafComponent.__super__.constructor.apply(this, arguments);
  }

  ScalarExprTreeLeafComponent.propTypes = {
    item: PropTypes.object.isRequired,
    prefix: PropTypes.string
  };

  ScalarExprTreeLeafComponent.prototype.handleClick = function() {
    return this.props.onChange(this.props.item.value);
  };

  ScalarExprTreeLeafComponent.prototype.render = function() {
    var style;
    style = {
      padding: 4,
      borderRadius: 4,
      cursor: "pointer",
      color: "#478"
    };
    return R('div', {
      style: style,
      className: "hover-grey-background",
      onClick: this.handleClick
    }, this.props.prefix ? R('span', {
      className: "text-muted"
    }, this.props.prefix) : void 0, this.props.item.name, this.props.item.desc ? R('span', {
      className: "text-muted",
      style: {
        fontSize: 12,
        paddingLeft: 3
      }
    }, " - " + this.props.item.desc) : void 0);
  };

  return ScalarExprTreeLeafComponent;

})(React.Component);

ScalarExprTreeNodeComponent = (function(superClass) {
  extend(ScalarExprTreeNodeComponent, superClass);

  ScalarExprTreeNodeComponent.propTypes = {
    item: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    filter: PropTypes.text
  };

  ScalarExprTreeNodeComponent.contextTypes = {
    decorateScalarExprTreeSectionChildren: PropTypes.func
  };

  function ScalarExprTreeNodeComponent(props) {
    this.handleItemClick = bind(this.handleItemClick, this);
    this.handleArrowClick = bind(this.handleArrowClick, this);
    ScalarExprTreeNodeComponent.__super__.constructor.call(this, props);
    this.state = {
      collapse: this.props.item.initiallyOpen ? "open" : "closed"
    };
  }

  ScalarExprTreeNodeComponent.prototype.componentWillReceiveProps = function(nextProps) {
    if (nextProps.item.initiallyOpen !== this.props.item.initiallyOpen) {
      return this.setState({
        collapse: nextProps.item.initiallyOpen ? "open" : "closed"
      });
    }
  };

  ScalarExprTreeNodeComponent.prototype.handleArrowClick = function() {
    if (this.state.collapse === "open") {
      return this.setState({
        collapse: "closed"
      });
    } else if (this.state.collapse === "closed") {
      return this.setState({
        collapse: "open"
      });
    }
  };

  ScalarExprTreeNodeComponent.prototype.handleItemClick = function() {
    if (!this.props.item.value) {
      return this.handleArrowClick();
    } else {
      return this.props.onChange(this.props.item.value);
    }
  };

  ScalarExprTreeNodeComponent.prototype.render = function() {
    var arrow, childItems, children, color, prefix;
    arrow = null;
    if (this.state.collapse === "closed") {
      arrow = R('i', {
        className: "fa fa-plus-square-o",
        style: {
          width: 15
        }
      });
    } else if (this.state.collapse === "open") {
      arrow = R('i', {
        className: "fa fa-minus-square-o",
        style: {
          width: 15
        }
      });
    }
    if (this.state.collapse === "open") {
      prefix = this.props.prefix || "";
      if (this.props.item.item.type === "join") {
        prefix = prefix + this.props.item.name + " > ";
      }
      childItems = this.props.item.children();
      children = _.map(childItems, (function(_this) {
        return function(item) {
          if (item.children) {
            return R(ScalarExprTreeNodeComponent, {
              key: item.key,
              item: item,
              prefix: prefix,
              onChange: _this.props.onChange,
              filter: _this.props.filter
            });
          } else {
            return R(ScalarExprTreeLeafComponent, {
              key: item.key,
              item: item,
              prefix: prefix,
              onChange: _this.props.onChange
            });
          }
        };
      })(this));
      if (this.context.decorateScalarExprTreeSectionChildren && this.props.item.item.type === "section") {
        children = this.context.decorateScalarExprTreeSectionChildren({
          children: children,
          tableId: this.props.item.tableId,
          section: this.props.item.item,
          filter: this.props.filter
        });
      }
      children = R('div', {
        style: {
          paddingLeft: 18
        },
        key: "tree"
      }, children);
    }
    color = this.props.item.value ? "#478" : void 0;
    return R('div', null, R('div', {
      style: {
        cursor: "pointer",
        padding: 4,
        marginLeft: 20,
        position: "relative"
      },
      key: "item",
      className: (this.props.item.value ? "hover-grey-background" : void 0)
    }, R('span', {
      style: {
        color: "#478",
        cursor: "pointer",
        position: "absolute",
        left: -15
      },
      onClick: this.handleArrowClick
    }, arrow), R('div', {
      style: {
        color: color,
        display: "inline-block"
      },
      onClick: this.handleItemClick
    }, this.props.prefix ? R('span', {
      className: "text-muted"
    }, this.props.prefix) : void 0, this.props.item.name, this.props.item.desc ? R('span', {
      className: "text-muted",
      style: {
        fontSize: 12,
        paddingLeft: 3
      }
    }, " - " + this.props.item.desc) : void 0)), children);
  };

  return ScalarExprTreeNodeComponent;

})(React.Component);
