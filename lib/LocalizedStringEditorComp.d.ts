import React from "react";
interface LocalizedStringEditorCompProps {
    value?: any;
    onChange: any;
    /** Contains id and name of languages */
    availableLanguages?: any;
    readonly?: boolean;
    multiline?: boolean;
}
interface LocalizedStringEditorCompState {
    selectedLanguageCode: any;
}
export default class LocalizedStringEditorComp extends React.Component<LocalizedStringEditorCompProps, LocalizedStringEditorCompState> {
    constructor(props: any);
    handleRemoveValue: () => any;
    handleChangeValue: (ev: any) => any;
    onLanguageSelectionClick: (languageCode: any) => void;
    render(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement>;
}
export {};
