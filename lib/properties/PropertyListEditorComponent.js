var EnumValueEditorComponent, EnumValuesEditorComponent, ExprComponent, FormGroupComponent, H, IdFieldComponent, JoinEditorComponent, LocalizedStringEditorComp, PropertyListEditorComponent, R, React, TableSelectComponent, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

React = require('react');

R = React.createElement;

H = React.DOM;

_ = require('lodash');

LocalizedStringEditorComp = require('../LocalizedStringEditorComp');

ExprComponent = require('../ExprComponent');

FormGroupComponent = require('./FormGroupComponent');

IdFieldComponent = require('./IdFieldComponent');

module.exports = PropertyListEditorComponent = (function(superClass) {
  extend(PropertyListEditorComponent, superClass);

  function PropertyListEditorComponent() {
    return PropertyListEditorComponent.__super__.constructor.apply(this, arguments);
  }

  PropertyListEditorComponent.propTypes = {
    property: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired,
    features: React.PropTypes.array,
    schema: React.PropTypes.object,
    dataSource: React.PropTypes.object,
    table: React.PropTypes.string.isRequired,
    createRoleEditElem: React.PropTypes.func
  };

  PropertyListEditorComponent.defaultProps = {
    features: []
  };

  PropertyListEditorComponent.prototype.render = function() {
    var ref, ref1;
    return H.div(null, _.includes(this.props.features, "idField") ? R(IdFieldComponent, {
      value: this.props.property.id,
      onChange: (function(_this) {
        return function(value) {
          return _this.props.onChange(_.extend({}, _this.props.property, {
            id: value
          }));
        };
      })(this)
    }) : void 0, _.includes(this.props.features, "code") ? R(FormGroupComponent, {
      label: "Code"
    }, H.input({
      type: "text",
      className: "form-control",
      value: this.props.property.code,
      onChange: (function(_this) {
        return function(ev) {
          return _this.props.onChange(_.extend({}, _this.props.property, {
            code: ev.target.value
          }));
        };
      })(this)
    })) : void 0, R(FormGroupComponent, {
      label: "Name"
    }, R(LocalizedStringEditorComp, {
      value: this.props.property.name,
      onChange: (function(_this) {
        return function(value) {
          return _this.props.onChange(_.extend({}, _this.props.property, {
            name: value
          }));
        };
      })(this)
    })), R(FormGroupComponent, {
      label: "Description"
    }, R(LocalizedStringEditorComp, {
      value: this.props.property.desc,
      onChange: (function(_this) {
        return function(value) {
          return _this.props.onChange(_.extend({}, _this.props.property, {
            desc: value
          }));
        };
      })(this)
    })), R(FormGroupComponent, {
      label: "Type"
    }, H.select({
      className: "form-control",
      value: this.props.property.type,
      onChange: ((function(_this) {
        return function(ev) {
          return _this.props.onChange(_.extend({}, _this.props.property, {
            type: ev.target.value
          }));
        };
      })(this))
    }, H.option({
      key: "",
      value: ""
    }, ""), H.option({
      key: "text",
      value: "text"
    }, "Text"), H.option({
      key: "number",
      value: "number"
    }, "Number"), H.option({
      key: "boolean",
      value: "boolean"
    }, "Boolean"), H.option({
      key: "geometry",
      value: "geometry"
    }, "Geometry"), H.option({
      key: "enum",
      value: "enum"
    }, "Enum"), H.option({
      key: "enumset",
      value: "enumset"
    }, "Enum Set"), H.option({
      key: "date",
      value: "date"
    }, "Date"), H.option({
      key: "datetime",
      value: "datetime"
    }, "Datetime"), H.option({
      key: "text[]",
      value: "text[]"
    }, "Text Array"), H.option({
      key: "image",
      value: "image"
    }, "Image"), H.option({
      key: "imagelist",
      value: "imagelist"
    }, "Imagelist"), H.option({
      key: "json",
      value: "json"
    }, "JSON"), _.includes(this.props.features, "exprType") ? H.option({
      key: "expr",
      value: "expr"
    }, "Expression") : void 0, _.includes(this.props.features, "idType") && this.props.schema ? H.option({
      key: "id",
      value: "id"
    }, "Reference") : void 0, _.includes(this.props.features, "idType") && this.props.schema ? H.option({
      key: "id[]",
      value: "id[]"
    }, "Reference List") : void 0, _.includes(this.props.features, "joinType") ? H.option({
      key: "join",
      value: "join"
    }, "Join") : void 0)), (ref = this.props.property.type) === "enum" || ref === "enumset" ? R(FormGroupComponent, {
      label: "Values"
    }, R(EnumValuesEditorComponent, {
      value: this.props.property.enumValues,
      onChange: ((function(_this) {
        return function(value) {
          return _this.props.onChange(_.extend({}, _this.props.property, {
            enumValues: value
          }));
        };
      })(this))
    })) : void 0, this.props.property.type === "expr" ? R(FormGroupComponent, {
      label: "Expression"
    }, R(ExprComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.table,
      value: this.props.property.expr,
      aggrStatuses: ["individual", "aggregate", "literal"],
      onChange: (function(_this) {
        return function(expr) {
          return _this.props.onChange(_.extend({}, _this.props.property, {
            expr: expr
          }));
        };
      })(this)
    })) : void 0, this.props.property.type === "join" ? R(FormGroupComponent, {
      label: "Join"
    }, R(JoinEditorComponent, {
      value: this.props.property.join,
      onChange: ((function(_this) {
        return function(join) {
          return _this.props.onChange(_.extend({}, _this.props.property, {
            join: join
          }));
        };
      })(this))
    })) : void 0, (ref1 = this.props.property.type) === "id" || ref1 === "id[]" ? R(FormGroupComponent, {
      label: "ID Table"
    }, R(TableSelectComponent, {
      value: this.props.property.idTable,
      schema: this.props.schema,
      onChange: ((function(_this) {
        return function(table) {
          return _this.props.onChange(_.extend({}, _this.props.property, {
            idTable: table
          }));
        };
      })(this))
    })) : void 0, R(FormGroupComponent, {
      label: "Deprecated"
    }, H.input({
      type: 'checkbox',
      checked: this.props.property.deprecated,
      onChange: ((function(_this) {
        return function(ev) {
          return _this.props.onChange(_.extend({}, _this.props.property, {
            deprecated: ev.target.checked
          }));
        };
      })(this))
    })), _.includes(this.props.features, "uniqueCode") && this.props.property.type === "text" ? R(FormGroupComponent, {
      label: "Unique Code?"
    }, H.input({
      type: 'checkbox',
      checked: this.props.property.uniqueCode,
      onChange: ((function(_this) {
        return function(ev) {
          return _this.props.onChange(_.extend({}, _this.props.property, {
            uniqueCode: ev.target.checked
          }));
        };
      })(this))
    })) : void 0, _.includes(this.props.features, "sql") ? R(FormGroupComponent, {
      label: "SQL"
    }, H.input({
      type: 'text',
      className: "form-control",
      value: this.props.property.sql,
      onChange: ((function(_this) {
        return function(ev) {
          return _this.props.onChange(_.extend({}, _this.props.property, {
            sql: ev.target.value
          }));
        };
      })(this))
    })) : void 0, this.props.createRoleEditElem ? R(FormGroupComponent, {
      label: "Roles"
    }, this.props.createRoleEditElem(this.props.property.roles || [], (function(_this) {
      return function(roles) {
        return _this.props.onChange(_.extend({}, _this.props.property, {
          roles: roles
        }));
      };
    })(this))) : void 0);
  };

  return PropertyListEditorComponent;

})(React.Component);

