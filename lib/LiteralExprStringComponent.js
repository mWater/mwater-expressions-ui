"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var AsyncLoadComponent, ExprCompiler, ExprUtils, LiteralExprStringComponent, PropTypes, R, React, _;

PropTypes = require('prop-types');
_ = require('lodash');
React = require('react');
R = React.createElement;
ExprCompiler = require("mwater-expressions").ExprCompiler;
ExprUtils = require("mwater-expressions").ExprUtils;
AsyncLoadComponent = require('react-library/lib/AsyncLoadComponent'); // Displays a literal expression as a string. Simple for non-id types. For id types, loads using a query

module.exports = LiteralExprStringComponent = function () {
  var LiteralExprStringComponent =
  /*#__PURE__*/
  function (_AsyncLoadComponent) {
    (0, _inherits2.default)(LiteralExprStringComponent, _AsyncLoadComponent);

    function LiteralExprStringComponent() {
      (0, _classCallCheck2.default)(this, LiteralExprStringComponent);
      return (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(LiteralExprStringComponent).apply(this, arguments));
    }

    (0, _createClass2.default)(LiteralExprStringComponent, [{
      key: "isLoadNeeded",
      // Override to determine if a load is needed. Not called on mounting
      value: function isLoadNeeded(newProps, oldProps) {
        return !_.isEqual(newProps.value, oldProps.value);
      } // Call callback with state changes

    }, {
      key: "load",
      value: function load(props, prevProps, callback) {
        var idColumn, labelColumn, query, ref, table; // If no value or not id, id[]

        if (!props.value || (ref = props.value.valueType) !== 'id' && ref !== "id[]") {
          callback({
            label: null
          });
          return;
        } // Create query to get current value


        table = props.schema.getTable(props.value.idTable); // Primary key column

        idColumn = {
          type: "field",
          tableAlias: "main",
          column: table.primaryKey
        };

        if (table.label) {
          labelColumn = {
            type: "field",
            tableAlias: "main",
            column: table.label // Use primary key. Ugly, but what else to do?

          };
        } else {
          labelColumn = idColumn;
        }

        query = {
          type: "query",
          selects: [{
            type: "select",
            expr: labelColumn,
            alias: "label"
          }],
          from: {
            type: "table",
            table: table.id,
            alias: "main"
          },
          where: {
            type: "op",
            op: "=",
            modifier: "any",
            exprs: [idColumn, {
              type: "literal",
              value: props.value.valueType === "id[]" ? props.value.value : [props.value.value]
            }]
          }
        }; // Execute query

        return props.dataSource.performQuery(query, function (err, rows) {
          if (err || !rows[0]) {
            callback({
              label: "(error)"
            });
            return;
          }

          if (props.value.valueType === "id") {
            return callback({
              label: rows[0].label
            });
          } else {
            return callback({
              label: _.pluck(rows, "label").join(", ") || "None"
            });
          }
        });
      }
    }, {
      key: "render",
      value: function render() {
        var exprUtils, ref, ref1, str, type;
        exprUtils = new ExprUtils(this.props.schema);
        type = (ref = this.props.value) != null ? ref.valueType : void 0; // Handle simple case

        if (type !== 'id' && type !== 'id[]') {
          str = exprUtils.stringifyLiteralValue(type, (ref1 = this.props.value) != null ? ref1.value : void 0, this.props.locale || this.context.locale, this.props.enumValues); // Quote text

          if (type === "text") {
            str = '"' + str + '"';
          }
        } else {
          if (this.state.loading) {
            str = "...";
          } else {
            str = this.state.label;
          }
        }

        return R('span', null, str);
      }
    }]);
    return LiteralExprStringComponent;
  }(AsyncLoadComponent);

  ;
  LiteralExprStringComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    // Data source to use to get values
    value: PropTypes.object,
    // Current expression value
    enumValues: PropTypes.array,
    // Array of { id:, name: } of enum values that can be selected. Only when type = "enum"
    locale: PropTypes.string // e.g. "en"

  };
  LiteralExprStringComponent.contextTypes = {
    locale: PropTypes.string // e.g. "en"

  };
  return LiteralExprStringComponent;
}.call(void 0);