import {FlowNodeDataFieldDef, FlowNodeSchema} from "../flow-node/flow-node-schema";
import {RouterSchema} from "../router";

export interface FlowSchema {
    /**
     * 流程ID
     */
    flowId: string;
    /**
     * 流程名称
     */
    flowName: string;
    /**
     * 流程具备的节点Schema
     */
    flowNodeSchemas: FlowNodeSchema<any>[];
    /**
     * 该流程中的路由
     */
    routerSchemas: RouterSchema[];
    /**
     * 启动的节点ID
     */
    startFlowNodeId: string;
    /**
     * 节点的输入定义
     */
    inputDataFieldDefs?: FlowNodeDataFieldDef[];

    /**
     * 节点的输出定义
     */
    outputDataFieldDefs?: FlowNodeDataFieldDef[];
}
