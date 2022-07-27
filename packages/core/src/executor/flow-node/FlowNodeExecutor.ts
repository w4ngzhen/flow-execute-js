import {FlowNodeSchema} from "../../types/schema/flow-node/flow-node-schema";
import {ExecutionDataPack} from "../../types/executor";
import {Executor} from "../Executor";
import {buildDataPackByFieldDef} from "../../utils/data-pack";

export abstract class FlowNodeExecutor<ContextT = any> extends Executor {

    readonly _flowNodeSchema: FlowNodeSchema<ContextT>;

    get executorBaseSchema() {
        const {
            schemaId,
            schemaName,
            schemaDesc
        } = this._flowNodeSchema;
        return {
            schemaId,
            schemaName,
            schemaDesc
        };
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



