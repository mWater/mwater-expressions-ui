"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableSelectComponent = exports.ActiveTablesContext = exports.LocaleContext = exports.CustomTableSelectComponentFactoryContext = void 0;
const lodash_1 = __importDefault(require("lodash"));
const mwater_expressions_1 = require("mwater-expressions");
const react_1 = __importDefault(require("react"));
const react_2 = require("react");
const react_select_1 = __importDefault(require("react-select"));
/** Context to override the table select component */
exports.CustomTableSelectComponentFactoryContext = react_2.createContext(null);
/** Context to set the locale */
exports.LocaleContext = react_2.createContext("en");
/** Optional list of tables (ids) being used. Some overrides of the table select component may use this to present
 * an initially short list to select from */
exports.ActiveTablesContext = react_2.createContext([]);
/** Table select component that uses custom one if available */
exports.TableSelectComponent = (props) => {
    const value = props.value;
    const customTableSelectComponentFactory = react_2.useContext(exports.CustomTableSelectComponentFactoryContext);
    const locale = react_2.useContext(exports.LocaleContext);
    if (customTableSelectComponentFactory) {
        return react_1.default.createElement("div", null, customTableSelectComponentFactory(props));
    }
    const tables = props.schema.getTables().filter((table) => !table.deprecated);
    const options = lodash_1.default.sortBy(tables.map((table) => ({ value: table.id, label: mwater_expressions_1.ExprUtils.localizeString(table.name, locale) })), "label");
    return (react_1.default.createElement(react_select_1.default, { value: value ? options.find((t) => t.value == props.value) : null, options: options, onChange: (v) => {
            props.onChange(v ? v.value : null);
        }, menuPortalTarget: document.body, styles: { menuPortal: (style) => (Object.assign(Object.assign({}, style), { zIndex: 2000 })) }, placeholder: "Select..." }));
};
