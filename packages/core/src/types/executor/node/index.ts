import {NodeExecutor} from "../../../executor/node/NodeExecutor";
import {NodeSchema} from "../../schema/node/node-schema";

/**
 * 流程节点执行器构造函数
 */
export type NodeExecutorConstructor = new (nodeSchema: NodeSchema) => NodeExecutor
