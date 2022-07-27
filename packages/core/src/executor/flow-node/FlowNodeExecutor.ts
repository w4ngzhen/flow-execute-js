import {FlowNodeSchema} from "../../types/schema/flow-node/flow-node-schema";
import {ExecutionDataPack} from "../../types/executor";
import {RawJsFlowNodeExecutor} from "./impl/RawJsFlowNodeExecutor";
import {ApiFlowNodeExecutor} from "./impl/ApiFlowNodeExecutor";
import {Executor} from "../index";
import {buildDataPackByFieldDef} from "../../utils/data-pack";

export abstract class FlowNodeExecutor<ContextT = any> extends Executor {

    readonly _flowNodeSchema: FlowNodeSchema<ContextT>;

    get executorBaseSchema() {
        return this._flowNodeSchema;
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
        super();
        this._flowNodeSchema = flowNodeSchema;
    }

    /**
     * 需要实现的代码
     * @param inputDataPack
     * @param args
     */
    abstract executeImpl(inputDataPack: ExecutionDataPack,
                         ...args: any): Promise<any>;

    /**
     * 节点框架代码
     * @param inputDataPack
     * @param args
     */
    async execute(inputDataPack: ExecutionDataPack,
                  ...args: any): Promise<ExecutionDataPack> {
        const outputData = await this.executeImpl(inputDataPack, args);
        const currentNodeOutputDataPack = buildDataPackByFieldDef(
            this.outputDataFieldDefs,
            outputData
        );
        return currentNodeOutputDataPack;
    }


    toString(): string {
        return JSON.stringify({
            uuid: this.id,
            desc: this.desc,
            type: this.flowNodeType
        });
    }
}


/**
 * 流程节点执行器的构造函数
 */
const flowNodeExecutorConstructor = {
    'RawJsFlowNode': RawJsFlowNodeExecutor,
    'ApiFlowNode': ApiFlowNodeExecutor
}

/**
 * 构建FlowNodeExecutor
 * @param flowNodeSchema
 */
export const buildFlowNodeExecutor = (flowNodeSchema: FlowNodeSchema) => {
    const {type} = flowNodeSchema;
    const executorConstructor = flowNodeExecutorConstructor[type];
    return new executorConstructor(flowNodeSchema) as FlowNodeExecutor;
}
