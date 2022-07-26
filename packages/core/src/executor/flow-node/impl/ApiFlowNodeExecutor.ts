import {AbstractFlowNodeExecutor} from "../AbstractFlowNodeExecutor";
import axios, {AxiosResponse} from 'axios';
import * as Qs from 'qs';
import {ApiFlowNodeContext} from "../../../types/schema/flow-node/api-flow-node-schema";
import {ExecutionDataPack} from "../../../types/executor";

export class ApiFlowNodeExecutor extends AbstractFlowNodeExecutor<ApiFlowNodeContext> {

    get flowNodeType(): string {
        return "ApiFlowNodeExecutor";
    }

    async execute(inputDataPack: ExecutionDataPack, globalContext: any): Promise<any> {

        const {
            url,
            method,
            contentType,
            headerFields,
            paramFields,
            responseAdapter,
            timeout
        } = this.context;

        // 如果配置了headerFields，
        // 则会将inputDataPack中提取到headers中
        const headers = {
            'content-type': contentType
        };
        (headerFields || []).forEach(headerField => {
            headers[headerField] = inputDataPack[headerField]
        });

        let data;
        // 特别的，如果headers最终的 'content-type' = 'application/application/x-www-form-urlencoded'
        if (headers['content-type'] === 'application/x-www-form-urlencoded') {
            data = Qs.stringify({...inputDataPack});
        } else {
            // 默认情况下，只会将inputDataPack中的数据填充至data，
            // 以HTTP Body情况发送（当然仅适用 'PUT', 'POST', 'DELETE 和 'PATCH' 请求方法）
            data = {...inputDataPack}
        }

        // 如果配置了paramFields，则会将inputDataPack中对应提取到params中
        const params = {};
        (paramFields || []).forEach(paramField => {
            params[paramField] = inputDataPack[paramField];
        });

        // 构造
        const axiosInstance = axios.create({
            timeout
        });

        const originalAxiosResp: AxiosResponse = await axiosInstance.request({
            url,
            method,
            headers,
            params,
            data
        });

        const originalResp = {
            status: originalAxiosResp.status,
            statusText: originalAxiosResp.statusText,
            data: originalAxiosResp.data,
            headers: {
                ...originalAxiosResp.headers
            }
        }

        if (!responseAdapter) {
            return originalResp;
        }

        const respAdapterFunc: Function = typeof responseAdapter === 'string'
            ? new Function('originalResponse', responseAdapter)
            : responseAdapter;
        return respAdapterFunc.apply(null, [originalResp])
    }

}
