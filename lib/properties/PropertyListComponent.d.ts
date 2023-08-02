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
    features?: ("sql" | "idField" | "uniqueCode" | "idType" | "joinType" | "code" | "expr" | "conditionExpr" | "section" | "table" | "unique" | "onDelete" | "dataurlType" | "fileType" | "filelistType" | "indexed" | "reverseSql" | "required")[];
    /** Function that adds extra display to property list items */
    createExtraDisplayElem?: (property: Column | Section) => ReactNode;
    /** Function that adds extra UI to editing properties */
    createExtraEditElem?: (property: Column | Section, onChange: (property: Column | Section) => void) => ReactNode;
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
export default class PropertyListComponent extends React.Component<PropertyListComponentProps> {
    render(): any;
}
