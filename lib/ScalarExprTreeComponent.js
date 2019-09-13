"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var PropTypes,
    R,
    React,
    ReactDOM,
    ScalarExprTreeComponent,
    ScalarExprTreeLeafComponent,
    ScalarExprTreeNodeComponent,
    ScalarExprTreeTreeComponent,
    _,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

_ = require('lodash');
PropTypes = require('prop-types');
React = require('react');
ReactDOM = require('react-dom');
R = React.createElement; // Shows a tree that selects table + joins + expr of a scalar expression
// Supports some React context properties for special. See individual classes

module.exports = ScalarExprTreeComponent = function () {
  var ScalarExprTreeComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2.default)(ScalarExprTreeComponent, _React$Component);

    function ScalarExprTreeComponent() {
      (0, _classCallCheck2.default)(this, ScalarExprTreeComponent);
      return (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(ScalarExprTreeComponent).apply(this, arguments));
    }

    (0, _createClass2.default)(ScalarExprTreeComponent, [{
      key: "render",
      value: function render() {
        return R('div', {
          style: {
            overflowY: this.props.height ? "auto" : void 0,
            height: this.props.height
          }
        }, R(ScalarExprTreeTreeComponent, {
          tree: this.props.tree,
          onChange: this.props.onChange,
          filter: this.props.filter
        }));
      }
    }]);
    return ScalarExprTreeComponent;
  }(React.Component);

  ;
  ScalarExprTreeComponent.propTypes = {
    tree: PropTypes.array.isRequired,
    // Tree from ScalarExprTreeBuilder
    onChange: PropTypes.func.isRequired,
    // Called with newly selected value
    height: PropTypes.number,
    // Render height of the component
    filter: PropTypes.string // Optional string filter 

  };
  return ScalarExprTreeComponent;
}.call(void 0);

ScalarExprTreeTreeComponent = function () {
  var ScalarExprTreeTreeComponent =
  /*#__PURE__*/
  function (_React$Component2) {
    (0, _inherits2.default)(ScalarExprTreeTreeComponent, _React$Component2);

    function ScalarExprTreeTreeComponent() {
      (0, _classCallCheck2.default)(this, ScalarExprTreeTreeComponent);
      return (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(ScalarExprTreeTreeComponent).apply(this, arguments));
    }

    (0, _createClass2.default)(ScalarExprTreeTreeComponent, [{
      key: "render",
      value: function render() {
        var elems, i, item, j, len, ref;
        elems = [];
        ref = this.props.tree; // Get tree

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
      }
    }]);
    return ScalarExprTreeTreeComponent;
  }(React.Component);

  ;
  ScalarExprTreeTreeComponent.propTypes = {
    tree: PropTypes.array.isRequired,
    // Tree from ScalarExprTreeBuilder
    onChange: PropTypes.func.isRequired,
    // Called with newly selected value
    prefix: PropTypes.string,
    // String to prefix names with
    filter: PropTypes.string // Optional string filter 

  };
  return ScalarExprTreeTreeComponent;
}.call(void 0);

ScalarExprTreeLeafComponent = function () {
  var ScalarExprTreeLeafComponent =
  /*#__PURE__*/
  function (_React$Component3) {
    (0, _inherits2.default)(ScalarExprTreeLeafComponent, _React$Component3);

    function ScalarExprTreeLeafComponent() {
      var _this;

      (0, _classCallCheck2.default)(this, ScalarExprTreeLeafComponent);
      _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(ScalarExprTreeLeafComponent).apply(this, arguments));
      _this.handleClick = _this.handleClick.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      return _this;
    }

    (0, _createClass2.default)(ScalarExprTreeLeafComponent, [{
      key: "handleClick",
      value: function handleClick() {
        boundMethodCheck(this, ScalarExprTreeLeafComponent);
        return this.props.onChange(this.props.item.value);
      }
    }, {
      key: "render",
      value: function render() {
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
      }
    }]);
    return ScalarExprTreeLeafComponent;
  }(React.Component);

  ;
  ScalarExprTreeLeafComponent.propTypes = {
    item: PropTypes.object.isRequired,
    // Contains item "name" and "value"
    prefix: PropTypes.string // String to prefix names with

  };
  return ScalarExprTreeLeafComponent;
}.call(void 0);

