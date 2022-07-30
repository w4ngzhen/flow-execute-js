import {RawJsNodeExecutor} from "./impl/RawJsNodeExecutor";
import {ApiNodeExecutor} from "./impl/ApiNodeExecutor";
import {NodeSchema} from "../../types/schema/node/node-schema";
import {NodeExecutor} from "./NodeExecutor";
import {NodeExecutorConstructor} from "../../types/executor/node";

export class NodeExecutorSupplier {

    private readonly nodeExecutorConstructors: {
        [nodeType: string]: NodeExecutorConstructor;
    }

    constructor() {
        this.nodeExecutorConstructors = {
            'RawJsNode': RawJsNodeExecutor,
            'ApiNode': ApiNodeExecutor
        };
    }

    getNodeExecutor(nodeSchema: NodeSchema): NodeExecutor {
        const {nodeType} = nodeSchema;
        const nodeExecutorConstructor = this.nodeExecutorConstructors[nodeType];
        if (!nodeExecutorConstructor) {
            console.error(`流程节点执行器列表中无法找到类型为 ${nodeType} 的流程节点执行器构造函数`);
            return undefined;
        }
        return new nodeExecutorConstructor(nodeSchema);
    }

    registerNodeExecutor(
        nodeType: string,
        constructor: NodeExecutorConstructor) {
        if (Object.keys(this.nodeExecutorConstructors).indexOf(nodeType) >= 0) {
            console.warn(`流程节点执行器列表中已包含类型为 ${nodeType} 的执行器，将覆盖对应`);
        }
        this.nodeExecutorConstructors[nodeType] = constructor;
    }
}
