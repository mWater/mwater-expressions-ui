import PropTypes from "prop-types";
import React from "react";
interface SelectVariableExprComponentProps {
    /** Current expression value */
    value?: any;
    /** Called with new expression */
    onChange: any;
    variables: any;
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
