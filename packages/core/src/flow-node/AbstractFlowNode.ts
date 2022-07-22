export abstract class AbstractFlowNode<ContextT, InputT, OutputT> {
    readonly id: string;
    readonly desc: string;
    readonly context: ContextT;

    abstract get type(): string;

    constructor(id: string, desc: string, context: ContextT) {
        this.id = id;
        this.desc = desc;
        this.context = context;
    }

    abstract execute(input: InputT): Promise<OutputT | undefined | null | void>;
}

export type FlowNode = AbstractFlowNode<any, any, any>;

