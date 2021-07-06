/// <reference types="node" />
import React from "react";
interface ContentEditableComponentProps {
    html: string;
    /** Called with element */
    onChange: any;
    /** Style to add to div */
    style?: any;
    /** Set to catch click events */
    onClick?: any;
    /** Set to catch focus events */
    onFocus?: any;
    onBlur?: any;
}
export default class ContentEditableComponent extends React.Component<ContentEditableComponentProps> {
    handleInput: (ev: any) => any;
    handleBlur: (ev: any) => any;
    handleFocus: (ev: any) => NodeJS.Timeout | undefined;
    focus(): any;
    pasteHTML(html: any): any;
    getSelectedHTML(): string;
    shouldComponentUpdate(nextProps: any): boolean;
    componentWillUpdate(): any;
    componentDidMount(): any;
    componentDidUpdate(): any;
    componentWillUnmount(): null | undefined;
    render(): React.DetailedReactHTMLElement<{
        contentEditable: true;
        spellCheck: true;
        ref: (c: HTMLElement | null) => HTMLElement | null;
        onClick: any;
        style: any;
        onInput: (ev: any) => any;
        onFocus: (ev: any) => NodeJS.Timeout | undefined;
        onBlur: (ev: any) => any;
    }, HTMLElement>;
}
export {};
