import {AbstractFlowNode} from "../flow-node/AbstractFlowNode";

/**
 * 流程中节点间的数据传递数据包
 */
export interface FlowNodeDataPack {
    [key: string]: any;
}

/**
 * 流程节点的能够接受的输入数据字段
 */
export interface FlowNodeDataFieldDef {
    /**
     * 数据名
     */
    name: string;
    /**
     * 数据类型
     */
    type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'ARRAY' | 'OBJECT';
    /**
     * 如果当前类型为对象（OBJECT），
     * 那么 objectDefs 为该对象内部的定义结构
     */
    objectDefs?: FlowNodeDataFieldDef[];
    /**
     * 如果当前类型为数组（ARRAY）
     * 那么 arrayDef 为数组每个元素的类型定义，
     * 此时可不关注FieldDef中的name，因为没有意义
     */
    arrayDef?: FlowNodeDataFieldDef;
}

/**
 * 流程节点构造函数的参数
 */
export interface FlowNodeConfig<ContextT> {
    /**
     * 节点唯一ID
     */
    uuid: string,
    /**
     * 该节点的描述
     */
    desc: string,
    /**
     * 流程节点的上下文，通常不同类型的流程节点会有需要不同的上下文进行构造
     */
    context: ContextT,
    /**
     * 该节点的输入定义
     */
    inputDataFieldDefs: FlowNodeDataFieldDef[] | undefined,
    /**
     * 该节点的输出定义
     */
    outputDataFieldDefs: FlowNodeDataFieldDef[] | undefined
}

/**
 * 某个流程节点执行快照
 * 记录执行的流程节点和当时的输入、输出数据包
 */
export interface FlowNodeExecutionSnapshot {
    /**
     * 快照对应的流程节点
     */
    flowNode: AbstractFlowNode;
    /**
     * 流程节点的输入数据包
     */
    inputDataPack?: FlowNodeDataPack;
    /**
     * 流程节点执行开始时间
     */
    startTime?: Date;
    /**
     * 流程节点执行完成后的输出数据包
     */
    outputDataPack?: FlowNodeDataPack;
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
