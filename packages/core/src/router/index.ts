type ExpressionCode = string;
export interface RouterCondition {
    type: 'always' | 'expression';
    expression?: ExpressionCode | Function | (() => boolean);
}

export interface Router {
    id: string;
    startNodeId: string;
    targetNodeId: string;
    condition?: RouterCondition;
}
