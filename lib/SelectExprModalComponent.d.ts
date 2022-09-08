import PropTypes from "prop-types";
import React from "react";
import { AggrStatus, DataSource, EnumValue, Expr, LiteralType, Schema, Variable } from "mwater-expressions";
import ModalWindowComponent from "react-library/lib/ModalWindowComponent";
export interface SelectExprModalComponentProps {
    /** Called with new expression */
    onSelect: (expr: Expr) => void;
    onCancel: () => void;
    /** Variables that are available to be selected */
    variables?: Variable[];
    /** Current table. undefined for literal only */
    table?: string;
    /** Current expression value */
    value: Expr;
    /** If specified, the types (value type) of expression required. e.g. ["boolean"] */
    types?: LiteralType[];
    /** Array of { id:, name: } of enum values that can be selected. Only when type = "enum" */
    enumValues?: EnumValue[];
    /** If specified the table from which id-type expressions must come */
    idTable?: string;
    /** Initial mode. Default "field" unless no table, then "literal" */
    initialMode?: "field" | "formula" | "literal";
    /** Allow case statements */
    allowCase?: boolean;
    /** statuses of aggregation to allow. list of "individual", "literal", "aggregate". Default: ["individual", "literal"] */
    aggrStatuses?: AggrStatus[];
    /** expression to get values for (used for literals). This is primarily for text fields to allow easy selecting of literal values */
    refExpr?: Expr;
    /** Hint that must be boolean (even though boolean can take any type) */
    booleanOnly?: boolean;
    /** placeholder for empty value */
    placeholder?: string;
    schema: Schema;
    /** Data source to use to get values */
    dataSource: DataSource;
    /** True to prefer literal expressions */
    preferLiteral?: boolean;
}
export default class SelectExprModalComponent extends React.Component<SelectExprModalComponentProps> {
    static contextTypes: {
        locale: PropTypes.Requireable<string>;
    };
    static defaultProps: Partial<SelectExprModalComponentProps>;
    renderContents(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    render(): React.CElement<import("react-library/lib/ModalWindowComponent").ModalWindowComponentProps, ModalWindowComponent>;
}
