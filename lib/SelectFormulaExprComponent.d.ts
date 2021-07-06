import React from "react";
interface SelectFormulaExprComponentProps {
    /** Current expression value */
    value?: any;
    /** Called with new expression */
    onChange: any;
    /** Props to narrow down choices */
    table?: string;
    /** Allow case statements */
    allowCase?: boolean;
    /** If specified, the types (value type) of expression required. e.g. ["boolean"] */
    types?: any;
    /** statuses of aggregation to allow. list of "individual", "literal", "aggregate". Default: ["individual", "literal"] */
    aggrStatuses?: any;
    locale?: string;
}
interface SelectFormulaExprComponentState {
    searchText: any;
}
export default class SelectFormulaExprComponent extends React.Component<SelectFormulaExprComponentProps, SelectFormulaExprComponentState> {
    constructor(props: any);
    componentDidMount(): any;
    handleSearchTextChange: (ev: any) => void;
    handleIfSelected: () => any;
    handleScoreSelected: () => any;
    handleBuildEnumsetSelected: () => any;
    handleOpSelected: (op: any) => any;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
export {};
