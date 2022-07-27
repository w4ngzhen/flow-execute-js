import {FlowNodeDataFieldDef} from "../types/schema/flow-node/flow-node-schema";
import {ExecutionDataPack} from "../types/executor";

/**
 * 根据输入数据定义从输入数据包中进行字段提取过滤
 * 只有在 inputDataFieldDefs 中提到数据的才能使用
 * @param inputDataFieldDefs
 * @param inputDataPack
 */
export const filterDataPackByFieldDef = (
    inputDataFieldDefs: FlowNodeDataFieldDef[],
    inputDataPack: ExecutionDataPack): ExecutionDataPack => {

    const _inputDataPack = inputDataPack || {};
    const filteredDataPack: ExecutionDataPack = {};

    inputDataFieldDefs.forEach(def => {
        const argName = def.name;
        filteredDataPack[argName] = _inputDataPack[argName];
    })
    return filteredDataPack
}

/**
 * 1、如果 dataFieldDefs 只有一个，
 * 那么直接将 data 作为该pack字段的值
 * 2、如果 dataFieldDefs 有多个，
 * 那么首先判断 data 是否为object，不是的话报错，
 * 否则根据 dataFieldDefs 从 data 中进行解构
 * @param dataFieldDefs
 * @param data
 */
export const buildDataPackByFieldDef = (
    dataFieldDefs: FlowNodeDataFieldDef[],
    data: any): ExecutionDataPack => {

    if (!dataFieldDefs || dataFieldDefs.length === 0) {
        return {};
    }

    if (dataFieldDefs.length === 1) {
        const [firstDef] = dataFieldDefs;
        const outputDataPack: ExecutionDataPack = {};
        outputDataPack[firstDef.name] = data;
        return outputDataPack;
    }

    // dataFieldDefs.length > 1
    if (typeof data !== 'object') {
        //fixme
        throw new Error('无法对flowNodeOutputData映射到pack中');
    }
    const outputDataPack: ExecutionDataPack = {};
    dataFieldDefs.forEach(def => {
        const fieldName = def.name;
        outputDataPack[fieldName] = data[fieldName];
    })
    return outputDataPack;
}
