import React from "react";
interface LocalizedStringComponentProps {
    value?: any;
}
export default class LocalizedStringComponent extends React.Component<LocalizedStringComponentProps> {
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement> | null;
}
export {};
