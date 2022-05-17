import React from "react";
export interface RemovableComponentProps {
    onRemove?: () => void;
}
export default class RemovableComponent extends React.Component<RemovableComponentProps> {
    render(): React.DetailedReactHTMLElement<{
        style: {
            display: "flex";
        };
        className: string;
    }, HTMLElement>;
}
