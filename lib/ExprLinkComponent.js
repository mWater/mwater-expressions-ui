"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prop_types_1 = __importDefault(require("prop-types"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const SelectExprModalComponent_1 = __importDefault(require("./SelectExprModalComponent"));
const LinkComponent_1 = __importDefault(require("./LinkComponent"));
const mwater_expressions_1 = require("mwater-expressions");
const LiteralExprStringComponent_1 = __importDefault(require("./LiteralExprStringComponent"));
// Allows user to select an expression or display an existing one. Shows as a link
class ExprLinkComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        // Opens the editor modal
        this.showModal = () => {
            return this.setState({ modalVisible: true });
        };
        this.handleClick = () => {
            return this.setState({ modalVisible: true });
        };
        // Display placeholder if no value. If readonly, use "None" instead of "Select..."
        this.renderNone = () => {
            if (this.props.onChange) {
                return R("a", { onClick: this.handleClick, style: { cursor: "pointer", fontStyle: "italic", color: "var(--bs-primary)" } }, this.props.placeholder ? this.props.placeholder : "None");
            }
            else {
                return R("div", { className: "link-component-readonly", style: { fontStyle: "italic" } }, "None");
            }
        };
        // Display summary if field
        this.renderField = () => {
            var _a;
            const exprUtils = new mwater_expressions_1.ExprUtils(this.props.schema);
            return R(LinkComponent_1.default, {
                dropdownItems: this.props.onChange
                    ? [
                        { id: "edit", name: [R("i", { className: "fa fa-pencil text-muted" }), " Edit"] },
                        { id: "remove", name: [R("i", { className: "fa fa-remove text-muted" }), " Remove"] }
                    ]
                    : undefined,
                onDropdownItemClicked: (id) => {
                    if (id === "edit") {
                        this.setState({ modalVisible: true });
                    }
                    else {
                        this.props.onChange(null);
                    }
                }
            }, exprUtils.summarizeExpr((_a = this.props.value) !== null && _a !== void 0 ? _a : null));
        };
        this.renderLiteral = () => {
            return R(LinkComponent_1.default, {
                dropdownItems: this.props.onChange
                    ? [
                        { id: "edit", name: [R("i", { className: "fa fa-pencil text-muted" }), " Edit"] },
                        { id: "remove", name: [R("i", { className: "fa fa-remove text-muted" }), " Remove"] }
                    ]
                    : undefined,
                onDropdownItemClicked: (id) => {
                    if (id === "edit") {
                        return this.setState({ modalVisible: true });
                    }
                    else {
                        return this.props.onChange(null);
                    }
                }
            }, R(LiteralExprStringComponent_1.default, {
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                value: this.props.value,
                enumValues: this.props.enumValues
            }));
        };
        this.state = {
            modalVisible: false
        };
    }
    render() {
        let { initialMode } = this.props;
        // Override if already has value
        if (this.props.value) {
            if (["field", "scalar"].includes(this.props.value.type)) {
                initialMode = "field";
            }
            else if (this.props.value.type === "literal") {
                initialMode = "literal";
            }
            else {
                initialMode = "formula";
            }
        }
        return R("div", null, this.state.modalVisible
            ? R(SelectExprModalComponent_1.default, {
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                table: this.props.table,
                value: this.props.value,
                variables: this.props.variables,
                types: this.props.types,
                enumValues: this.props.enumValues,
                idTable: this.props.idTable,
                initialMode,
                allowCase: this.props.allowCase,
                aggrStatuses: this.props.aggrStatuses,
                refExpr: this.props.refExpr,
                booleanOnly: this.props.booleanOnly,
                onCancel: () => {
                    return this.setState({ modalVisible: false });
                },
                onSelect: (expr) => {
                    this.setState({ modalVisible: false });
                    return this.props.onChange(expr);
                }
            })
            : undefined, (() => {
            if (!this.props.value) {
                return this.renderNone();
            }
            else if (this.props.value.type === "field") {
                return this.renderField();
            }
            else if (this.props.value.type === "literal") {
                return this.renderLiteral();
            }
            return null;
        })());
    }
}
exports.default = ExprLinkComponent;
ExprLinkComponent.contextTypes = { locale: prop_types_1.default.string };
ExprLinkComponent.defaultProps = {
    placeholder: "Select...",
    initialMode: "field",
    aggrStatuses: ["individual", "literal"]
};
