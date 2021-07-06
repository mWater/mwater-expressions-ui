import React from "react";
interface RemovableComponentProps {
    onRemove?: any;
}
export default class RemovableComponent extends React.Component<RemovableComponentProps> {
    render(): React.DetailedReactHTMLElement<{
        style: {
            display: "flex";
        };
        className: string;
    }, HTMLElement>;
}
export {};
