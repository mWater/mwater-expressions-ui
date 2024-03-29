import React from "react";
import { ScalarTreeNode } from "./ScalarExprTreeBuilder";
interface ScalarExprTreeComponentProps {
    /** Tree from ScalarExprTreeBuilder */
    tree: ScalarTreeNode[];
    /** Called with newly selected value */
    onChange: any;
    /** Render height of the component */
    height?: number;
    filter?: string;
}
export default class ScalarExprTreeComponent extends React.Component<ScalarExprTreeComponentProps> {
    render(): React.DetailedReactHTMLElement<{
        style: {
            overflowY: "auto" | undefined;
            height: number | undefined;
        };
    }, HTMLElement>;
}
export {};
