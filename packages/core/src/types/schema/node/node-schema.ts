import {BaseSchema} from "../index";

/**
 * 流程节点的能够接受的输入数据字段
 */
export interface ExecutionDataFieldDef {
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
    objectDefs?: ExecutionDataFieldDef[];
    /**
     * 如果当前类型为数组（ARRAY）
     * 那么 arrayDef 为数组每个元素的类型定义，
     * 此时可不关注FieldDef中的name，因为没有意义
     */
    arrayDef?: ExecutionDataFieldDef;
}

export interface NodeSchema<ContextT = any> extends BaseSchema {

    nodeType: string;

    context: ContextT;
    /**
     * 节点的输入定义
     */
    inputDataFieldDefs?: ExecutionDataFieldDef[];

    /**
     * 节点的输出定义
     */
    outputDataFieldDefs?: ExecutionDataFieldDef[];
}
