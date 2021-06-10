"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var AsyncLoadComponent,
    AsyncReactSelect,
    ExprCompiler,
    IdLiteralComponent,
    PropTypes,
    R,
    React,
    _,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

PropTypes = require('prop-types');
_ = require('lodash');
React = require('react');
R = React.createElement;
AsyncReactSelect = require('react-select/async')["default"];
ExprCompiler = require("mwater-expressions").ExprCompiler;
AsyncLoadComponent = require('react-library/lib/AsyncLoadComponent'); // Displays a combo box that allows selecting one or multiple text values from an expression
// Needs two indexes to work fast:
// create index on some_table (label_column);
// create index on some_table (lower(label_column) text_pattern_ops);

module.exports = IdLiteralComponent = function () {
  var IdLiteralComponent = /*#__PURE__*/function (_AsyncLoadComponent) {
    (0, _inherits2["default"])(IdLiteralComponent, _AsyncLoadComponent);

    var _super = _createSuper(IdLiteralComponent);

    function IdLiteralComponent() {
      var _this;

      (0, _classCallCheck2["default"])(this, IdLiteralComponent);
      _this = _super.apply(this, arguments);
      _this.handleChange = _this.handleChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.loadOptions = _this.loadOptions.bind((0, _assertThisInitialized2["default"])(_this));
      return _this;
    }

    (0, _createClass2["default"])(IdLiteralComponent, [{
      key: "focus",
      value: function focus() {
        return this.select.focus();
      } // Override to determine if a load is needed. Not called on mounting

    }, {
      key: "isLoadNeeded",
      value: function isLoadNeeded(newProps, oldProps) {
        return newProps.value !== oldProps.value || newProps.idTable !== oldProps.idTable;
      } // Call callback with state changes

    }, {
      key: "load",
      value: function load(props, prevProps, callback) {
        var _this2 = this;

        var idColumn, labelExpr, query, table; // Create query to get current value

        if (!props.value) {
          callback({
            currentValue: null
          });
          return;
        }

        table = props.schema.getTable(props.idTable); // Primary key column

        idColumn = {
          type: "field",
          tableAlias: "main",
          column: table.primaryKey
        };
        labelExpr = this.getLabelExpr();
        query = {
          type: "query",
          selects: [{
            type: "select",
            expr: idColumn,
            alias: "value"
          }, {
            type: "select",
            expr: labelExpr,
            alias: "label"
          }],
          from: {
            type: "table",
            table: this.props.idTable,
            alias: "main"
          },
          where: {
            type: "op",
            op: "=",
            modifier: "any",
            exprs: [idColumn, {
              type: "literal",
              value: props.multi ? props.value : [props.value]
            }]
          }
        }; // Execute query

        return props.dataSource.performQuery(query, function (err, rows) {
          if (err || !rows[0]) {
            callback({
              currentValue: null
            });
            return;
          }

          if (!_this2.props.multi) {
            return callback({
              currentValue: rows[0]
            });
          } else {
            return callback({
              currentValue: rows
            });
          }
        });
      }
    }, {
      key: "handleChange",
      value: function handleChange(value) {
        boundMethodCheck(this, IdLiteralComponent);

        if (this.props.multi) {
          if (value && value.length === 0) {
            return this.props.onChange(null);
          } else {
            return this.props.onChange(_.pluck(value, "value"));
          }
        } else {
          return this.props.onChange(value != null ? value.value : void 0);
        }
      }
    }, {
      key: "getLabelExpr",
      value: function getLabelExpr() {
        var table;

        if (this.props.labelExpr) {
          return this.props.labelExpr;
        }

        table = this.props.schema.getTable(this.props.idTable);

        if (table.label) {
          return {
            type: "field",
            tableAlias: "main",
            column: table.label
          };
        }

        return {
          // Use primary key. Ugly, but what else to do?. Cast to text.
          type: "op",
          op: "::text",
          exprs: [{
            type: "field",
            tableAlias: "main",
            column: table.primaryKey
          }]
        };
      }
    }, {
      key: "loadOptions",
      value: function loadOptions(input, cb) {
        var idColumn, labelExpr, query, table, where;
        boundMethodCheck(this, IdLiteralComponent);
        table = this.props.schema.getTable(this.props.idTable); // Primary key column

        idColumn = {
          type: "field",
          tableAlias: "main",
          column: table.primaryKey
        };
        labelExpr = this.getLabelExpr();

        if (input) {
          where = {
            type: "op",
            op: "like",
            exprs: [{
              type: "op",
              op: "lower",
              exprs: [labelExpr]
            }, this.props.searchWithin ? "%" + input.toLowerCase() + "%" : input.toLowerCase() + "%"]
          };
        } else {
          where = null;
        } // select <label column> as value from <table> where lower(<label column>) like 'input%' limit 50


        query = {
          type: "query",
          selects: [{
            type: "select",
            expr: idColumn,
            alias: "value"
          }, {
            type: "select",
            expr: labelExpr,
            alias: "label"
          }],
          from: {
            type: "table",
            table: this.props.idTable,
            alias: "main"
          },
          where: where,
          orderBy: [{
            ordinal: 2,
            direction: "asc"
          }],
          limit: 50
        };

        if (this.props.filter) {
          if (query.where) {
            query.where = {
              type: "op",
              op: "and",
              exprs: [query.where, this.props.filter]
            };
          } else {
            query.where = this.props.filter;
          }
        } // Add custom orderings


        if (this.props.orderBy) {
          query.orderBy = this.props.orderBy.concat(query.orderBy);
        } // Execute query


        this.props.dataSource.performQuery(query, function (err, rows) {
          if (err) {
            return;
          } // Filter null and blank


          rows = _.filter(rows, function (r) {
            return r.label;
          });
          return cb(rows);
        });
      }
    }, {
      key: "render",
      value: function render() {
        var _this3 = this;

        return R('div', {
          style: {
            width: "100%"
          }
        }, R(AsyncReactSelect, {
          ref: function ref(c) {
            return _this3.select = c;
          },
          value: this.state.currentValue,
          placeholder: this.props.placeholder || "Select",
          loadOptions: this.loadOptions,
          isMulti: this.props.multi,
          isClearable: true,
          isLoading: this.state.loading,
          onChange: this.handleChange,
          noOptionsMessage: function noOptionsMessage() {
            return "Type to search";
          },
          defaultOptions: true,
          closeMenuOnScroll: true,
          menuPortalTarget: document.body,
          styles: {
            // Keep menu above fixed data table headers and map
            menu: function menu(style) {
              return _.extend({}, style, {
                zIndex: 2000
              });
            },
            menuPortal: function menuPortal(style) {
              return _.extend({}, style, {
                zIndex: 2000
              });
            }
          }
        }));
      }
    }]);
    return IdLiteralComponent;
  }(AsyncLoadComponent);

  ;
  IdLiteralComponent.propTypes = {
    value: PropTypes.any,
    // String value of primary key or array of primary keys
    onChange: PropTypes.func.isRequired,
    // Called with primary key or array of primary keys
    idTable: PropTypes.string.isRequired,
    // Array of id and name (localized string)
    schema: PropTypes.object.isRequired,
    // Schema of the database
    dataSource: PropTypes.object.isRequired,
    // Data source to use to get values
    placeholder: PropTypes.string,
    orderBy: PropTypes.array,
    // Optional extra orderings. Put "main" as tableAlias. JsonQL
    multi: PropTypes.bool,
    // Allow multiple values (id[] type)
    filter: PropTypes.object,
    // Optional extra filter. Put "main" as tableAlias. JsonQL
    labelExpr: PropTypes.object,
    // Optional label expression to use. Defaults to label column or PK if none. JsonQL
    searchWithin: PropTypes.bool // Allow searching anywhere in label, not just start

  };
  return IdLiteralComponent;
}.call(void 0);