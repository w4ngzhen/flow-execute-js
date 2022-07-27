import {FlowNodeSchema} from "../schema/flow-node/flow-node-schema";
import {BaseSchema} from "../index";

/**
 * 运转执行数据包
 */
export interface ExecutionDataPack {
    [key: string]: any;
}

/**
 * 某个流程执行快照
 * 记录执行的Schema和当时的输入、输出数据包
 */
export interface ExecutionSnapshot {
    /**
     * 执行的schema配置
     */
    baseSchema: BaseSchema;
    /**
     * 流程执行的输入数据包
     */
    inputDataPack?: ExecutionDataPack;
    /**
     * 流程执行开始时间
     */
    startTime?: Date;
    /**
     * 流程执行完成后的输出数据包
     */
    outputDataPack?: ExecutionDataPack;
    /**
     * 流程执行的结束时间
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
