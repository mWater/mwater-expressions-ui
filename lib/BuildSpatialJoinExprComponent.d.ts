/// <reference types="react" />
import { DataSource, LiteralType, Schema, OldSpatialJoinExpr } from "mwater-expressions";
/** Expression builder for a spatial join. Uses a popup for editing */
export declare const BuildSpatialJoinExprComponent: (props: {
    schema: Schema;
    dataSource: DataSource;
    value: OldSpatialJoinExpr;
    types?: LiteralType[] | undefined;
    onChange: (value: OldSpatialJoinExpr) => void;
}) => JSX.Element;
