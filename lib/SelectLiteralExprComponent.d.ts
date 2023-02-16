import React from "react";
import { DataSource, EnumValue, Expr, LiteralExpr, LiteralType, Schema } from "mwater-expressions";
export interface SelectLiteralExprComponentProps {
    /** Current expression value */
    value?: any;
    /** Called with new expression */
    onChange: (value: LiteralExpr | null) => void;
    /** Called to cancel */
    onCancel: () => void;
    schema: Schema;
    dataSource: DataSource;
    /** Props to narrow down choices */
    types?: LiteralType[];
    /** Array of { id:, name: } of enum values that can be selected. Only when type = "enum" */
    enumValues?: EnumValue[];
    /** If specified the table from which id-type expressions must come */
    idTable?: string;
    refExpr?: Expr;
}
interface SelectLiteralExprComponentState {
    inputText: string | null;
    value: any;
    inputTextError: any;
    changed: any;
}
export default class SelectLiteralExprComponent extends React.Component<SelectLiteralExprComponentProps, SelectLiteralExprComponentState> {
    constructor(props: SelectLiteralExprComponentProps);
    handleChange: (value: any) => void;
    handleDateSelected: (date: any) => void;
    handleDateTimeSelected: (datetime: any) => void;
    handleAccept: () => void;
    handleTextChange: (ev: any) => void;
    renderTextBox(): React.DetailedReactHTMLElement<{
        className: string | undefined;
    }, HTMLElement>;
    renderInput(): JSX.Element;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
export {};
