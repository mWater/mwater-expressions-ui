import PropTypes from "prop-types";
import React from "react";
import { AggrStatus, DataSource, EnumValue, Expr, LiteralType, Schema, Variable } from "mwater-expressions";
interface ExprComponentProps {
    schema: Schema;
    /** Data source to use to get values */
    dataSource: DataSource;
    /** Current table. undefined for literal only */
    table?: string;
    /** Current expression value */
    value: Expr;
    /** Called with new expression */
    onChange?: (expr: Expr) => void;
    /** Variables that are available to be selected */
    variables?: Variable[];
    /** If specified, the types (value type) of expression required. e.g. ["boolean"] */
    types?: LiteralType[];
    /** Array of { id:, name: } of enum values that can be selected. Only when type = "enum" */
    enumValues?: EnumValue[];
    /** If specified the table from which id-type expressions must come */
    idTable?: string;
    /** True to prefer literal expressions */
    preferLiteral?: boolean;
    /** statuses of aggregation to allow. list of "individual", "literal", "aggregate". Default: ["individual", "literal"] or ["literal"] for no table */
    aggrStatuses?: AggrStatus[];
    /** placeholder for empty value */
    placeholder?: string;
}
export default class ExprComponent extends React.Component<ExprComponentProps> {
    static contextTypes: {
        locale: PropTypes.Requireable<string>;
    };
    exprLink: any;
    openEditor: () => any;
    handleChange: (expr: any) => void;
    cleanExpr(expr: any): Expr;
    render(): any;
}
export {};
