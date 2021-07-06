import PropTypes from "prop-types";
import React from "react";
export default class PropertyEditorComponent extends React.Component {
    static propTypes: {
        property: PropTypes.Validator<object>;
        onChange: PropTypes.Validator<(...args: any[]) => any>;
        features: PropTypes.Requireable<any[]>;
        schema: PropTypes.Requireable<object>;
        dataSource: PropTypes.Requireable<object>;
        table: PropTypes.Requireable<string>;
        tableIds: PropTypes.Requireable<string[]>;
        createRoleEditElem: PropTypes.Requireable<(...args: any[]) => any>;
        forbiddenPropertyIds: PropTypes.Requireable<string[]>;
        variables: PropTypes.Requireable<any[]>;
    };
    static defaultProps: {
        features: never[];
    };
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
