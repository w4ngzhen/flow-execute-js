import {ExecutionDataPack} from "../types/flow-node";

/**
 * 根据数据包生成函数调用的参数名列表和参数值列表
 * @param dataPack
 */
export function getFuncInvokeArgList(dataPack: ExecutionDataPack): {
    argNameList: string[],
    argValueList: any[]
} {
    const argNameList = [];
    const argValueList = [];
    if (!dataPack) {
        return {
            argNameList,
            argValueList
        }
    }
    Object.keys(dataPack).forEach(propKey => {
        argNameList.push(propKey);
        argValueList.push(dataPack[propKey]);
    })
    return {
        argNameList,
        argValueList
    }
}
