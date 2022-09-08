import { Column, Expr, ExprUtils, LiteralType, Schema, Section, Variable } from "mwater-expressions";
export interface ScalarTreeNode {
    /** name of item, */
    name: string;
    /** description of item, */
    desc?: string;
    /** { table, joins, expr } - partial scalar expression, null if not selectable node */
    value?: {
        table: string;
        joins: string[];
        expr: Expr;
    } | null;
    /** function which returns children nodes */
    children?: () => ScalarTreeNode[];
    /** true if children should display initially */
    initiallyOpen?: boolean;
    /** table id of current item if applicable */
    tableId?: string;
    /** column/section object of current item if applicable */
    item?: Column | Section;
    /** unique key within sibling list if present */
    key: any;
}
export default class ScalarExprTreeBuilder {
    schema: Schema;
    locale: string | undefined;
    isScalarExprTreeSectionInitiallyOpen: ((input: {
        tableId: string;
        section: Section;
        filter?: string;
    }) => boolean) | undefined;
    isScalarExprTreeSectionMatch: ((input: {
        tableId: string;
        section: Section;
        filter?: string;
    }) => boolean) | undefined;
    variables: Variable[];
    exprUtils: ExprUtils;
    constructor(schema: Schema, options?: {
        /** Optional locale to use for names */
        locale?: string;
        /** Optional function to override initial open state of a section.
         * Passed { tableId: id of table, section: section object from schema, filter: optional string filter }
         * Should return true to set initially open
         */
        isScalarExprTreeSectionInitiallyOpen?: (input: {
            tableId: string;
            section: Section;
            filter?: string;
        }) => boolean;
        /** Optional function to override filtering of a section.
         * Passed { tableId: id of table, section: section object from schema, filter: optional string filter }
         * Should return null for default, true to include, false to exclude
         */
        isScalarExprTreeSectionMatch?: (input: {
            tableId: string;
            section: Section;
            filter?: string;
        }) => boolean;
        /** List of variables to show */
        variables?: Variable[];
    });
    getTree(options: {
        /** starting table */
        table: string;
        /** types to limit to */
        types?: LiteralType[];
        /** id type table to limit to */
        idTable?: string;
        /** to include aggregate expressions, including an count() option that has name that is "Number of ..." at first table level */
        includeAggr?: boolean;
        /** initial value to flesh out TODO REMOVE */
        initialValue?: Expr;
        /** optional string filter */
        filter?: string;
    }): ScalarTreeNode[];
    createTableChildNodes(options: {
        /** table id that started from */
        startTable: string;
        /** table id to get nodes for */
        table: string;
        /** joins for child nodes */
        joins: string[];
        /** types to limit to */
        types?: LiteralType[];
        /** table to limit to for id type */
        idTable?: string;
        /** to include an count() option that has and name that is "Number of ..." */
        includeAggr?: boolean;
        /** initial value to flesh out TODO REMOVE */
        initialValue?: Expr;
        /** optional string filter */
        filter?: string;
        /** current depth. First level is 0 */
        depth: number;
    }): ScalarTreeNode[];
    createNodes(contents: any, options: any): ScalarTreeNode[];
    createColumnNode(options: any): ScalarTreeNode | null | undefined;
}
