import PropTypes from "prop-types";
import React from "react";
import { DataSource, EnumValue, Expr, Schema } from "mwater-expressions";
import DateTimePickerComponent from "./DateTimePickerComponent";
import IdLiteralComponent from "./IdLiteralComponent";
import { Toggle } from "react-library/lib/bootstrap";
import RefTextComponent from "./RefTextComponent";
interface SelectLiteralExprComponentProps {
    /** Current expression value */
    value?: any;
    /** Called with new expression */
    onChange: any;
    /** Called to cancel */
    onCancel: any;
    schema: Schema;
    dataSource: DataSource;
    /** Props to narrow down choices */
    types?: any;
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
    handleAccept: () => any;
    handleTextChange: (ev: any) => void;
    renderTextBox(): React.DetailedReactHTMLElement<{
        className: string | undefined;
    }, HTMLElement>;
    renderInput(): React.CElement<{
        value: unknown;
        onChange?: ((value: unknown) => void) | undefined;
        options: {
            value: unknown;
            label: React.ReactNode;
        }[];
        size?: "sm" | "xs" | "lg" | undefined;
        allowReset?: boolean | undefined;
    }, Toggle<unknown>> | React.CElement<import("./RefTextComponent").RefTextComponentProps, RefTextComponent> | React.CElement<EnumAsListComponentProps, EnumAsListComponent> | React.CElement<EnumsetAsListComponentProps, EnumsetAsListComponent> | React.CElement<import("./IdLiteralComponent").IdLiteralComponentProps, IdLiteralComponent> | React.DetailedReactHTMLElement<{
        className: string | undefined;
    }, HTMLElement> | React.CElement<import("./DateTimePickerComponent").DateTimePickerComponentProps, DateTimePickerComponent>;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
interface EnumAsListComponentProps {
    value?: any;
    onChange: any;
    /** Array of id and name (localized string) */
    enumValues: EnumValue[];
}
declare class EnumAsListComponent extends React.Component<EnumAsListComponentProps> {
    static contextTypes: {
        locale: PropTypes.Requireable<string>;
    };
    handleChange: (val: any) => any;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
interface EnumsetAsListComponentProps {
    value?: any;
    onChange: any;
    /** Array of id and name (localized string) */
    enumValues: EnumValue[];
}
declare class EnumsetAsListComponent extends React.Component<EnumsetAsListComponentProps> {
    static contextTypes: {
        locale: PropTypes.Requireable<string>;
    };
    handleToggle: (val: any) => any;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
export {};
