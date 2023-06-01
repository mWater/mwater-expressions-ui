import PropTypes from "prop-types";
import React from "react";
import LinkComponent from "./LinkComponent";
import { AggrStatus, DataSource, EnumValue, Expr, LiteralType, Schema, Variable } from "mwater-expressions";
export interface ExprLinkComponentProps {
    schema: Schema;
    /** Data source to use to get values */
    dataSource: DataSource;
    variables: Variable[];
    /** Current table */
    table?: string;
    /** Current expression value */
    value?: Expr;
    onChange?: (value: Expr) => void;
    /** If specified, the types (value type) of expression required. e.g. ["boolean"] */
    types?: LiteralType[];
    /** Array of { id:, name: } of enum values that can be selected. Only when type = "enum" */
    enumValues?: EnumValue[];
    /** If specified the table from which id-type expressions must come */
    idTable?: string;
    /** Initial mode. Default field */
    initialMode?: "field" | "formula" | "literal";
    /** Allow case statements */
    allowCase?: boolean;
    /** Statuses of aggregation to allow. list of "individual", "literal", "aggregate". Default: ["individual", "literal"] */
    aggrStatuses?: AggrStatus[];
    /** expression to get values for (used for literals). This is primarily for text fields to allow easy selecting of literal values */
    refExpr?: Expr;
    /** Placeholder text (default Select...) */
    placeholder?: string;
    /** Hint that must be boolean (even though boolean can take any type) */
    booleanOnly?: boolean;
}
export default class ExprLinkComponent extends React.Component<ExprLinkComponentProps, {
    modalVisible: boolean;
}> {
    static contextTypes: {
        locale: PropTypes.Requireable<string>;
    };
    static defaultProps: {
        placeholder: string;
        initialMode: string;
        aggrStatuses: string[];
    };
    constructor(props: any);
    showModal: () => void;
    handleClick: () => void;
    renderNone: () => React.DetailedReactHTMLElement<{
        onClick: () => void;
        style: {
            cursor: "pointer";
            fontStyle: "italic";
            color: "var(--bs-primary)";
            backgroundColor: "var(--bs-gray-200)";
            borderRadius: number;
            paddingLeft: number;
            paddingRight: number;
            paddingTop: number;
            paddingBottom: number;
        };
    }, HTMLElement> | React.DetailedReactHTMLElement<{
        className: string;
        style: {
            fontStyle: "italic";
        };
    }, HTMLElement>;
    renderField: () => React.CElement<import("./LinkComponent").LinkComponentProps, LinkComponent>;
    renderLiteral: () => React.CElement<import("./LinkComponent").LinkComponentProps, LinkComponent>;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
