import PropTypes from "prop-types";
import React from "react";
import { Expr, Variable } from "mwater-expressions";
interface SelectVariableExprComponentProps {
    /** Current expression value */
    value?: Expr;
    /** Called with new expression */
    onChange: any;
    variables: Variable[];
    /** Props to narrow down choices */
    types?: any;
    /** Array of { id:, name: } of enum values that can be selected. Only when type = "enum" */
    enumValues?: any;
    /** If specified the table from which id-type expressions must come */
    idTable?: string;
}
export default class SelectVariableExprComponent extends React.Component<SelectVariableExprComponentProps> {
    static contextTypes: {
        locale: PropTypes.Requireable<string>;
    };
    render(): React.DetailedReactHTMLElement<{
        style: {
            paddingTop: number;
        };
    }, HTMLElement>;
}
export {};
