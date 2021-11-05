import React from "react";
import { default as AsyncReactSelect } from "react-select/async";
import { DataSource, Expr, Schema } from "mwater-expressions";
interface TextArrayComponentProps {
    value?: any;
    onChange: any;
    /** Expression for the text values to select from */
    refExpr: Expr;
    /** Schema of the database */
    schema: Schema;
    /** Data source to use */
    dataSource: DataSource;
}
/** Displays a combo box that allows selecting multiple text values from an expression */
export default class TextArrayComponent extends React.Component<TextArrayComponentProps> {
    select: AsyncReactSelect<any, boolean> | null;
    focus(): void;
    handleChange: (value: any) => void;
    escapeRegex(s: any): any;
    loadOptions: (input: any, cb: any) => void;
    render(): React.DetailedReactHTMLElement<{
        style: {
            width: string;
        };
    }, HTMLElement>;
}
export {};
