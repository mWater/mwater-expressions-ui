import { Expr, Schema } from "mwater-expressions";
import React from "react";
import { ReactNode } from "react";
/** Factory to create a custom table select component */
export declare type CustomTableSelectComponentFactory = (options: {
    schema: Schema;
    /** Current table id */
    value: string | null | undefined;
    /** Newly selected table id */
    onChange: (value: string | null) => void;
    /** Some table select components (not the default) can also perform filtering. Include these props to enable this */
    filter?: Expr;
    onFilterChange?: (filter: Expr) => void;
}) => ReactNode;
/** Context to override the table select component */
export declare const CustomTableSelectComponentFactoryContext: React.Context<CustomTableSelectComponentFactory | null>;
/** Context to set the locale */
export declare const LocaleContext: React.Context<string>;
/** Optional list of tables (ids) being used. Some overrides of the table select component may use this to present
 * an initially short list to select from */
export declare const ActiveTablesContext: React.Context<string[]>;
/** Table select component that uses custom one if available */
export declare const TableSelectComponent: (props: {
    schema: Schema;
    /** Current table id */
    value: string | null | undefined;
    /** Newly selected table id */
    onChange: (value: string | null) => void;
    /** Locale to use */
    locale?: string | undefined;
    /** Some table select components (not the default) can also perform filtering. Include these props to enable this */
    filter?: import("mwater-expressions").LiteralExpr | import("mwater-expressions").FieldExpr | import("mwater-expressions").OpExpr | import("mwater-expressions").IdExpr | import("mwater-expressions").ScalarExpr | import("mwater-expressions").CaseExpr | import("mwater-expressions").ScoreExpr | import("mwater-expressions").BuildEnumsetExpr | import("mwater-expressions").VariableExpr | import("mwater-expressions").SpatialJoinExpr | import("mwater-expressions").ExtensionExpr | import("mwater-expressions").LegacyComparisonExpr | import("mwater-expressions").LegacyLogicalExpr | import("mwater-expressions").LegacyCountExpr | null | undefined;
    onFilterChange?: ((filter: Expr) => void) | undefined;
}) => JSX.Element;
