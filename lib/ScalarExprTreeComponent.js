var H, React, ReactDOM, ScalarExprTreeComponent, ScalarExprTreeLeafComponent, ScalarExprTreeNodeComponent, ScalarExprTreeTreeComponent,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

React = require('react');

ReactDOM = require('react-dom');

H = React.DOM;

module.exports = ScalarExprTreeComponent = (function(superClass) {
  extend(ScalarExprTreeComponent, superClass);

  function ScalarExprTreeComponent() {
    return ScalarExprTreeComponent.__super__.constructor.apply(this, arguments);
  }

  ScalarExprTreeComponent.propTypes = {
    tree: React.PropTypes.array.isRequired,
    onChange: React.PropTypes.func.isRequired,
    height: React.PropTypes.number.isRequired
  };

  ScalarExprTreeComponent.prototype.render = function() {
    return H.div({
      style: {
        overflowY: "auto",
        height: this.props.height
      }
    }, React.createElement(ScalarExprTreeTreeComponent, {
      tree: this.props.tree,
      onChange: this.props.onChange,
      frame: this
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
    tree: React.PropTypes.array.isRequired,
    onChange: React.PropTypes.func.isRequired
  };

  ScalarExprTreeTreeComponent.prototype.render = function() {
    var elems, i, item, j, len, ref;
    elems = [];
    ref = this.props.tree;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      item = ref[i];
      if (item.children) {
        elems.push(React.createElement(ScalarExprTreeNodeComponent, {
          key: item.name + ("(" + i + ")"),
          item: item,
          onChange: this.props.onChange
        }));
      } else {
        elems.push(React.createElement(ScalarExprTreeLeafComponent, {
          key: item.name + ("(" + i + ")"),
          item: item,
          onChange: this.props.onChange
        }));
      }
    }
    return H.div(null, elems);
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
    item: React.PropTypes.object.isRequired
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
    return H.div({
      style: style,
      className: "hover-grey-background",
      onClick: this.handleClick
    }, this.props.item.name, this.props.item.desc ? [
      H.br(), H.span({
        className: "text-muted",
        style: {
          fontSize: 12,
          paddingLeft: 3
        }
      }, this.props.item.desc)
    ] : void 0);
  };

  return ScalarExprTreeLeafComponent;

})(React.Component);

ScalarExprTreeNodeComponent = (function(superClass) {
  extend(ScalarExprTreeNodeComponent, superClass);

  ScalarExprTreeNodeComponent.propTypes = {
    item: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired
  };

  function ScalarExprTreeNodeComponent(props) {
    this.handleItemClick = bind(this.handleItemClick, this);
    this.handleArrowClick = bind(this.handleArrowClick, this);
    ScalarExprTreeNodeComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      collapse: this.props.item.initiallyOpen ? "open" : "closed"
    };
  }

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
    var arrow, children, color;
    arrow = null;
    if (this.state.collapse === "closed") {
      arrow = H.span({
        className: "glyphicon glyphicon-triangle-right scalar-arrow"
      });
    } else if (this.state.collapse === "open") {
      arrow = H.span({
        className: "glyphicon glyphicon-triangle-bottom scalar-arrow"
      });
    }
    if (this.state.collapse === "open") {
      children = H.div({
        style: {
          paddingLeft: 25
        },
        key: "tree"
      }, React.createElement(ScalarExprTreeTreeComponent, {
        tree: this.props.item.children(),
        onChange: this.props.onChange
      }));
    }
    color = this.props.item.value ? "#478" : void 0;
    return H.div(null, H.div({
      style: {
        cursor: "pointer",
        padding: 4
      },
      key: "arrow"
    }, H.span({
      style: {
        color: "#AAA",
        cursor: "pointer",
        paddingRight: 3
      },
      onClick: this.handleArrowClick
    }, arrow), H.span({
      style: {
        color: color
      },
      onClick: this.handleItemClick
    }, this.props.item.name), this.props.item.desc ? [
      H.br(), H.span({
        className: "text-muted",
        style: {
          fontSize: 12,
          paddingLeft: 3
        }
      }, this.props.item.desc)
    ] : void 0), children);
  };

  return ScalarExprTreeNodeComponent;

})(React.Component);
