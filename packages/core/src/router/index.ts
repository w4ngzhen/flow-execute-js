export interface RouterCondition {
    type: 'always' | 'expression';
    expression?: string | Function | (() => boolean);
}

export interface Router {
    id: string;
    startNodeId: string;
    targetNodeId: string;
    condition?: RouterCondition;
}
