import PropTypes from "prop-types";
import React from "react";
interface FilterExprComponentProps {
    schema: any;
    /** Data source to use to get values */
    dataSource: any;
    variables?: any;
    /** Current table */
    table: string;
    /** Current value */
    value?: any;
    /** Called with new expression */
    onChange?: any;
    /** Label for adding item. Default "+ Add Label" */
    addLabel?: any;
}
interface FilterExprComponentState {
    displayNull: any;
}
export default class FilterExprComponent extends React.Component<FilterExprComponentProps, FilterExprComponentState> {
    static contextTypes: {
        locale: PropTypes.Requireable<string>;
    };
    static defaultProps: {
        addLabel: string;
        variables: never[];
    };
    constructor(props: any);
    handleAddFilter: () => void;
    handleChange: (expr: any) => any;
    cleanExpr(expr: any): import("mwater-expressions").Expr;
    handleAndChange: (i: any, expr: any) => any;
    handleAndRemove: (i: any) => any;
    handleRemove: () => any;
    renderAddFilter(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement> | React.CElement<any, any>;
}
export {};
