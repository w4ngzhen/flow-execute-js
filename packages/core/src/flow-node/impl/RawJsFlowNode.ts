import {AbstractFlowNode} from "../AbstractFlowNode";
import {FlowNodeDataPack} from "../../types/flow-node";

export interface RawJsFlowNodeContext {
    jsCode: string;
}

export class RawJsFlowNode
    extends AbstractFlowNode<RawJsFlowNodeContext> {

    get flowNodeType(): string {
        return "RawJsFlowNode";
    }

    async execute(
        inputDataPack: FlowNodeDataPack,
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
