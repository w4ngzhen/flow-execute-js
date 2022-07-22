import {AbstractFlowNode} from "../AbstractFlowNode";

export interface RawJsFlowNodeContext {
    jsCode: string;
}

export interface RawJsFlowNodeInput {

}

export interface RawJsFlowNodeOutput {

}

export class RawJsFlowNode
    extends AbstractFlowNode<RawJsFlowNodeContext,
        RawJsFlowNodeInput,
        RawJsFlowNodeOutput> {

    get type(): string {
        return "RawJsFlowNode";
    }

    execute(input: RawJsFlowNodeInput): Promise<void | undefined | null | RawJsFlowNodeOutput> {
        return Promise.resolve(undefined);
    }
}
