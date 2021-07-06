import PropTypes from "prop-types";
import React from "react";
import { DataSource, EnumValue, LiteralExpr, Schema } from "mwater-expressions";
import AsyncLoadComponent from "react-library/lib/AsyncLoadComponent";
interface LiteralExprStringComponentProps {
    schema: Schema;
    /** Data source to use to get values */
    dataSource: DataSource;
    /** Current expression value */
    value: LiteralExpr;
    /** Array of { id:, name: } of enum values that can be selected. Only when type = "enum" */
    enumValues?: EnumValue[];
    /** e.g "en" */
    locale?: string;
}
interface LiteralExprStringComponentState {
    label: string;
}
export default class LiteralExprStringComponent extends AsyncLoadComponent<LiteralExprStringComponentProps, LiteralExprStringComponentState> {
    static contextTypes: {
        locale: PropTypes.Requireable<string>;
    };
    isLoadNeeded(newProps: any, oldProps: any): boolean;
    load(props: any, prevProps: any, callback: any): any;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
export {};
