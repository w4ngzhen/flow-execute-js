import {AbstractFlowNodeExecutor} from "../AbstractFlowNodeExecutor";
import {RawJsFlowNodeContext} from "../../../types/schema/flow-node/raw-js-flow-node-schema";
import {ExecutionDataPack} from "../../../types/executor";

export class RawJsFlowNodeExecutor
    extends AbstractFlowNodeExecutor<RawJsFlowNodeContext> {

    get flowNodeType(): string {
        return "RawJsFlowNodeExecutor";
    }

    async execute(
        inputDataPack: ExecutionDataPack,
        flowContext: any
    ): Promise<any> {
        // 结构代码
        const {jsCode} = this.context;
        const argNameList = [];
        const argValueList = [];
        Object.keys(inputDataPack).forEach(key => {
            argNameList.push(key);
            argValueList.push(inputDataPack[key]);
        })
        // "arg1, arg2, arg3, $flowContext"
        const funcInvokeArgNameStr = [...argNameList, '$flowContext'].join(", ");
        // [argVal1, argVal2, argVal3, { //$flowContext}]
        const funcInvokeArgDataArr = [...argValueList, {}];
        const func = new Function(funcInvokeArgNameStr, jsCode);
        const invokeResult: any =
            await func.apply(null, funcInvokeArgDataArr);
        return invokeResult;
    }
}
