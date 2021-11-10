import React from "react";
import { DataSource, Schema } from "mwater-expressions";
import AsyncLoadComponent from "react-library/lib/AsyncLoadComponent";
import { JsonQLExpr } from "jsonql";
export interface IdLiteralComponentProps {
    /** Value of primary key or array of primary keys */
    value: string | string[] | number | number[] | null | undefined;
    /** Called with primary key or array of primary keys */
    onChange: (value: string | string[] | number | number[] | null) => void;
    idTable: string;
    /** Schema of the database */
    schema: Schema;
    /** Data source to use to get values */
    dataSource: DataSource;
    /** Placeholder to display */
    placeholder?: string;
    /** Optional extra orderings. Put "main" as tableAlias. JsonQL */
    orderBy?: any;
    /** Allow multiple values (id[] type) */
    multi?: boolean;
    /** Optional extra filter. Put "main" as tableAlias. JsonQL   */
    filter?: JsonQLExpr;
    /** Optional label expression to use. Will fallback to label column or primary key. Put "main" as tableAlias. JsonQL */
    labelExpr?: JsonQLExpr;
    /** Allow searching anywhere in label, not just start */
    searchWithin?: boolean;
}
export default class IdLiteralComponent extends AsyncLoadComponent<IdLiteralComponentProps, {
    currentValue: any;
    loading: boolean;
}> {
    select?: any;
    focus(): any;
    isLoadNeeded(newProps: any, oldProps: any): boolean;
    load(props: any, prevProps: any, callback: any): any;
    handleChange: (value: any) => void;
    getLabelExpr(): JsonQLExpr;
    loadOptions: (input: any, cb: any) => void;
    render(): React.DetailedReactHTMLElement<{
        style: {
            width: string;
        };
    }, HTMLElement>;
}
