"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const lodash_1 = __importDefault(require("lodash"));
const bootstrap_1 = __importDefault(require("react-library/lib/bootstrap"));
const LocalizedStringEditorComp_1 = __importDefault(require("../LocalizedStringEditorComp"));
const IdFieldComponent_1 = __importDefault(require("./IdFieldComponent"));
// edit section
class SectionEditorComponent extends react_1.default.Component {
    render() {
        let value, ev;
        return R("div", null, 
        // todo: validate id
        // Sections need an id
        (() => {
            if (lodash_1.default.includes(this.props.features, "idField")) {
                R(IdFieldComponent_1.default, {
                    value: this.props.property.id,
                    onChange: (value) => this.props.onChange(lodash_1.default.extend({}, this.props.property, { id: value }))
                });
                return R(bootstrap_1.default.FormGroup, { label: "ID" }, R("input", {
                    type: "text",
                    className: "form-control",
                    value: this.props.property.id,
                    onChange: (ev) => this.props.onChange(lodash_1.default.extend({}, this.props.property, { id: ev.target.value }))
                }), R("p", { className: "help-block" }, "Letters lowercase, numbers and _ only. No spaces or uppercase"));
            }
        })(), lodash_1.default.includes(this.props.features, "code")
            ? R(bootstrap_1.default.FormGroup, { label: "Code" }, R("input", {
                type: "text",
                className: "form-control",
                value: this.props.property.code,
                onChange: (ev) => this.props.onChange(lodash_1.default.extend({}, this.props.property, { code: ev.target.value }))
            }))
            : undefined, R(bootstrap_1.default.FormGroup, { label: "Name" }, R(LocalizedStringEditorComp_1.default, {
            value: this.props.property.name,
            onChange: (value) => this.props.onChange(lodash_1.default.extend({}, this.props.property, { name: value }))
        })), R(bootstrap_1.default.FormGroup, { label: "Description" }, R(LocalizedStringEditorComp_1.default, {
            value: this.props.property.desc,
            onChange: (value) => this.props.onChange(lodash_1.default.extend({}, this.props.property, { desc: value }))
        })));
    }
}
exports.default = SectionEditorComponent;
SectionEditorComponent.defaultProps = { features: [] };
