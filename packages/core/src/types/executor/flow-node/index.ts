import {FlowNodeSchema} from "../../schema/flow-node/flow-node-schema";
import {ExecutionDataPack} from "../index";

/**
 * 流程节点执行切面处理器
 */
export type FlowNodeExecutionAspectHandler =
    (flowNode: FlowNodeSchema<any>, flowNodeOutputDataPack: ExecutionDataPack)
        => Promise<{ outputDataPack: ExecutionDataPack }>

/**
 * 某个流程节点执行快照
 * 记录执行的流程节点和当时的输入、输出数据包
 */
export interface FlowNodeExecutionSnapshot {
    /**
     * 快照对应的流程节点
     */
    flowNodeSchema: FlowNodeSchema<any>;
    /**
     * 流程节点的输入数据包
     */
    inputDataPack?: ExecutionDataPack;
    /**
     * 流程节点执行开始时间
     */
    startTime?: Date;
    /**
     * 流程节点执行完成后的输出数据包
     */
    outputDataPack?: ExecutionDataPack;
    /**
     * 流程节点执行的结束时间
     */
    finishTime?: Date;
    /**
     * 执行是否出错
     */
    isExecutionError?: boolean;
    /**
     * 执行报错对象
     */
    error?: Error;

    // todo 后续可以有更多的记录
}
