import React, { ReactNode } from "react";
import { AggrStatus, BuildEnumsetExpr, CaseExpr, DataSource, EnumValue, Expr, ExprUtils, LiteralType, OpExpr, ScalarExpr, Schema, Variable } from "mwater-expressions";
export interface BuildOptions {
    /** required value types of expression e.g. ['boolean'] */
    types?: LiteralType[];
    /** key of the resulting element */
    key?: string;
    /** array of { id, name } for the enumerable values to display */
    enumValues?: EnumValue[];
    /** the table from which id-type expressions must come */
    idTable?: string;
    /** expression to get values for (used for literals). This is primarily for text fields to allow easy selecting of literal values */
    refExpr?: Expr;
    /** to preferentially choose literal expressions (used for RHS of expressions) */
    preferLiteral?: boolean;
    /** pass ops to *not* offer to wrap in */
    suppressWrapOps?: string[];
    /** true to include count (id) item at root level in expression selector */
    includeAggr?: boolean;
    /** statuses of aggregation to allow. list of "individual", "literal", "aggregate". Default: ["individual", "literal"] or ["literal"] if not table */
    aggrStatuses?: AggrStatus[];
    /** empty placeholder */
    placeholder?: ReactNode;
    /** ref to put on expr link component */
    exprLinkRef?: React.Ref<any>;
}
export default class ExprElementBuilder {
    schema: Schema;
    dataSource: DataSource;
    locale: string | undefined;
    variables: Variable[];
    exprUtils: ExprUtils;
    constructor(schema: any, dataSource: any, locale?: any, variables?: Variable[]);
    build(expr: Expr, table: string | undefined, onChange: ((expr: Expr) => void) | undefined, options?: BuildOptions): ReactNode;
    buildId(expr: any, onChange: any, options?: {}): ReactNode;
    buildVariable(expr: any, onChange: any, options?: {}): ReactNode;
    buildScalar(expr: ScalarExpr, onChange: any, options?: {
        key?: any;
        types?: LiteralType[];
        /** the table from which id-type expressions must come */
        idTable?: string;
        /** array of { id, name } for the enumerable values to display */
        enumValues?: EnumValue[];
    }): ReactNode;
    buildOp(expr: OpExpr, table: any, onChange: any, options: {
        /** array of { id, name } for the enumerable values to display */
        enumValues?: EnumValue[];
        /** the table from which id-type expressions must come */
        idTable?: string;
        types?: LiteralType[];
        /** statuses of aggregation to allow. list of "individual", "literal", "aggregate". Default: ["individual", "literal"] or ["literal"] if not table */
        aggrStatuses: AggrStatus[];
    }): ReactNode;
    buildCase(expr: CaseExpr, onChange: any, options: any): ReactNode;
    buildScore(expr: any, onChange: any, options: any): ReactNode;
    buildBuildEnumset(expr: BuildEnumsetExpr, onChange: any, options: any): ReactNode;
}
