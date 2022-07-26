import {FlowNodeSchema} from "./flow-node-schema";

export interface ApiFlowNodeContext {
    /**
     * 请求地址
     */
    url: string;
    /**
     * 请求方法
     */
    method: 'GET' | 'POST' | 'DELETE' | 'PUT' | 'HEAD' | 'PATCH';
    /**
     * 在headers中会特别添加该配置
     */
    contentType: 'application/json' | 'application/x-www-form-urlencoded';
    /**
     * 需要从inputDataPack中提取的字段放在header中
     */
    headerFields: string[];
    /**
     * 需要从inputDataPack提取的字段/数据放在请求Query参数中
     */
    paramFields: string[];
    /**
     * 响应适配
     */
    responseAdapter?: string;
    /**
     * 超时
     */
    timeout: number;
}

export interface APiFlowNodeSchema extends FlowNodeSchema<ApiFlowNodeContext> {

}
