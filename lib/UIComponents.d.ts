import React, { ReactNode } from "react";
export declare class SectionComponent extends React.Component<{
    icon?: string;
    label: ReactNode;
}> {
    render(): React.DetailedReactHTMLElement<{
        style: {
            marginBottom: number;
        };
    }, HTMLElement>;
}
export declare class OptionListComponent extends React.Component<{
    items: {
        name: string;
        desc?: string;
        onClick: () => void;
    }[];
    hint?: string;
}> {
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
export declare class SwitchViewComponent extends React.Component<{
    views: {
        [viewId: string]: ReactNode;
    };
    viewId: string;
}, {
    measuring: boolean;
}> {
    comps: any;
    heights: {};
    constructor(props: any);
    componentWillReceiveProps(nextProps: any): void;
    refCallback: (id: any, comp: any) => void;
    componentDidUpdate(prevProps: any, prevState: any): void;
    render(): React.CElement<{
        style: {};
    }, React.Component<{
        style: {};
    }, any, any>>;
}
export declare class ToggleEditComponent extends React.Component<{
    forceOpen?: boolean;
    initiallyOpen?: boolean;
    label: ReactNode;
    editor: any;
    onRemove?: () => void;
}, {
    open: boolean;
}> {
    editorComp: any;
    editorHeight: any;
    constructor(props: any);
    close: () => void;
    open: () => void;
    handleToggle: () => void;
    editorRef: (editorComp: any) => void;
    render(): React.CElement<any, SwitchViewComponent>;
}
export declare class ButtonToggleComponent extends React.Component<{
    value: any;
    options: {
        label: ReactNode;
        value: any;
    }[];
    onChange: (value: any) => void;
}> {
    render(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement>;
}
