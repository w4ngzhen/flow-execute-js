import {ExecutionDataFieldDef} from "../types/schema/node/node-schema";
import {ExecutionDataPack} from "../types/executor";

/**
 * 根据输入数据定义从输入数据包中进行字段提取过滤
 * 只有在 inputDataFieldDefs 中提到数据的才能使用
 * @param inputDataFieldDefs
 * @param inputDataPack
 */
export const filterDataPackByFieldDef = (
    inputDataFieldDefs: ExecutionDataFieldDef[],
    inputDataPack: ExecutionDataPack): ExecutionDataPack => {

    const _inputDataPack = inputDataPack || {};
    const filteredDataPack: ExecutionDataPack = {};

    inputDataFieldDefs.forEach(def => {
        const argName = def.name;
        filteredDataPack[argName] = _inputDataPack[argName];
    })
    return filteredDataPack
}
