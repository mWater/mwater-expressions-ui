import { Column, Schema, DataSource, Section, Variable } from "mwater-expressions";
import React, { ReactNode } from "react";
export interface PropertyListComponentProps {
    /** # array of properties */
    properties: (Column | Section)[];
    onChange: (properties: (Column | Section)[]) => void;
    /** schema of all data. Needed for idType and expr features */
    schema?: Schema;
    /** data source. Needed for expr feature */
    dataSource?: DataSource;
    /** Table that properties are of. Not required if table feature is on */
    table?: string;
    /** Ids of tables to include when using table feature */
    tableIds?: string[];
    /** Function to generate the ID of the property */
    propertyIdGenerator?: () => string;
    /** Variables that may be used in expressions */
    variables?: Variable[];
    features?: ("sql" | "idField" | "uniqueCode" | "idType" | "joinType" | "code" | "expr" | "conditionExpr" | "section" | "table" | "unique" | "onDelete" | "dataurlType" | "indexed" | "reverseSql" | "required")[];
    /** function that returns the UI of the roles, called with a single argument, the array containing roles */
    createRoleDisplayElem?: (roles: any[]) => ReactNode;
    /** function that returns the UI of the roles for editing, gets passed two arguments
     * 1. the array containing roles
     * 2. The callback function that should be called when the roles change */
    createRoleEditElem?: (roles: any[], onChange: (roles: any[]) => void) => ReactNode;
    /** supplied by NestedListClipboardEnhancement */
    onCut?: () => void;
    /** supplied by NestedListClipboardEnhancement */
    onCopy?: () => void;
    /** supplied by NestedListClipboardEnhancement */
    onPaste?: () => void;
    /** supplied by NestedListClipboardEnhancement */
    onPasteInto?: () => void;
    /** used internally */
    listId?: string;
}
declare const _default: React.Component<PropertyListComponentProps, {}, any>;
export default _default;
