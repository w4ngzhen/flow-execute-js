import {AbstractFlowNode} from "../AbstractFlowNode";
import {FlowNodeDataPack} from "../../types/flow-node";

export interface ApiFlowNodeContext {
    /**
     * 请求地址
     */
    url: string;
    /**
     * 请求方法
     */
    method: 'GET' | 'POST' | 'DELETE' | 'PUT' | 'HEAD';
    /**
     * 请求类型
     */
    contentType: 'application/json' | 'application/x-www-form-urlencoded';
    /**
     * 需要从inputDataPack中提取的字段放在header中
     */
    headerFields: string[];
    /**
     * 响应适配
     */
    responseAdapter?: string | Function | ((originalResponse: any) => any)
}

export class ApiFlowNode extends AbstractFlowNode<ApiFlowNodeContext> {

    get flowNodeType(): string {
        return "ApiFlowNode";
    }

    async execute(inputDataPack: FlowNodeDataPack, globalContext: any): Promise<any> {

        const {
            url,
            method,
            contentType,
            headerFields,
            responseAdapter
        } = this.context;

        const propKeys = Object.keys(inputDataPack);

        let body = null;
        if (contentType === 'application/x-www-form-urlencoded') {
            body = new FormData();
            propKeys.forEach(propKey => {
                body.append(propKey, inputDataPack[propKey]);
            })
        } else {
            // json
            body = {
                ...inputDataPack
            }
        }

        // header
        const headers = {};
        (headerFields || []).forEach(headerField => {
            headers[headerField] = inputDataPack[headerField]
        })

        const originalJsonResp = await fetch(url, {
            method,
            headers,
            body
        }).then((response) => response.json());

        if (!responseAdapter) {
            return originalJsonResp;
        }

        const respAdapterFunc: Function = typeof responseAdapter === 'string'
            ? new Function('originalResponse', responseAdapter, originalJsonResp)
            : responseAdapter;
        return respAdapterFunc.apply(null, [originalJsonResp])
    }

}