ScalarExprTreeNodeComponent = function () {
  var ScalarExprTreeNodeComponent =
  /*#__PURE__*/
  function (_React$Component4) {
    (0, _inherits2.default)(ScalarExprTreeNodeComponent, _React$Component4);

    function ScalarExprTreeNodeComponent(props) {
      var _this2;

      (0, _classCallCheck2.default)(this, ScalarExprTreeNodeComponent);
      _this2 = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(ScalarExprTreeNodeComponent).call(this, props));
      _this2.handleArrowClick = _this2.handleArrowClick.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this2)));
      _this2.handleItemClick = _this2.handleItemClick.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this2)));
      _this2.state = {
        collapse: _this2.props.item.initiallyOpen ? "open" : "closed"
      };
      return _this2;
    }

    (0, _createClass2.default)(ScalarExprTreeNodeComponent, [{
      key: "componentWillReceiveProps",
      value: function componentWillReceiveProps(nextProps) {
        // If initially open changed, then update collapse
        if (nextProps.item.initiallyOpen !== this.props.item.initiallyOpen) {
          return this.setState({
            collapse: nextProps.item.initiallyOpen ? "open" : "closed"
          });
        }
      }
    }, {
      key: "handleArrowClick",
      value: function handleArrowClick() {
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
    }, {
      key: "handleItemClick",
      value: function handleItemClick() {
        boundMethodCheck(this, ScalarExprTreeNodeComponent); // If no value, treat as arrow click

        if (!this.props.item.value) {
          return this.handleArrowClick();
        } else {
          return this.props.onChange(this.props.item.value);
        }
      }
    }, {
      key: "render",
      value: function render() {
        var _this3 = this;

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
          // Compute new prefix, adding when going into joins
          prefix = this.props.prefix || "";

          if (this.props.item.item.type === "join") {
            prefix = prefix + this.props.item.name + " > ";
          } // Render child items


          childItems = this.props.item.children();
          children = _.map(childItems, function (item) {
            if (item.children) {
              return R(ScalarExprTreeNodeComponent, {
                key: item.key,
                item: item,
                prefix: prefix,
                onChange: _this3.props.onChange,
                filter: _this3.props.filter
              });
            } else {
              return R(ScalarExprTreeLeafComponent, {
                key: item.key,
                item: item,
                prefix: prefix,
                onChange: _this3.props.onChange
              });
            }
          }); // Decorate children if section

          if (this.context.decorateScalarExprTreeSectionChildren && this.props.item.item.type === "section") {
            children = this.context.decorateScalarExprTreeSectionChildren({
              children: children,
              tableId: this.props.item.tableId,
              section: this.props.item.item,
              filter: this.props.filter
            });
          } // Pad left and give key


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
          className: this.props.item.value ? "hover-grey-background" : void 0
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
          className: "text-muted" // if @props.item.item.type == "join"
          //   R 'i', className: "fa fa-link", style: { paddingRight: 5, paddingLeft: 5 }

        }, this.props.prefix) : void 0, this.props.item.name, this.props.item.desc ? R('span', {
          className: "text-muted",
          style: {
            fontSize: 12,
            paddingLeft: 3
          }
        }, " - " + this.props.item.desc) : void 0)), children);
      }
    }]);
    return ScalarExprTreeNodeComponent;
  }(React.Component);

  ;
  ScalarExprTreeNodeComponent.propTypes = {
    item: PropTypes.object.isRequired,
    // Item to display
    onChange: PropTypes.func.isRequired,
    // Called when item is selected
    filter: PropTypes.string // Optional string filter 

  };
  ScalarExprTreeNodeComponent.contextTypes = {
    // Function to decorate the children component of a section. Passed { children: React element of children, tableId: id of table, section: section object from schema, filter: optional string filter }
    // Should return decorated element
    decorateScalarExprTreeSectionChildren: PropTypes.func
  };
  return ScalarExprTreeNodeComponent;
}.call(void 0);