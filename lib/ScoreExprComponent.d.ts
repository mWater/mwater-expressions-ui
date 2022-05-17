import PropTypes from "prop-types";
import React from "react";
import RemovableComponent from "./RemovableComponent";
interface ScoreExprComponentProps {
    schema: any;
    /** Data source to use to get values */
    dataSource: any;
    /** Current expression value */
    value?: any;
    /** Called with new expression */
    onChange?: any;
}
export default class ScoreExprComponent extends React.Component<ScoreExprComponentProps> {
    static contextTypes: {
        locale: PropTypes.Requireable<string>;
    };
    handleInputChange: (expr: any) => any;
    handleScoreChange: (id: any, value: any) => any;
    renderScores(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement> | null;
    render(): React.CElement<import("./RemovableComponent").RemovableComponentProps, RemovableComponent>;
}
export {};