JoinEditorComponent = (function(superClass) {
  extend(JoinEditorComponent, superClass);

  function JoinEditorComponent() {
    return JoinEditorComponent.__super__.constructor.apply(this, arguments);
  }

  JoinEditorComponent.propTypes = {
    value: React.PropTypes.object,
    onChange: React.PropTypes.func.isRequired
  };

  JoinEditorComponent.prototype.render = function() {
    var ref, ref1, ref2, ref3;
    return H.div(null, H.div({
      className: "row"
    }, H.div({
      className: "col-md-12"
    }, R(FormGroupComponent, {
      label: "Type"
    }, H.select({
      className: "form-control",
      value: (ref = this.props.value) != null ? ref.type : void 0,
      onChange: ((function(_this) {
        return function(ev) {
          return _this.props.onChange(_.extend({}, _this.props.value, {
            type: ev.target.value
          }));
        };
      })(this))
    }, H.option({
      key: "",
      value: ""
    }, ""), H.option({
      key: "1-n",
      value: "1-n"
    }, "One to many"), H.option({
      key: "n-1",
      value: "n-1"
    }, "Many to one"), H.option({
      key: "n-n",
      value: "n-n"
    }, "Many to many"), H.option({
      key: "1-1",
      value: "1-1"
    }, "one to one")))), H.div({
      className: "col-md-12"
    }, R(FormGroupComponent, {
      label: "To Table"
    }, H.input({
      type: 'text',
      className: "form-control",
      value: (ref1 = this.props.value) != null ? ref1.toTable : void 0,
      onChange: ((function(_this) {
        return function(ev) {
          return _this.props.onChange(_.extend({}, _this.props.value, {
            toTable: ev.target.value
          }));
        };
      })(this))
    }))), H.div({
      className: "col-md-12"
    }, R(FormGroupComponent, {
      label: "From Column"
    }, H.input({
      type: 'text',
      className: "form-control",
      value: (ref2 = this.props.value) != null ? ref2.fromColumn : void 0,
      onChange: ((function(_this) {
        return function(ev) {
          return _this.props.onChange(_.extend({}, _this.props.value, {
            fromColumn: ev.target.value
          }));
        };
      })(this))
    }))), H.div({
      className: "col-md-12"
    }, R(FormGroupComponent, {
      label: "To Column"
    }, H.input({
      type: 'text',
      className: "form-control",
      value: (ref3 = this.props.value) != null ? ref3.toColumn : void 0,
      onChange: ((function(_this) {
        return function(ev) {
          return _this.props.onChange(_.extend({}, _this.props.value, {
            toColumn: ev.target.value
          }));
        };
      })(this))
    })))));
  };

  return JoinEditorComponent;

})(React.Component);

