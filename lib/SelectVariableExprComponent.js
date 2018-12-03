var ExprUtils, PropTypes, R, React, SelectFieldExprComponent, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

R = React.createElement;

ExprUtils = require('mwater-expressions').ExprUtils;

module.exports = SelectFieldExprComponent = (function(superClass) {
  extend(SelectFieldExprComponent, superClass);

  function SelectFieldExprComponent() {
    return SelectFieldExprComponent.__super__.constructor.apply(this, arguments);
  }

  SelectFieldExprComponent.propTypes = {
    value: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    variables: PropTypes.array.isRequired,
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    types: PropTypes.array,
    enumValues: PropTypes.array,
    idTable: PropTypes.string
  };

  SelectFieldExprComponent.contextTypes = {
    locale: PropTypes.string
  };

  SelectFieldExprComponent.prototype.render = function() {
    var items, variables;
    variables = _.filter(this.props.variables, (function(_this) {
      return function(variable) {
        var ref;
        if (_this.props.types && (ref = variable.type, indexOf.call(_this.props.types, ref) < 0)) {
          return false;
        }
        if (_this.props.idTable && variable.idTable && variable.idTable !== _this.props.idTable) {
          return false;
        }
        if (_this.props.enumValues && variable.enumValues) {
          if (_.difference(_.pluck(variable.enumValues, "id"), _.pluck(_this.props.enumValues, "id")).length > 0) {
            return false;
          }
        }
        return true;
      };
    })(this));
    items = _.map(variables, (function(_this) {
      return function(variable) {
        return {
          id: variable.id,
          name: ExprUtils.localizeString(variable.name, _this.context.locale) || "(unnamed)",
          desc: ExprUtils.localizeString(variable.desc, _this.context.locale),
          onClick: function() {
            return _this.props.onChange({
              type: "variable",
              variableId: variable.id
            });
          }
        };
      };
    })(this));
    return R('div', {
      style: {
        paddingTop: 10
      }
    }, _.map(items, (function(_this) {
      return function(item) {
        return R('div', {
          key: item.id,
          style: {
            padding: 4,
            borderRadius: 4,
            cursor: "pointer",
            color: "#478"
          },
          className: "hover-grey-background",
          onClick: item.onClick
        }, item.name, item.desc ? R('span', {
          className: "text-muted",
          style: {
            fontSize: 12,
            paddingLeft: 3
          }
        }, " - " + item.desc) : void 0);
      };
    })(this)));
  };

  return SelectFieldExprComponent;

})(React.Component);
