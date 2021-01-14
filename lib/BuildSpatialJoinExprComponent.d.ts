/// <reference types="react" />
import { DataSource, LiteralType, Schema, SpatialJoinExpr } from "mwater-expressions";
/** Expression builder for a spatial join. Uses a popup for editing */
export declare const BuildSpatialJoinExprComponent: (props: {
    schema: Schema;
    dataSource: DataSource;
    value: SpatialJoinExpr;
    types?: LiteralType[] | undefined;
    onChange: (value: SpatialJoinExpr) => void;
}) => JSX.Element;
