/**
 * 流程中节点间的数据传递数据包
 */
export interface FlowNodeDataPack {
    [key: string]: any;
}

/**
 * 流程节点数据字段类型
 */
export type FlowNodeDataFieldType =
    'STRING'
    | 'NUMBER'
    | 'BOOLEAN'
    | 'ARRAY'
    | 'OBJECT';

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
