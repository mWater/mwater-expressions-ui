"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
const jquery_1 = __importDefault(require("jquery"));
const prop_types_1 = __importDefault(require("prop-types"));
const react_1 = __importDefault(require("react"));
const react_dom_1 = __importDefault(require("react-dom"));
const R = react_1.default.createElement;
const mwater_expressions_1 = require("mwater-expressions");
const ExprComponent_1 = __importDefault(require("./ExprComponent"));
const mwater_expressions_2 = require("mwater-expressions");
const InlineExprsEditorComponent_1 = __importDefault(require("./InlineExprsEditorComponent"));
const ContentEditableComponent_1 = __importDefault(require("./ContentEditableComponent"));
const PropertyListComponent_1 = __importDefault(require("./properties/PropertyListComponent"));
const IdLiteralComponent_1 = __importDefault(require("./IdLiteralComponent"));
require("./index.css");
const ModalPopupComponent_1 = __importDefault(require("react-library/lib/ModalPopupComponent"));
const react_dnd_html5_backend_1 = __importDefault(require("react-dnd-html5-backend"));
const react_dnd_1 = require("react-dnd");
const mwater_expressions_3 = require("mwater-expressions");
const extensions_1 = require("./extensions");
(0, mwater_expressions_3.registerExprExtension)("test", {
    cleanExpr: (expr) => expr,
    getExprAggrStatus: () => "individual",
    validateExpr: (expr) => null,
    getExprEnumValues: (expr) => [],
    getExprIdTable: (expr) => null,
    getExprType: (expr) => "number",
    summarizeExpr: (expr) => `EXTENSION: ${expr.params.value}`,
    getReferencedFields: (expr) => [],
    compileExpr: (expr) => {
        throw new Error("Not implemented");
    },
    evaluate: (expr) => {
        throw new Error("Not implemented");
    },
    evaluateSync: (expr) => {
        throw new Error("Not implemented");
    }
});
(0, extensions_1.registerExprUIExtension)({
    id: "test",
    name: { _base: "en", en: "Test Extension" },
    desc: { _base: "en", en: "Extension for advanced use" },
    aggrStatuses: ["individual"],
    types: ["number"],
    createDefaultExpr: (table) => ({ type: "extension", extension: "test", table, params: { value: 4 } }),
    createExprElement: (options) => R("div", null, `EXTENSION: ${expr.params.value}`)
});
(0, jquery_1.default)(() => jquery_1.default.getJSON("https://api.mwater.co/v3/jsonql/schema", function (schemaJson) {
    const schema = new mwater_expressions_1.Schema(schemaJson);
    const dataSource = new MWaterDataSource("https://api.mwater.co/v3/", null, false);
    // ReactDOM.render(R(MockTestInlineExprsEditorComponent), document.getElementById("main"))
    // ReactDOM.render(R(MockPropertyEditorTestComponent), document.getElementById("main"))
    // ReactDOM.render(R(PropertyListContainerComponentWrapped, schema: schema, dataSource: dataSource, table: "entities.water_system"), document.getElementById("main"))
    // ReactDOM.render(R(LiveTestComponent), document.getElementById("main"))
    react_dom_1.default.render(R(MockTestComponent), document.getElementById("main"));
}));
// ReactDOM.render(R(ContentEditableTestComponent), document.getElementById("main"))
// ReactDOM.render(R(LiveIdLiteralTestComponent), document.getElementById("main"))
class PropertyListContainerComponent extends react_1.default.Component {
    static initClass() {
        this.propTypes = {
            schema: prop_types_1.default.object.isRequired,
            dataSource: prop_types_1.default.object.isRequired,
            table: prop_types_1.default.string.isRequired
        };
        // Table that properties are of
    }
    constructor(props) {
        super(props);
        this.state = {
            properties: this.props.schema.getTable("entities.water_system").contents
        };
    }
    render() {
        return R("div", { className: "row" }, R("div", { className: "col-md-6" }, R("div", { style: { padding: 20, border: "1px solid #aeaeae", width: 600 } }, R(PropertyListComponent_1.default, {
            properties: this.state.properties,
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            table: this.props.table,
            // tableIds: ["entities.water_point", "entities.community"]
            features: ["idField", "joinType", "idType", "expr", "onDelete"],
            onChange: (properties) => this.setState({ properties })
        }))), 
        // createRoleDisplayElem: (roles) => R 'span', null, JSON.stringify(roles)
        // createRoleEditElem: (roles, onChange) =>
        //   R 'input', className: "form-control", value: JSON.stringify(roles), onChange: (ev) -> onChange(JSON.parse(ev.target.value))
        R("div", { className: "col-md-6" }, R("pre", null, JSON.stringify(this.state.properties, null, 2))));
    }
}
PropertyListContainerComponent.initClass();
const PropertyListContainerComponentWrapped = (0, react_dnd_1.DragDropContext)(react_dnd_html5_backend_1.default)(PropertyListContainerComponent);
class ContentEditableTestComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.state = {
            html: "World Water Week"
        };
    }
    render() {
        return R("div", null, R("div", null, "Sdfsdfsd"), R("div", null, "Sdfsdfsd"), R(ContentEditableComponent_1.default, {
            ref: (c) => {
                return (this.editor = c);
            },
            html: this.state.html,
            onChange: (elem) => {
                console.log(elem);
                return this.setState({ html: elem.innerHTML });
            }
        }), R("div", null, "Sdfsdfsd"), R("button", {
            onClick: () => {
                console.log("click!");
                return this.editor.pasteHTML("<b>" + this.editor.getSelectedHTML() + "</b>");
            },
            type: "button"
        }, "Paste"));
    }
}
class MockTestInlineExprsEditorComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.handleChange = (text, exprs) => {
            console.log(`handleChange: ${text}`);
            return this.setState({ text, exprs });
        };
        this.state = {
            schema: null,
            dataSource: null,
            text: "",
            exprs: []
            // text: "This is a {0}"
            // exprs: [{ type: "field", table: "t1", column: "text" }]
        };
    }
    componentWillMount() {
        let schema = new mwater_expressions_1.Schema();
        schema = schema.addTable({
            id: "t1",
            name: { en: "T1" },
            primaryKey: "primary",
            contents: [
                { id: "text", name: { en: "Text" }, type: "text" },
                { id: "number", name: { en: "Number" }, type: "number" },
                {
                    id: "enum",
                    name: { en: "Enum" },
                    type: "enum",
                    enumValues: [
                        { id: "a", name: { en: "A" } },
                        { id: "b", name: { en: "B" } }
                    ]
                },
                {
                    id: "enumset",
                    name: { en: "EnumSet" },
                    type: "enumset",
                    enumValues: [
                        { id: "a", name: { en: "A" } },
                        { id: "b", name: { en: "B" } }
                    ]
                },
                { id: "date", name: { en: "Date" }, type: "date" },
                { id: "datetime", name: { en: "Datetime" }, type: "datetime" },
                { id: "boolean", name: { en: "Boolean" }, type: "boolean" },
                {
                    id: "1-2",
                    name: { en: "T1->T2" },
                    type: "join",
                    join: { fromColumn: "primary", toTable: "t2", toColumn: "t1", type: "1-n" }
                }
            ]
        });
        schema = schema.addTable({
            id: "t2",
            name: { en: "T2" },
            primaryKey: "primary",
            ordering: "number",
            contents: [
                { id: "text", name: { en: "Text" }, type: "text" },
                { id: "number", name: { en: "Number" }, type: "number" },
                {
                    id: "enum",
                    name: { en: "Enum" },
                    type: "enum",
                    enumValues: [
                        { id: "a", name: { en: "A" } },
                        { id: "b", name: { en: "B" } }
                    ]
                },
                {
                    id: "2-1",
                    name: { en: "T2->T1" },
                    type: "join",
                    join: { fromColumn: "t1", toTable: "t1", toColumn: "primary", type: "n-1" }
                }
            ]
        });
        schema = schema.addTable({
            id: "t3",
            name: { en: "T3" },
            primaryKey: "primary",
            ordering: "number",
            contents: [
                { id: "text", name: { en: "Text" }, type: "text" },
                { id: "number", name: { en: "Number" }, type: "number" }
            ]
        });
        // Fake data source
        const dataSource = {
            performQuery: (query, cb) => {
                return cb(null, [{ value: "abc" }, { value: "xyz" }]);
            }
        };
        return this.setState({ schema, dataSource });
    }
    render() {
        if (!this.state.schema) {
            return null;
        }
        return R("div", { style: { padding: 10 } }, R(InlineExprsEditorComponent_1.default, {
            schema: this.state.schema,
            dataSource: this.state.dataSource,
            table: "t1",
            text: this.state.text,
            exprs: this.state.exprs,
            onChange: this.handleChange,
            types: ["boolean"],
            aggrStatuses: ["individual", "literal"],
            multiline: true,
            rows: 5
        }));
    }
}
// R('br')
// R('br')
// R 'pre', null, JSON.stringify(@state.value, null, 2)
class MockTestComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.handleValueChange = (value) => {
            // value = new ExprCleaner(@state.schema).cleanExpr(value) #, { type: 'boolean' })
            return this.setState({ value });
        };
        this.state = {
            value: null,
            schema: null,
            dataSource: null
        };
    }
    componentWillMount() {
        let schema = new mwater_expressions_1.Schema();
        schema = schema.addTable({
            id: "t1",
            name: { en: "T1" },
            primaryKey: "primary",
            label: "text",
            contents: [
                { id: "text", name: { en: "Text" }, desc: { en: "Text is a bunch of characters" }, type: "text" },
                { id: "number", name: { en: "Number" }, type: "number" },
                {
                    id: "enum",
                    name: { en: "Enum" },
                    type: "enum",
                    enumValues: [
                        { id: "a", name: { en: "A" } },
                        { id: "b", name: { en: "B" } }
                    ]
                },
                {
                    id: "enumset",
                    name: { en: "EnumSet" },
                    type: "enumset",
                    enumValues: [
                        { id: "a", name: { en: "A" } },
                        { id: "b", name: { en: "B" } }
                    ]
                },
                {
                    type: "section",
                    name: { en: "Section" },
                    contents: [
                        { id: "date", name: { en: "Date" }, type: "date" },
                        { id: "datetime", name: { en: "Datetime" }, type: "datetime" }
                    ]
                },
                { id: "boolean", name: { en: "Boolean" }, type: "boolean" },
                { id: "geometry", name: { en: "Geometry" }, type: "geometry" },
                {
                    id: "1-2",
                    name: { en: "T1->T2" },
                    type: "join",
                    join: { fromColumn: "primary", toTable: "t2", toColumn: "t1", type: "1-n" }
                },
                { id: "id2", name: { en: "Id2" }, type: "id", idTable: "t2" },
                { id: "id2[]", name: { en: "Id2[]" }, type: "id[]", idTable: "t2" },
                { id: "text[]", name: { en: "Text[]" }, type: "text[]" },
                // Expressions
                {
                    id: "expr_enum",
                    name: { en: "Expr Enum" },
                    type: "expr",
                    expr: { type: "field", table: "t1", column: "enum" }
                },
                {
                    id: "expr_number",
                    name: { en: "Expr Number" },
                    type: "expr",
                    expr: { type: "field", table: "t1", column: "number" }
                },
                { id: "expr_id", name: { en: "Expr Id" }, type: "expr", expr: { type: "id", table: "t1" } },
                {
                    id: "expr_sum",
                    name: { en: "Expr Sum" },
                    type: "expr",
                    expr: { type: "op", op: "sum", exprs: [{ type: "field", table: "t1", column: "number" }] }
                }
            ]
        });
        schema = schema.addTable({
            id: "t2",
            name: { en: "T2" },
            primaryKey: "primary",
            ordering: "date",
            contents: [
                { id: "text", name: { en: "Text" }, type: "text" },
                {
                    id: "enum",
                    name: { en: "Enum" },
                    type: "enum",
                    enumValues: [
                        { id: "a", name: { en: "A" } },
                        { id: "b", name: { en: "B" } }
                    ]
                },
                { id: "number", name: { en: "Number" }, type: "number" },
                { id: "geometry", name: { en: "Geometry" }, type: "geometry" },
                {
                    id: "2-1",
                    name: { en: "T2->T1" },
                    type: "join",
                    join: { fromColumn: "t1", toTable: "t1", toColumn: "primary", type: "n-1" }
                }
            ]
        });
        schema = schema.addTable({
            id: "t3",
            name: { en: "T3" },
            primaryKey: "primary",
            ordering: "number",
            contents: [
                { id: "text", name: { en: "Text" }, type: "text" },
                { id: "number", name: { en: "Number" }, type: "number" }
            ]
        });
        // Fake data source
        const dataSource = {
            performQuery: (query, cb) => {
                return cb(null, [
                    { value: "abc", label: "ABC" },
                    { value: "xyz", label: "XYZ" }
                ]);
            }
        };
        return this.setState({ schema, dataSource });
    }
    render() {
        if (!this.state.schema) {
            return null;
        }
        // R PropertyListContainerComponent,
        //   schema: @state.schema
        //   dataSource: @state.dataSource
        //   table: "t1"
        const variables = [
            { id: "varnumber", name: { _base: "en", en: "Variable Number" }, type: "number" },
            { id: "varnumberexpr", name: { _base: "en", en: "Variable Number Expr" }, type: "number", table: "t1" },
            { id: "vart1id", name: { _base: "en", en: "Variable T1" }, type: "id", idTable: "t1" }
        ];
        return R("div", { style: { padding: 10, marginTop: 0 } }, R(ExprComponent_1.default, {
            schema: this.state.schema,
            dataSource: this.state.dataSource,
            table: "t1",
            variables,
            types: ["text", "enum", "boolean", "date", "number", "datetime"],
            // types: ["boolean"],
            // enumValues: [{ id: "aa", name: { en: "A" }}, { id: "bb", name: { en: "B" }}]
            // idTable: "t4"
            // types: ['number', 'boolean', 'date', 'datetime', 'text', 'enum']
            // types: ["boolean"]
            // types: ['enumset']
            value: this.state.value,
            onChange: this.handleValueChange,
            aggrStatuses: ["literal", "individual"]
        }), R("br"), R("br"), R("pre", null, JSON.stringify(this.state.value, null, 2)));
    }
}
class MockPropertyEditorTestComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.handleValueChange = (value) => {
            // value = new ExprCleaner(@state.schema).cleanExpr(value) #, { type: 'boolean' })
            return this.setState({ value });
        };
        this.state = {
            value: null,
            schema: null,
            dataSource: null
        };
    }
    componentWillMount() {
        let schema = new mwater_expressions_1.Schema();
        schema = schema.addTable({
            id: "t1",
            name: { en: "T1" },
            primaryKey: "primary",
            contents: [
                { id: "text", name: { en: "Text" }, desc: { en: "Text is a bunch of characters" }, type: "text" },
                { id: "number", name: { en: "Number" }, type: "number" },
                {
                    id: "enum",
                    name: { en: "Enum" },
                    type: "enum",
                    enumValues: [
                        { id: "a", name: { en: "A" } },
                        { id: "b", name: { en: "B" } }
                    ]
                },
                {
                    id: "enumset",
                    name: { en: "EnumSet" },
                    type: "enumset",
                    enumValues: [
                        { id: "a", name: { en: "A" } },
                        { id: "b", name: { en: "B" } }
                    ]
                },
                {
                    type: "section",
                    name: { en: "Section" },
                    contents: [
                        { id: "date", name: { en: "Date" }, type: "date" },
                        { id: "datetime", name: { en: "Datetime" }, type: "datetime" }
                    ]
                },
                { id: "boolean", name: { en: "Boolean" }, type: "boolean" },
                { id: "geometry", name: { en: "Geometry" }, type: "geometry" },
                {
                    id: "1-2",
                    name: { en: "T1->T2" },
                    type: "join",
                    join: { fromColumn: "primary", toTable: "t2", toColumn: "t1", type: "1-n" }
                },
                // Expressions
                {
                    id: "expr_enum",
                    name: { en: "Expr Enum" },
                    type: "expr",
                    expr: { type: "field", table: "t1", column: "enum" }
                },
                {
                    id: "expr_number",
                    name: { en: "Expr Number" },
                    type: "expr",
                    expr: { type: "field", table: "t1", column: "number" }
                },
                { id: "expr_id", name: { en: "Expr Id" }, type: "expr", expr: { type: "id", table: "t1" } },
                {
                    id: "expr_sum",
                    name: { en: "Expr Sum" },
                    type: "expr",
                    expr: { type: "op", op: "sum", exprs: [{ type: "field", table: "t1", column: "number" }] }
                }
            ]
        });
        schema = schema.addTable({
            id: "t2",
            name: { en: "T2" },
            primaryKey: "primary",
            contents: [
                { id: "text", name: { en: "Text" }, type: "text" },
                {
                    id: "enum",
                    name: { en: "Enum" },
                    type: "enum",
                    enumValues: [
                        { id: "a", name: { en: "A" } },
                        { id: "b", name: { en: "B" } }
                    ]
                },
                { id: "number", name: { en: "Number" }, type: "number" },
                {
                    id: "2-1",
                    name: { en: "T2->T1" },
                    type: "join",
                    join: { fromColumn: "t1", toTable: "t1", toColumn: "primary", type: "n-1" }
                }
            ]
        });
        schema = schema.addTable({
            id: "t3",
            name: { en: "T3" },
            primaryKey: "primary",
            ordering: "number",
            contents: [
                { id: "text", name: { en: "Text" }, type: "text" },
                { id: "number", name: { en: "Number" }, type: "number" }
            ]
        });
        // Fake data source
        const dataSource = {
            performQuery: (query, cb) => {
                return cb(null, [
                    { value: "abc", label: "ABC" },
                    { value: "xyz", label: "XYZ" }
                ]);
            }
        };
        return this.setState({ schema, dataSource });
    }
    render() {
        if (!this.state.schema) {
            return null;
        }
        return R(PropertyListContainerComponent, {
            schema: this.state.schema,
            dataSource: this.state.dataSource,
            table: "t1"
        });
    }
}
class LiveTestComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.handleValueChange = (value) => {
            // value = new ExprCleaner(@state.schema).cleanExpr(value, { aggrStatuses: ['literal', 'aggregate']}) #, { type: 'boolean' })
            return this.setState({ value });
        };
        this.state = {
            value: null,
            schema: null,
            dataSource: null
        };
    }
    componentWillMount() {
        const client = window.location.hash ? window.location.hash.substr(1) || null : null;
        // apiUrl = "http://localhost:1234/v3/"
        const apiUrl = "https://api.mwater.co/v3/";
        return jquery_1.default.getJSON(apiUrl + `jsonql/schema?client=${client || ""}`, (schemaJson) => {
            const schema = new mwater_expressions_1.Schema(schemaJson);
            const dataSource = new MWaterDataSource(apiUrl, client, false);
            return this.setState({ schema, dataSource });
        });
    }
    render() {
        if (!this.state.schema) {
            return null;
        }
        const variables = [
            { id: "user", name: { _base: "en", en: "User" }, type: "id", idTable: "users" },
            { id: "groups", name: { _base: "en", en: "Groups" }, type: "id[]", idTable: "groups" }
        ];
        return R("div", { style: { padding: 10 } }, R(ExprComponent_1.default, {
            schema: this.state.schema,
            dataSource: this.state.dataSource,
            table: "entities.water_point",
            types: ["boolean"],
            aggrStatuses: ["individual", "literal", "aggregate"],
            // enumValues: [{ id: "aa", name: { en: "A" }}, { id: "bb", name: { en: "B" }}]
            // idTable: "t4"
            value: this.state.value,
            onChange: this.handleValueChange,
            variables
        }), 
        // R(FilterExprComponent,
        //   schema: @state.schema
        //   dataSource: @state.dataSource
        //   table: "entities.water_point"
        //   value: @state.value
        //   onChange: @handleValueChange
        // )
        R("br"), R("br"), R("pre", null, JSON.stringify(this.state.value, null, 2)));
    }
}
const expr1 = {
    type: "comparison",
    table: "t1",
    op: "=",
    lhs: { type: "field", table: "t1", column: "number" },
    rhs: { type: "literal", valueType: "integer", value: 4 }
};
const expr2 = {
    type: "comparison",
    table: "t1",
    op: "=",
    lhs: { type: "field", table: "t1", column: "number" },
    rhs: { type: "literal", valueType: "integer", value: 5 }
};
let value = { type: "logical", table: "t1", op: "and", exprs: [expr1, expr2] };
value = {
    type: "op",
    table: "entities.water_point",
    op: "within",
    exprs: [
        {
            type: "scalar",
            table: "entities.water_point",
            joins: ["admin_region"],
            expr: {
                type: "id",
                table: "admin_regions"
            }
        },
        {
            type: "literal",
            valueType: "id",
            idTable: "admin_regions",
            value: "dba202a4-95eb-47e2-8070-f872e08c3c84"
        }
    ]
};
value = null;
value = {
    type: "op",
    table: "t1",
    op: "percent where",
    exprs: [
        {
            type: "op",
            table: "t1",
            op: "= any",
            exprs: [
                {
                    type: "scalar",
                    table: "t1",
                    joins: ["1-2"],
                    expr: {
                        type: "op",
                        op: "last",
                        table: "t2",
                        exprs: [
                            {
                                type: "field",
                                table: "t2",
                                column: "enum"
                            }
                        ]
                    }
                },
                null
            ]
        }
    ]
};
//   {
//   "type": "op",
//   "table": "t1",
//   "op": "=",
//   "exprs": [
//     {
//       "type": "scalar",
//       "table": "t1",
//       "joins": [
//         "1-2"
//       ],
//       "expr": {
//         "type": "field",
//         "table": "t2",
//         "column": "number"
//       }
//     },
//     null
//   ]
// }
//   "type": "op",
//   "table": "t1",
//   "op": "contains",
//   "exprs": [
//     {
//       "type": "field",
//       "table": "t1",
//       "column": "enumset"
//     },
//     null
//   ]
// }
// value = {
//   "type": "op",
//   "op": "and",
//   "table": "t1",
//   "exprs": [
//     {
//       "type": "op",
//       "table": "t1",
//       "op": "= any",
//       "exprs": [
//         {
//           "type": "field",
//           "table": "t1",
//           "column": "enum"
//         },
//         null
//       ]
//     },
//     {
//       "type": "op",
//       "table": "t1",
//       "op": "between",
//       "exprs": [
//         {
//           "type": "field",
//           "table": "t1",
//           "column": "datetime"
//         },
//         null,
//         null
//       ]
//     }
//   ]
// }
// Caching data source for mWater. Requires jQuery
class MWaterDataSource extends mwater_expressions_2.DataSource {
    // Caching allows server to send cached results
    constructor(apiUrl, client, caching = true) {
        super();
        this.apiUrl = apiUrl;
        this.client = client;
        this.caching = caching;
    }
    performQuery(query, cb) {
        let url = this.apiUrl + "jsonql?jsonql=" + encodeURIComponent(JSON.stringify(query));
        if (this.client) {
            url += `&client=${this.client}`;
        }
        // Setup caching
        const headers = {};
        if (!this.caching) {
            headers["Cache-Control"] = "no-cache";
        }
        return jquery_1.default.ajax({ dataType: "json", url, headers })
            .done((rows) => {
            return cb(null, rows);
        })
            .fail((xhr) => {
            return cb(new Error(xhr.responseText));
        });
    }
}
const properties = [
    {
        legacyId: "7f88d07d-4dab-4d32-94df-d39d55549f90",
        type: "enum",
        entity_type: "water_point",
        id: "wo_program_type",
        name: {
            _base: "en",
            en: "Water.org Program Type"
        },
        desc: {
            _base: "en",
            en: "Water.org Program Type"
        },
        physical_quantity: null,
        ref_entity_type: null,
        deprecated: false,
        limited: null,
        limited_subst: null,
        enumValues: [
            {
                id: "watercredit",
                name: {
                    en: "WaterCredit",
                    _base: "en"
                }
            },
            {
                id: "directimpact",
                name: {
                    en: "Direct Impact",
                    _base: "en"
                }
            }
        ],
        units: null,
        unique_code: null,
        roles: [
            {
                id: "group:Water.org Water Quality",
                role: "edit"
            },
            {
                id: "user:admin",
                role: "admin"
            }
        ]
    },
    {
        legacyId: "c64df46b-96c3-4539-a5c4-f902c1cbf06c",
        type: "boolean",
        entity_type: "water_point",
        id: "wpdx_converted_fields",
        name: {
            _base: "en",
            en: "WPDX Converted fields"
        },
        desc: {
            _base: "en",
            en: "WPDX Converted fields"
        },
        physical_quantity: null,
        ref_entity_type: null,
        deprecated: true,
        limited: null,
        limited_subst: null,
        values: null,
        units: null,
        unique_code: null,
        roles: [
            {
                id: "all",
                role: "edit"
            },
            {
                id: "user:admin",
                role: "admin"
            }
        ]
    },
    {
        legacyId: "cfb1147d-54af-405c-818d-e94510177fd9",
        type: "geometry",
        entity_type: "water_point",
        id: "wpdx_country",
        name: {
            _base: "en",
            en: "WPDX Country (ISO 2-letter code)"
        },
        desc: {
            _base: "en",
            en: "WPDX Country (ISO 2-letter code)"
        },
        physical_quantity: null,
        ref_entity_type: null,
        deprecated: false,
        limited: null,
        limited_subst: null,
        values: null,
        units: null,
        unique_code: null,
        roles: [
            {
                id: "all",
                role: "edit"
            },
            {
                id: "user:admin",
                role: "admin"
            }
        ]
    },
    {
        legacyId: "b9fc3ed5-f830-4aa8-8824-965f287dbc44",
        type: "text",
        entity_type: "water_point",
        id: "wpdx_data_source",
        name: {
            _base: "en",
            en: "WPDX Data source"
        },
        desc: {
            _base: "en",
            en: "WPDX Data source"
        },
        physical_quantity: null,
        ref_entity_type: null,
        deprecated: true,
        limited: null,
        limited_subst: null,
        values: null,
        units: null,
        unique_code: null,
        roles: [
            {
                id: "all",
                role: "edit"
            },
            {
                id: "user:admin",
                role: "admin"
            }
        ]
    },
    {
        legacyId: "84a5557f-d531-4438-bb9d-801acffd7272",
        type: "date",
        entity_type: "water_point",
        id: "wpdx_date_of_data_inventory",
        name: {
            _base: "en",
            en: "Date of data inventory"
        },
        desc: {
            _base: "en",
            en: "Date of data inventory"
        },
        physical_quantity: null,
        ref_entity_type: null,
        deprecated: false,
        limited: null,
        limited_subst: null,
        values: null,
        units: null,
        unique_code: null,
        roles: [
            {
                id: "all",
                role: "edit"
            },
            {
                id: "group:mWater Staff",
                role: "admin"
            },
            {
                id: "user:admin",
                role: "admin"
            }
        ]
    },
    {
        legacyId: "a384e163-41a5-4986-bba2-b82bab31063asd",
        type: "section",
        id: "sasda3234",
        name: {
            _base: "en",
            en: "Sample Section"
        },
        desc: {
            _base: "en",
            en: "k akjsd aksjdasudha sd aksjd aksjdha k"
        },
        contents: [
            {
                legacyId: "a384e163-41a5-4986-bba2-b82bab31063e",
                type: "text",
                entity_type: "water_point",
                id: "wpdx_installer",
                name: {
                    _base: "en",
                    en: "WPDX Installer"
                },
                desc: {
                    _base: "en",
                    en: "Description for WPDX Installer"
                },
                physical_quantity: null,
                ref_entity_type: null,
                deprecated: true,
                limited: null,
                limited_subst: null,
                values: null,
                units: null,
                unique_code: null,
                roles: [
                    {
                        id: "all",
                        role: "edit"
                    },
                    {
                        id: "group:mWater Staff",
                        role: "admin"
                    },
                    {
                        id: "user:admin",
                        role: "admin"
                    }
                ]
            },
            {
                legacyId: "8a40fd46-205e-48eb-88bf-77dce043dc85",
                type: "enum",
                entity_type: "water_point",
                id: "wpdx_management_structure",
                name: {
                    _base: "en",
                    en: "WPDX Management structure"
                },
                desc: {
                    _base: "en",
                    en: "WPDX Management structure"
                },
                physical_quantity: null,
                ref_entity_type: null,
                deprecated: false,
                limited: null,
                limited_subst: null,
                enumValues: [
                    {
                        id: "direct_gov",
                        name: {
                            en: "Direct government operation",
                            _base: "en"
                        }
                    },
                    {
                        id: "private_operator",
                        name: {
                            en: "Private operator/delegated management",
                            _base: "en"
                        }
                    },
                    {
                        id: "community",
                        name: {
                            en: "Community management",
                            _base: "en"
                        }
                    },
                    {
                        id: "institutional",
                        name: {
                            en: "Institutional management",
                            _base: "en"
                        }
                    },
                    {
                        id: "other",
                        name: {
                            en: "Other",
                            _base: "en"
                        }
                    }
                ],
                units: null,
                unique_code: null,
                roles: [
                    {
                        id: "all",
                        role: "edit"
                    },
                    {
                        id: "user:admin",
                        role: "admin"
                    }
                ]
            },
            {
                legacyId: "09d1c4d9-7273-47eb-a46e-8dffb593e32d",
                type: "text",
                entity_type: "water_point",
                id: "wpdx_management_structure_other",
                name: {
                    _base: "en",
                    en: "WPDX Management Structure - Other (please specify) text"
                },
                desc: {
                    _base: "en",
                    en: "WPDX Management Structure - Other (please specify) text"
                },
                physical_quantity: null,
                ref_entity_type: null,
                deprecated: false,
                limited: null,
                limited_subst: null,
                values: null,
                units: null,
                unique_code: null,
                roles: [
                    {
                        id: "all",
                        role: "edit"
                    },
                    {
                        id: "group:mWater Staff",
                        role: "admin"
                    },
                    {
                        id: "user:admin",
                        role: "admin"
                    }
                ]
            }
        ]
    },
    {
        legacyId: "e32580ab-c877-40e0-a7b6-6e0fd00322f3",
        type: "image",
        entity_type: "water_point",
        id: "wpdx_id",
        name: {
            _base: "en",
            en: "WPDX Water point ID"
        },
        desc: {
            _base: "en",
            en: "WPDX Water point ID"
        },
        physical_quantity: null,
        ref_entity_type: null,
        deprecated: true,
        limited: null,
        limited_subst: null,
        values: null,
        units: null,
        unique_code: null,
        roles: [
            {
                id: "all",
                role: "edit"
            },
            {
                id: "user:admin",
                role: "admin"
            }
        ]
    }
];
class LiveIdLiteralTestComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: null,
            schema: null,
            dataSource: null
        };
    }
    componentWillMount() {
        // apiUrl = "http://localhost:1234/v3/"
        const apiUrl = "https://api.mwater.co/v3/";
        return jquery_1.default.getJSON(apiUrl + "jsonql/schema", (schemaJson) => {
            const schema = new mwater_expressions_1.Schema(schemaJson);
            const dataSource = new MWaterDataSource(apiUrl, null, false);
            return this.setState({ schema, dataSource });
        });
    }
    // handleValueChange: (value) =>
    //   # value = new ExprCleaner(@state.schema).cleanExpr(value, { aggrStatuses: ['literal', 'aggregate']}) #, { type: 'boolean' })
    //   @setState(value: value)
    render() {
        if (!this.state.schema) {
            return null;
        }
        return R("div", { style: { padding: 10 } }, R(ModalPopupComponent_1.default, null, R(IdLiteralComponent_1.default, {
            value: null,
            onChange: (val) => alert(val),
            idTable: "admin_regions",
            schema: this.state.schema,
            dataSource: this.state.dataSource
        })), 
        // R(FilterExprComponent,
        //   schema: @state.schema
        //   dataSource: @state.dataSource
        //   table: "entities.water_point"
        //   value: @state.value
        //   onChange: @handleValueChange
        // )
        R("br"), R("br"), R("pre", null, JSON.stringify(this.state.value, null, 2)));
    }
}
