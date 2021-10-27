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
                return R("a", { onClick: this.handleClick, style: { cursor: "pointer", fontStyle: "italic", color: "var(--bs-primary)" } }, this.props.onChange ? this.props.placeholder : "None");
            }
            else {
                return R("div", { className: "link-component-readonly", style: { fontStyle: "italic" } }, "None");
            }
        };
        // Display summary if field
        this.renderField = () => {
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
                        return this.setState({ modalVisible: true });
                    }
                    else {
                        return this.props.onChange(null);
                    }
                }
            }, exprUtils.summarizeExpr(this.props.value));
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
        })());
    }
}
exports.default = ExprLinkComponent;
ExprLinkComponent.propTypes = {
    schema: prop_types_1.default.object.isRequired,
    dataSource: prop_types_1.default.object.isRequired,
    variables: prop_types_1.default.array.isRequired,
    table: prop_types_1.default.string,
    value: prop_types_1.default.object,
    onChange: prop_types_1.default.func,
    // Props to narrow down choices
    types: prop_types_1.default.array,
    enumValues: prop_types_1.default.array,
    idTable: prop_types_1.default.string,
    initialMode: prop_types_1.default.oneOf(["field", "formula", "literal"]),
    allowCase: prop_types_1.default.bool,
    aggrStatuses: prop_types_1.default.array,
    refExpr: prop_types_1.default.object,
    placeholder: prop_types_1.default.string,
    booleanOnly: prop_types_1.default.bool // Hint that must be boolean (even though boolean can take any type)
};
ExprLinkComponent.contextTypes = { locale: prop_types_1.default.string };
ExprLinkComponent.defaultProps = {
    placeholder: "Select...",
    initialMode: "field",
    aggrStatuses: ["individual", "literal"]
};
