var ExprLinkComponent, ExprUtils, H, LinkComponent, LiteralExprStringComponent, PropTypes, R, React, SelectExprModalComponent, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

R = React.createElement;

H = React.DOM;

SelectExprModalComponent = require('./SelectExprModalComponent');

LinkComponent = require('./LinkComponent');

ExprUtils = require("mwater-expressions").ExprUtils;

LiteralExprStringComponent = require('./LiteralExprStringComponent');

module.exports = ExprLinkComponent = (function(superClass) {
  extend(ExprLinkComponent, superClass);

  ExprLinkComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    table: PropTypes.string.isRequired,
    value: PropTypes.object,
    onChange: PropTypes.func,
    types: PropTypes.array,
    enumValues: PropTypes.array,
    idTable: PropTypes.string,
    initialMode: PropTypes.oneOf(['field', 'formula', 'literal']),
    allowCase: PropTypes.bool,
    aggrStatuses: PropTypes.array,
    refExpr: PropTypes.object,
    placeholder: PropTypes.string
  };

  ExprLinkComponent.contextTypes = {
    locale: PropTypes.string
  };

  ExprLinkComponent.defaultProps = {
    placeholder: "Select...",
    initialMode: "field",
    aggrStatuses: ['individual', 'literal']
  };

  function ExprLinkComponent() {
    this.renderLiteral = bind(this.renderLiteral, this);
    this.renderField = bind(this.renderField, this);
    this.renderNone = bind(this.renderNone, this);
    this.handleClick = bind(this.handleClick, this);
    this.showModal = bind(this.showModal, this);
    ExprLinkComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      modalVisible: false
    };
  }

  ExprLinkComponent.prototype.showModal = function() {
    return this.setState({
      modalVisible: true
    });
  };

  ExprLinkComponent.prototype.handleClick = function() {
    return this.setState({
      modalVisible: true
    });
  };

  ExprLinkComponent.prototype.renderNone = function() {
    return H.a({
      onClick: this.handleClick,
      style: {
        cursor: "pointer",
        fontStyle: "italic",
        color: "#478"
      }
    }, this.props.placeholder);
  };

  ExprLinkComponent.prototype.renderField = function() {
    var exprUtils;
    exprUtils = new ExprUtils(this.props.schema);
    return R(LinkComponent, {
      dropdownItems: [
        {
          id: "edit",
          name: [
            H.i({
              className: "fa fa-pencil text-muted"
            }), " Edit"
          ]
        }, {
          id: "remove",
          name: [
            H.i({
              className: "fa fa-remove text-muted"
            }), " Remove"
          ]
        }
      ],
      onDropdownItemClicked: ((function(_this) {
        return function(id) {
          if (id === "edit") {
            return _this.setState({
              modalVisible: true
            });
          } else {
            return _this.props.onChange(null);
          }
        };
      })(this))
    }, exprUtils.summarizeExpr(this.props.value));
  };

  ExprLinkComponent.prototype.renderLiteral = function() {
    return R(LinkComponent, {
      dropdownItems: [
        {
          id: "edit",
          name: [
            H.i({
              className: "fa fa-pencil text-muted"
            }), " Edit"
          ]
        }, {
          id: "remove",
          name: [
            H.i({
              className: "fa fa-remove text-muted"
            }), " Remove"
          ]
        }
      ],
      onDropdownItemClicked: ((function(_this) {
        return function(id) {
          if (id === "edit") {
            return _this.setState({
              modalVisible: true
            });
          } else {
            return _this.props.onChange(null);
          }
        };
      })(this))
    }, R(LiteralExprStringComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      value: this.props.value,
      enumValues: this.props.enumValues
    }));
  };

  ExprLinkComponent.prototype.render = function() {
    var initialMode, ref;
    initialMode = this.props.initialMode;
    if (this.props.value) {
      if ((ref = this.props.value.type) === "field" || ref === "scalar") {
        initialMode = "field";
      } else if (this.props.value.type === "literal") {
        initialMode = "literal";
      } else {
        initialMode = "formula";
      }
    }
    return H.div(null, this.state.modalVisible ? R(SelectExprModalComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.table,
      value: this.props.value,
      types: this.props.types,
      enumValues: this.props.enumValues,
      idTable: this.props.idTable,
      initialMode: initialMode,
      allowCase: this.props.allowCase,
      aggrStatuses: this.props.aggrStatuses,
      refExpr: this.props.refExpr,
      onCancel: (function(_this) {
        return function() {
          return _this.setState({
            modalVisible: false
          });
        };
      })(this),
      onSelect: (function(_this) {
        return function(expr) {
          _this.setState({
            modalVisible: false
          });
          return _this.props.onChange(expr);
        };
      })(this)
    }) : void 0, !this.props.value ? this.renderNone() : this.props.value.type === "field" ? this.renderField() : this.props.value.type === "literal" ? this.renderLiteral() : void 0);
  };

  return ExprLinkComponent;

})(React.Component);
