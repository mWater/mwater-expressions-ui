import React from "react";
interface StackedComponentProps {
    /** Label between connections */
    joinLabel?: any;
    items: any;
}
export default class StackedComponent extends React.Component<StackedComponentProps> {
    renderRow(item: any, i: any, first: any, last: any): React.DetailedReactHTMLElement<{
        style: {
            display: "flex";
        };
        className: string;
    }, HTMLElement>;
    render(): React.DetailedReactHTMLElement<{
        style: {
            display: "flex";
            flexDirection: "column";
        };
    }, HTMLElement>;
}
export {};
