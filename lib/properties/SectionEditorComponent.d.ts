import React from "react";
interface SectionEditorComponentProps {
    /** The property being edited */
    property: any;
    /** Function called when anything is changed in the editor */
    onChange: any;
    /** Features to be enabled apart from the default features */
    features?: any;
}
export default class SectionEditorComponent extends React.Component<SectionEditorComponentProps> {
    static defaultProps: {
        features: never[];
    };
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
export {};
