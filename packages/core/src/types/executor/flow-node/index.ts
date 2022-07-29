import {ExecutionDataPack} from "../index";
import {BaseSchema} from "../../schema";
import {FlowNodeExecutor} from "../../../executor/flow-node/FlowNodeExecutor";

/**
 * 流程节点执行切面处理器
 */
export type ExecutionAspectHandler =
    (executorSchema: BaseSchema, flowNodeOutputDataPack: ExecutionDataPack)
        => Promise<{ outputDataPack: ExecutionDataPack }>

/**
 * 流程节点执行器构造函数
 */
export type FlowNodeExecutorConstructor = new (...args: any[]) => FlowNodeExecutor
