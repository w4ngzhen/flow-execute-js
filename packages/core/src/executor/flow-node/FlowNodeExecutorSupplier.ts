import {RawJsFlowNodeExecutor} from "./impl/RawJsFlowNodeExecutor";
import {ApiFlowNodeExecutor} from "./impl/ApiFlowNodeExecutor";
import {FlowNodeSchema} from "../../types/schema/flow-node/flow-node-schema";
import {FlowNodeExecutor} from "./FlowNodeExecutor";
import {FlowNodeExecutorConstructor} from "../../types/executor/flow-node";

export class FlowNodeExecutorSupplier {

    private readonly flowNodeExecutorConstructors: {
        [flowNodeType: string]: FlowNodeExecutorConstructor;
    }

    constructor() {
        this.flowNodeExecutorConstructors = {
            'RawJsFlowNode': RawJsFlowNodeExecutor,
            'ApiFlowNode': ApiFlowNodeExecutor
        };
    }

    getFlowNodeExecutor(flowNodeSchema: FlowNodeSchema): FlowNodeExecutor {
        const {flowNodeType} = flowNodeSchema;
        const executorConstructor = this.flowNodeExecutorConstructors[flowNodeType];
        if (!executorConstructor) {
            console.error(`流程节点执行器列表中无法找到类型为 ${flowNodeType} 的流程节点执行器构造函数`);
            return undefined;
        }
        return new executorConstructor(flowNodeSchema);
    }

    registerFlowNodeExecutor(
        flowNodeType: string,
        constructor: FlowNodeExecutorConstructor) {
        if (Object.keys(this.flowNodeExecutorConstructors).indexOf(flowNodeType) >= 0) {
            console.warn(`流程节点执行器列表中已包含类型为 ${flowNodeType} 的执行器，将覆盖对应`);
        }
        this.flowNodeExecutorConstructors[flowNodeType] = constructor;
    }
}
