import {AbstractFlowNode} from "../AbstractFlowNode";

export interface ApiFlowNodeContext {

}

export interface ApiFlowNodeInput {

}

export interface ApiFlowNodeOutput {

}

export class ApiFlowNode extends AbstractFlowNode<ApiFlowNodeContext, ApiFlowNodeInput, ApiFlowNodeOutput> {

    get type(): string {
        return "ApiFlowNode";
    }


    execute(input: ApiFlowNodeInput): Promise<void | undefined | null | ApiFlowNodeOutput> {
        return Promise.resolve(undefined);
    }

}
