"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
// Edits a localized string (_base: "en", en: "fsdfasd", fr: "wersdf", etc)
class LocalizedStringEditorComp extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.handleRemoveValue = () => {
            const names = lodash_1.default.clone(this.props.value || {});
            delete names[this.state.selectedLanguageCode];
            return this.props.onChange(names);
        };
        this.handleChangeValue = (ev) => {
            if (this.props.readonly) {
                return;
            }
            const newValue = ev.target.value;
            const currentValue = this.props.value && this.props.value[this.state.selectedLanguageCode];
            // If there is currently a value for that language code
            if (currentValue != null && currentValue !== "") {
                // If the text field is empty
                if (newValue == null || newValue === "") {
                    // Remove that entry
                    this.handleRemoveValue();
                    return;
                }
            }
            // Fire change
            const names = lodash_1.default.clone(this.props.value || { _base: "en" });
            names[this.state.selectedLanguageCode] = newValue;
            if (!names._base) {
                names._base = this.state.selectedLanguageCode;
            }
            return this.props.onChange(names);
        };
        this.onLanguageSelectionClick = (languageCode) => {
            return this.setState({ selectedLanguageCode: languageCode });
        };
        this.state = { selectedLanguageCode: "en" }; // True to allow multiple lines
    }
    render() {
        let currentText, placeholder;
        if (this.props.value) {
            currentText = this.props.value[this.state.selectedLanguageCode];
            placeholder = null;
            if (this.state.selectedLanguageCode !== this.props.value._base) {
                placeholder = this.props.value[this.props.value._base];
            }
        }
        else {
            placeholder = this.props.placeholder;
        }
        const availableLanguages = this.props.availableLanguages || [
            { id: "en", name: "English" },
            { id: "fr", name: "Français" },
            { id: "es", name: "Español" },
            { id: "pt", name: "Português" },
            { id: "sw", name: "Kiswahili" },
            { id: "tet", name: "Tetum" },
            { id: "id", name: "Bahasa Indonesia" },
            { id: "ht", name: "Créole Haïtien" },
            { id: "my", name: "Burmese" },
            { id: "km", name: "Khmer" },
            { id: "am", name: "Amharic" },
            { id: "hi", name: "Hindi" },
            { id: "bn", name: "Bangla" },
            { id: "rw", name: "Kinyarwanda" },
            { id: "ne", name: "Nepali" },
            { id: "sd", name: "Sindhi" },
            { id: "ur", name: "Urdu" },
            { id: "so", name: "Somali" },
            { id: "de", name: "German" },
            { id: "it", name: "Italian" },
            { id: "ja", name: "Japanese" }
        ];
        return R("div", { className: "input-group" }, this.props.multiline
            ? R("textarea", {
                className: "form-control",
                rows: 5,
                onChange: this.handleChangeValue,
                value: currentText || "",
                placeholder
            })
            : R("input", {
                type: "text",
                className: "form-control",
                onChange: this.handleChangeValue,
                value: currentText || "",
                placeholder
            }), R("button", { type: "button", className: "btn btn-secondary dropdown-toggle", "data-bs-toggle": "dropdown" }, this.state.selectedLanguageCode), R("ul", { className: "dropdown-menu dropdown-menu-end" }, R("li", { className: "dropdown-header" }, "Select Language to Edit"), lodash_1.default.map(availableLanguages, (availableLanguage) => {
            return R("li", null, R("a", { className: "dropdown-item", onClick: this.onLanguageSelectionClick.bind(null, availableLanguage.id) }, availableLanguage.name));
        })));
    }
}
exports.default = LocalizedStringEditorComp;
