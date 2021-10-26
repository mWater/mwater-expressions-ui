export default class ScalarExprTreeBuilder {
    constructor(schema: any, options?: {});
    getTree(options?: {}): {
        name: string;
        value: {
            table: any;
            joins: any;
            expr: {
                type: string;
                op: string;
                table: any;
                exprs: never[];
            };
        };
        tableId: any;
        key: string;
    }[];
    createTableChildNodes(options: any): {
        name: string;
        value: {
            table: any;
            joins: any;
            expr: {
                type: string;
                op: string;
                table: any;
                exprs: never[];
            };
        };
        tableId: any;
        key: string;
    }[];
    createNodes(contents: any, options: any): {
        name: string;
        desc: string;
        tableId: any;
        item: any;
        key: any;
    }[];
    createColumnNode(options: any): {
        name: string;
        desc: string;
        tableId: any;
        item: any;
        key: any;
    } | null | undefined;
}