TableSelectComponent = (function(superClass) {
  extend(TableSelectComponent, superClass);

  function TableSelectComponent() {
    return TableSelectComponent.__super__.constructor.apply(this, arguments);
  }

  TableSelectComponent.propTypes = {
    value: React.PropTypes.string,
    schema: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired
  };

  TableSelectComponent.prototype.render = function() {
    return H.select({
      className: "form-control",
      value: this.props.value,
      onChange: ((function(_this) {
        return function(ev) {
          return _this.props.onChange(ev.target.value);
        };
      })(this))
    }, _.map(this.props.schema.tables, (function(_this) {
      return function(table) {
        return H.option({
          key: table.id,
          value: table.id
        }, table.name[table.name._base || "en"]);
      };
    })(this)));
  };

  return TableSelectComponent;

})(React.Component);

EnumValuesEditorComponent = (function(superClass) {
  extend(EnumValuesEditorComponent, superClass);

  function EnumValuesEditorComponent() {
    this.handleRemove = bind(this.handleRemove, this);
    this.handleAdd = bind(this.handleAdd, this);
    this.handleChange = bind(this.handleChange, this);
    return EnumValuesEditorComponent.__super__.constructor.apply(this, arguments);
  }

  EnumValuesEditorComponent.propTypes = {
    value: React.PropTypes.array,
    onChange: React.PropTypes.func.isRequired
  };

  EnumValuesEditorComponent.prototype.handleChange = function(i, item) {
    var value;
    value = (this.props.value || []).slice();
    value[i] = item;
    return this.props.onChange(value);
  };

  EnumValuesEditorComponent.prototype.handleAdd = function() {
    var value;
    value = (this.props.value || []).slice();
    value.push({
      id: "",
      name: {}
    });
    return this.props.onChange(value);
  };

  EnumValuesEditorComponent.prototype.handleRemove = function(i) {
    var value;
    value = (this.props.value || []).slice();
    value.splice(i, 1);
    return this.props.onChange(value);
  };

  EnumValuesEditorComponent.prototype.render = function() {
    return H.div(null, _.map(this.props.value || [], (function(_this) {
      return function(value, i) {
        return R(EnumValueEditorComponent, {
          key: i,
          value: value,
          onChange: _this.handleChange.bind(null, i),
          onRemove: _this.handleRemove.bind(null, i)
        });
      };
    })(this)), H.button({
      type: "button",
      className: "btn btn-link",
      onClick: this.handleAdd
    }, "+ Add Value"));
  };

  return EnumValuesEditorComponent;

})(React.Component);

EnumValueEditorComponent = (function(superClass) {
  extend(EnumValueEditorComponent, superClass);

  function EnumValueEditorComponent() {
    return EnumValueEditorComponent.__super__.constructor.apply(this, arguments);
  }

  EnumValueEditorComponent.propTypes = {
    value: React.PropTypes.object,
    onChange: React.PropTypes.func.isRequired,
    onRemove: React.PropTypes.func
  };

  EnumValueEditorComponent.prototype.render = function() {
    return H.div(null, H.div({
      className: "row"
    }, H.div({
      className: "col-md-6"
    }, R(IdFieldComponent, {
      value: this.props.value.id,
      onChange: (function(_this) {
        return function(value) {
          return _this.props.onChange(_.extend({}, _this.props.value, {
            id: value
          }));
        };
      })(this)
    })), H.div({
      className: "col-md-6"
    }, R(FormGroupComponent, {
      label: "Code"
    }, H.input({
      type: "text",
      className: "form-control",
      placeholder: "Code",
      style: {
        width: "10em"
      },
      value: this.props.value.code,
      onChange: (function(_this) {
        return function(ev) {
          return _this.props.onChange(_.extend({}, _this.props.value, {
            code: ev.target.value
          }));
        };
      })(this)
    })))), H.div({
      className: "row"
    }, H.div({
      className: "col-md-12"
    }, R(FormGroupComponent, {
      label: "Name"
    }, R(LocalizedStringEditorComp, {
      value: this.props.value.name,
      onChange: (function(_this) {
        return function(value) {
          return _this.props.onChange(_.extend({}, _this.props.value, {
            name: value
          }));
        };
      })(this)
    })))), H.div({
      className: "row"
    }, H.div({
      className: "col-md-12"
    }, R(FormGroupComponent, {
      label: "Description"
    }, R(LocalizedStringEditorComp, {
      value: this.props.value.desc,
      onChange: (function(_this) {
        return function(value) {
          return _this.props.onChange(_.extend({}, _this.props.value, {
            desc: value
          }));
        };
      })(this)
    })))), this.props.onRemove ? H.div({
      key: "remove"
    }, H.button({
      className: "btn btn-link btn-xs",
      onClick: this.props.onRemove
    }, "Remove")) : void 0);
  };

  return EnumValueEditorComponent;

})(React.Component);
