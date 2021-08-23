import React from "react";
import * as ui from "react-library/lib/bootstrap";
interface IdFieldComponentProps {
    /** The value */
    value?: string;
    onChange: any;
}
export default class IdFieldComponent extends React.Component<IdFieldComponentProps> {
    isValid: (string: any) => boolean;
    handleChange: (ev: any) => any;
    render(): React.CElement<{
        label: React.ReactNode;
        labelMuted?: boolean | undefined;
        hint?: React.ReactNode;
        help?: React.ReactNode;
        hasSuccess?: boolean | undefined;
        hasWarnings?: boolean | undefined;
        hasErrors?: boolean | undefined;
    }, ui.FormGroup>;
}
export {};
