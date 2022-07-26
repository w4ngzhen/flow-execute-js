import {FlowNodeSchema} from "../../types/schema/flow-node/flow-node-schema";
import {ExecutionDataPack} from "../../types/executor";

export abstract class AbstractFlowNodeExecutor<ContextT = any> {

    readonly _flowNodeSchema: FlowNodeSchema<ContextT>;

    get flowNodeSchema() {
        return this._flowNodeSchema;
    }

    /**
     * 节点唯一ID
     */
    get uuid() {
        return this._flowNodeSchema.uuid;
    }

    /**
     * 关于节点的描述
     */
    get desc() {
        return this._flowNodeSchema.desc;
    }

    /**
     * 节点上下文
     */
    get context() {
        return this._flowNodeSchema.context;
    };

    /**
     * 节点的输入定义
     */
    get inputDataFieldDefs() {
        return this._flowNodeSchema.inputDataFieldDefs;
    };

    /**
     * 节点的输出定义
     */
    get outputDataFieldDefs() {
        return this._flowNodeSchema.outputDataFieldDefs;
    };

    /**
     * FlowNode类型，需要各个节点自己实现
     */
    abstract get flowNodeType(): string;

    /**
     * 节点构造函数
     * @param flowNodeSchema
     */
    constructor(flowNodeSchema: FlowNodeSchema<ContextT>) {
        this._flowNodeSchema = flowNodeSchema;
    }

    abstract execute(
        inputDataPack: ExecutionDataPack,
        globalContext: any)
        : Promise<any>;

    toString(): string {
        return JSON.stringify({
            uuid: this.uuid,
            desc: this.desc,
            type: this.flowNodeType
        });
    }
}
