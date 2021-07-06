import React from "react";
interface TextArrayComponentProps {
    value?: any;
    onChange: any;
    /** Expression for the text values to select from */
    refExpr: any;
    /** Schema of the database */
    schema: any;
    dataSource: any;
}
export default class TextArrayComponent extends React.Component<TextArrayComponentProps> {
    focus(): any;
    handleChange: (value: any) => any;
    escapeRegex(s: any): any;
    loadOptions: (input: any, cb: any) => void;
    render(): React.DetailedReactHTMLElement<{
        style: {
            width: string;
        };
    }, HTMLElement>;
}
export {};
