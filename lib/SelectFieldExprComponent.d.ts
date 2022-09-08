import PropTypes from "prop-types";
import React from "react";
import { AggrStatus, DataSource, EnumValue, Schema, Variable } from "mwater-expressions";
interface SelectFieldExprComponentProps {
    /** Current expression value */
    value?: any;
    /** Called with new expression */
    onChange: any;
    schema: Schema;
    /** Data source to use to get values */
    dataSource: DataSource;
    variables: Variable[];
    /** Props to narrow down choices */
    table: string;
    /** If specified, the types (value type) of expression required. e.g. ["boolean"] */
    types?: any;
    /** Array of { id:, name: } of enum values that can be selected. Only when type = "enum" */
    enumValues?: EnumValue[];
    /** If specified the table from which id-type expressions must come */
    idTable?: string;
    /** statuses of aggregation to allow. list of "individual", "literal", "aggregate". Default: ["individual", "literal"] */
    aggrStatuses: AggrStatus[];
}
interface SelectFieldExprComponentState {
    searchText: any;
    focused: boolean;
}
export default class SelectFieldExprComponent extends React.Component<SelectFieldExprComponentProps, SelectFieldExprComponentState> {
    static contextTypes: {
        locale: PropTypes.Requireable<string>;
        isScalarExprTreeSectionInitiallyOpen: PropTypes.Requireable<(...args: any[]) => any>;
        isScalarExprTreeSectionMatch: PropTypes.Requireable<(...args: any[]) => any>;
    };
    searchComp: HTMLInputElement | null;
    constructor(props: any);
    componentDidMount(): void | undefined;
    handleSearchTextChange: (ev: any) => void;
    handleTreeChange: (val: any) => any;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
export {};
