import React, { ReactNode } from "react";
import { default as AsyncReactSelect } from "react-select/async-creatable";
import { DataSource, Expr, Schema } from "mwater-expressions";
export interface RefTextComponentProps {
    value?: Expr;
    onChange: (value: Expr) => void;
    /** Type of expression (text or text[]) */
    type: "text" | "text[]";
    /** Expression for the text values to select from */
    refExpr: Expr;
    /** Schema of the database */
    schema: Schema;
    /** Data source to use */
    dataSource: DataSource;
}
/** Displays a combo box that allows selecting single text values from an expression */
export default class RefTextComponent extends React.Component<RefTextComponentProps> {
    select: AsyncReactSelect<any, boolean> | null;
    focus(): void;
    handleChange: (value: any) => void;
    escapeRegex(s: any): any;
    loadOptions: (input: string, cb: (rows: {
        value: string;
        label: ReactNode;
    }[]) => void) => void;
    render(): React.DetailedReactHTMLElement<{
        style: {
            width: string;
        };
    }, HTMLElement>;
}
