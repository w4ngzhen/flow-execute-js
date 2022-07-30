import {ExecutionDataPack} from "../index";
import {BaseSchema} from "../../schema";
import {NodeExecutor} from "../../../executor/node/NodeExecutor";

/**
 * 流程节点执行切面处理器
 */
export type ExecutionAspectHandler =
    (baseSchema: BaseSchema, outputDataPack: ExecutionDataPack)
        => Promise<{ outputDataPack: ExecutionDataPack }>

/**
 * 流程节点执行器构造函数
 */
export type NodeExecutorConstructor = new (...args: any[]) => NodeExecutor
