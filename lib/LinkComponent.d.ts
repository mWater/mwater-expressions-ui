import React from "react";
export interface LinkComponentProps {
    /** Called on click */
    onClick?: any;
    /** Adds an x if specified */
    onRemove?: any;
    /** Array of { id, name } or { value, label } to display as dropdown. Null name/label is a separator */
    dropdownItems?: any;
    onDropdownItemClicked?: any;
}
export default class LinkComponent extends React.Component<LinkComponentProps> {
    renderRemove(): React.DetailedReactHTMLElement<{
        className: string;
        onClick: any;
    }, HTMLElement> | null;
    renderDropdownItem: (item: any) => React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement> | React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    render(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement>;
}
