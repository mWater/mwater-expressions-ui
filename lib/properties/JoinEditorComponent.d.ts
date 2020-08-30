/// <reference types="react" />
import { Join, Schema } from "mwater-expressions";
/** Edits a join, preferring a simple inverse select dropdown, but allowing advanced mode */
export declare const JoinEditorComponent: (props: {
    join?: Join | undefined;
    onChange: (join?: Partial<Join> | undefined) => void;
    schema: Schema;
    /** Table that join is from */
    fromTableId: string;
}) => JSX.Element;
