import PropTypes from "prop-types";
import React from "react";
import { BuildEnumsetExpr, DataSource, EnumValue, Expr, Schema } from "mwater-expressions";
import RemovableComponent from "./RemovableComponent";
interface BuildEnumsetExprComponentProps {
    schema: Schema;
    /** Data source to use to get values */
    dataSource: DataSource;
    /** Current expression value */
    value: BuildEnumsetExpr;
    /** enum values. Can't display without them */
    enumValues?: EnumValue[];
    /** Called with new expression */
    onChange: (value: Expr) => void;
}
export default class BuildEnumsetExprComponent extends React.Component<BuildEnumsetExprComponentProps> {
    static contextTypes: {
        locale: PropTypes.Requireable<string>;
    };
    handleValueChange: (id: any, value: any) => void;
    renderValues(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement>;
    render(): React.CElement<import("./RemovableComponent").RemovableComponentProps, RemovableComponent>;
}
export {};
