"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableSelectComponent = exports.ActiveTablesContext = exports.LocaleContext = exports.CustomTableSelectComponentFactoryContext = void 0;
var lodash_1 = __importDefault(require("lodash"));
var mwater_expressions_1 = require("mwater-expressions");
var react_1 = __importDefault(require("react"));
var react_2 = require("react");
var react_select_1 = __importDefault(require("react-select"));
/** Context to override the table select component */
exports.CustomTableSelectComponentFactoryContext = react_2.createContext(null);
/** Context to set the locale */
exports.LocaleContext = react_2.createContext("en");
/** Optional list of tables (ids) being used. Some overrides of the table select component may use this to present
 * an initially short list to select from */
exports.ActiveTablesContext = react_2.createContext([]);
/** Table select component that uses custom one if available */
exports.TableSelectComponent = function (props) {
    var value = props.value;
    var customTableSelectComponentFactory = react_2.useContext(exports.CustomTableSelectComponentFactoryContext);
    var locale = react_2.useContext(exports.LocaleContext);
    if (customTableSelectComponentFactory) {
        return react_1.default.createElement("div", null, customTableSelectComponentFactory(props));
    }
    var tables = props.schema.getTables().filter(function (table) { return !table.deprecated; });
    var options = lodash_1.default.sortBy(tables.map(function (table) { return ({ value: table.id, label: mwater_expressions_1.ExprUtils.localizeString(table.name, locale) }); }), "label");
    return react_1.default.createElement(react_select_1.default, { value: value ? options.find(function (t) { return t.value == props.value; }) : null, options: options, onChange: function (v) {
            props.onChange(v ? v.value : null);
        }, menuPortalTarget: document.body, styles: { menuPortal: function (style) { return (__assign(__assign({}, style), { zIndex: 2000 })); } }, placeholder: "Select..." });
};
