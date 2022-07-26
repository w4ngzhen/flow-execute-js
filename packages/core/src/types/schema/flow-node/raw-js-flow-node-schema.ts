import {FlowNodeSchema} from "./flow-node-schema";

export interface RawJsFlowNodeContext {
    jsCode: string;
}

export interface RawJsFlowNodeSchema extends FlowNodeSchema<RawJsFlowNodeContext> {

}
