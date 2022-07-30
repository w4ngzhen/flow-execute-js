import {ExecutionDataFieldDef, NodeSchema} from "../node/node-schema";
import {RouterSchema} from "../router";
import {BaseSchema} from "../index";

export interface FlowSchema extends BaseSchema {
    /**
     * 该流程具备的流程
     */
    flowSchemas: FlowSchema[];
    /**
     * 流程具备的节点Schema
     */
    nodeSchemas: NodeSchema[];
    /**
     * 该流程中的路由
     */
    routerSchemas: RouterSchema[];
    /**
     * 启动的节点ID
     */
    startId: string;
    /**
     * 流程的输入定义
     */
    inputDataFieldDefs?: ExecutionDataFieldDef[];

    /**
     * 流程的输出定义
     */
    outputDataFieldDefs?: ExecutionDataFieldDef[];
}
