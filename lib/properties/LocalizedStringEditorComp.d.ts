import { LocalizedString } from "mwater-expressions";
import React from "react";
export interface LocalizedStringEditorCompProps {
    value?: LocalizedString;
    onChange: (str: LocalizedString) => void;
    availableLanguages?: Array<{
        id: string;
        name: string;
    }>;
    readonly?: boolean;
    multiline?: boolean;
    placeholder?: string;
}
interface LocalizedStringEditorCompState {
    selectedLanguageCode: any;
}
export default class LocalizedStringEditorComp extends React.Component<LocalizedStringEditorCompProps, LocalizedStringEditorCompState> {
    constructor(props: any);
    handleRemoveValue: () => void;
    handleChangeValue: (ev: any) => void;
    onLanguageSelectionClick: (languageCode: any) => void;
    render(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement>;
}
export {};
