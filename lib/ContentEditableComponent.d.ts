/// <reference types="node" />
import React from "react";
export interface ContentEditableComponentProps {
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
    handleFocus: (ev: any) => void;
    editor: HTMLElement | null;
    lastInnerHTML: string;
    range: any;
    selSaver: NodeJS.Timeout | null;
    focus(): void;
    pasteHTML(html: any): any;
    getSelectedHTML(): string;
    shouldComponentUpdate(nextProps: any): boolean;
    componentWillUpdate(): void;
    componentDidMount(): void;
    componentDidUpdate(): void;
    componentWillUnmount(): void;
    render(): React.DetailedReactHTMLElement<{
        contentEditable: true;
        spellCheck: true;
        ref: (c: HTMLElement | null) => void;
        onClick: any;
        style: any;
        onInput: (ev: any) => any;
        onFocus: (ev: any) => void;
        onBlur: (ev: any) => any;
    }, HTMLElement>;
}
