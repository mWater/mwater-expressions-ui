import PropTypes from "prop-types";
import React from "react";
import ModalWindowComponent from "react-library/lib/ModalWindowComponent";
export default class SelectExprModalComponent extends React.Component {
    static propTypes: {
        onSelect: PropTypes.Validator<(...args: any[]) => any>;
        onCancel: PropTypes.Validator<(...args: any[]) => any>;
        schema: PropTypes.Validator<object>;
        dataSource: PropTypes.Validator<object>;
        variables: PropTypes.Validator<any[]>;
        table: PropTypes.Requireable<string>;
        value: PropTypes.Requireable<object>;
        types: PropTypes.Requireable<any[]>;
        enumValues: PropTypes.Requireable<any[]>;
        idTable: PropTypes.Requireable<string>;
        initialMode: PropTypes.Requireable<string>;
        allowCase: PropTypes.Requireable<boolean>;
        aggrStatuses: PropTypes.Requireable<any[]>;
        refExpr: PropTypes.Requireable<object>;
        booleanOnly: PropTypes.Requireable<boolean>;
        placeholder: PropTypes.Requireable<string>;
    };
    static contextTypes: {
        locale: PropTypes.Requireable<string>;
    };
    static defaultProps: {
        placeholder: string;
        initialMode: string;
        aggrStatuses: string[];
    };
    renderContents(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    render(): React.CElement<any, ModalWindowComponent>;
}
