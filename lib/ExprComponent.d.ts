import PropTypes from "prop-types";
import React from "react";
interface ExprComponentProps {
    schema: any;
    /** Data source to use to get values */
    dataSource: any;
    /** Current table. null for literal only */
    table?: string;
    /** Current expression value */
    value?: any;
    /** Called with new expression */
    onChange?: any;
    /** Array of variables to allow selecting */
    variables?: any;
    /** If specified, the types (value type) of expression required. e.g. ["boolean"] */
    types?: any;
    /** Array of { id:, name: } of enum values that can be selected. Only when type = "enum" */
    enumValues?: any;
    /** If specified the table from which id-type expressions must come */
    idTable?: string;
    /** True to prefer literal expressions */
    preferLiteral?: boolean;
    /** statuses of aggregation to allow. list of "individual", "literal", "aggregate". Default: ["individual", "literal"] or ["literal"] for no table */
    aggrStatuses?: any;
    /** placeholder for empty value */
    placeholder?: string;
}
export default class ExprComponent extends React.Component<ExprComponentProps> {
    static defaultProps: {
        aggrStatuses: string[];
    };
    static contextTypes: {
        locale: PropTypes.Requireable<string>;
    };
    openEditor: () => any;
    handleChange: (expr: any) => any;
    cleanExpr(expr: any): import("mwater-expressions").Expr;
    render(): any;
}
export {};
