import React from "react";
import { AggrStatus, EnumValue, Expr, LiteralType, Schema } from "mwater-expressions";
interface SelectFormulaExprComponentProps {
    schema: Schema;
    /** Current expression value */
    value?: Expr;
    /** Called with new expression */
    onChange: (value: Expr) => void;
    /** Props to narrow down choices */
    table?: string;
    /** Allow case statements */
    allowCase?: boolean;
    /** If specified, the types (value type) of expression required. e.g. ["boolean"] */
    types?: LiteralType[];
    /** statuses of aggregation to allow. list of "individual", "literal", "aggregate". Default: ["individual", "literal"] */
    aggrStatuses: AggrStatus[];
    locale?: string;
    /** Array of { id:, name: } of enum values that can be selected. Only when type = "enum" */
    enumValues?: EnumValue[];
}
interface SelectFormulaExprComponentState {
    searchText: any;
}
export default class SelectFormulaExprComponent extends React.Component<SelectFormulaExprComponentProps, SelectFormulaExprComponentState> {
    searchComp: HTMLInputElement | null;
    constructor(props: any);
    componentDidMount(): void | undefined;
    handleSearchTextChange: (ev: any) => void;
    handleIfSelected: () => void;
    handleScoreSelected: () => void;
    handleBuildEnumsetSelected: () => void;
    handleOpSelected: (op: any) => void;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
export {};
