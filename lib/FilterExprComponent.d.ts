import PropTypes from "prop-types";
import React from "react";
import { Schema, DataSource, Variable, Expr } from "mwater-expressions";
import ExprLinkComponent from "./ExprLinkComponent";
interface FilterExprComponentProps {
    schema: Schema;
    dataSource: DataSource;
    variables?: Variable[];
    /** Current table */
    table: string;
    /** Current value */
    value?: Expr;
    /** Called with new expression */
    onChange?: (expr: Expr) => void;
    /** Label for adding item. Default "+ Add Label" */
    addLabel?: React.ReactNode;
}
interface FilterExprComponentState {
    displayNull: any;
}
/** Displays a boolean filter expression. Just shows "+ Add filter" (or other add label) when empty */
export default class FilterExprComponent extends React.Component<FilterExprComponentProps, FilterExprComponentState> {
    static contextTypes: {
        locale: PropTypes.Requireable<string>;
    };
    static defaultProps: {
        addLabel: string;
        variables: never[];
    };
    newExpr: ExprLinkComponent | null | undefined;
    constructor(props: FilterExprComponentProps);
    handleAddFilter: () => void;
    handleChange: (expr: any) => void;
    cleanExpr(expr: any): Expr;
    handleAndChange: (i: any, expr: any) => void;
    handleAndRemove: (i: any) => void;
    handleRemove: () => void;
    renderAddFilter(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement> | React.CElement<any, any>;
}
export {};
