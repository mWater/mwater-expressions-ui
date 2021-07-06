import PropTypes from "prop-types";
import React from "react";
interface BuildEnumsetExprComponentProps {
    schema: any;
    /** Data source to use to get values */
    dataSource: any;
    /** Current expression value */
    value?: any;
    /** enum values. Can't display without them */
    enumValues?: any;
    /** Called with new expression */
    onChange?: any;
}
export default class BuildEnumsetExprComponent extends React.Component<BuildEnumsetExprComponentProps> {
    static contextTypes: {
        locale: PropTypes.Requireable<string>;
    };
    handleValueChange: (id: any, value: any) => any;
    renderValues(): any;
    render(): any;
}
export {};
