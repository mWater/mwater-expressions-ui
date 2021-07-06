import React from "react";
interface IdFieldComponentProps {
    /** The value */
    value?: string;
    onChange: any;
}
export default class IdFieldComponent extends React.Component<IdFieldComponentProps> {
    isValid: (string: any) => boolean;
    handleChange: (ev: any) => any;
    render(): React.DetailedReactHTMLElement<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
}
export {};
