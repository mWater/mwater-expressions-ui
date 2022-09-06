import React, { ReactNode } from "react";
import { Column, DataSource, Schema, Variable } from "mwater-expressions";
export interface Property extends Column {
    table?: string;
}
export interface PropertyEditorComponentProps {
    /** The property being edited */
    property: Property;
    /** Function called when anything is changed in the editor */
    onChange: (property: Property) => void;
    /** Features to be enabled apart from the default features */
    features?: string[];
    /** schema of all data */
    schema?: Schema;
    /** data source */
    dataSource?: DataSource;
    /** Table that properties are of. Not required if table feature is on */
    table?: string;
    /** Ids of tables to include when using table feature */
    tableIds?: string[];
    createRoleEditElem: (roles: any[] | undefined, onRolesChange: (roles: any[]) => void) => ReactNode;
    /** Ids of properties that are not allowed as would be duplicates */
    forbiddenPropertyIds?: string[];
    /** Variables that may be used in expressions */
    variables?: Variable[];
}
export default class PropertyEditorComponent extends React.Component<PropertyEditorComponentProps> {
    static defaultProps: {
        features: never[];
    };
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
