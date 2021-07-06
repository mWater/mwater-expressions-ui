import React from "react";
interface InlineExprsEditorComponentProps {
    /** Schema to use */
    schema: any;
    /** Data source to use to get values */
    dataSource: any;
    /** Current table */
    table: string;
    /** Text with embedded expressions as {0}, {1}, etc. */
    text?: string;
    /** Expressions that correspond to {0}, {1}, etc. */
    exprs?: any;
    /** Called with (text, exprs) */
    onChange: any;
    /** Allow multiple lines */
    multiline?: boolean;
    /** Optional number of lines */
    rows?: number;
}
export default class InlineExprsEditorComponent extends React.Component<InlineExprsEditorComponentProps> {
    static defaultProps: {
        exprs: never[];
    };
    handleInsertClick: () => any;
    handleInsert: (expr: any) => any;
    handleUpdate: (expr: any, index: any) => any;
    handleClick: (ev: any) => any;
    handleChange: (elem: any) => any;
    createExprHtml(expr: any, index: any): string;
    createContentEditableHtml(): string;
    renderInsertModal(): React.CElement<any, any>;
    renderUpdateModal(): React.CElement<any, any>;
    render(): React.DetailedReactHTMLElement<{
        style: {
            position: "relative";
        };
    }, HTMLElement>;
}
export {};
