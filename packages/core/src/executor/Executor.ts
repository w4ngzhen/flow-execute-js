import {ExecutionDataPack} from "../types/executor";
import {FlowNodeDataFieldDef} from "../types/schema/flow-node/flow-node-schema";
import {BaseSchema} from "../types";

export abstract class Executor {

    abstract get executorBaseSchema(): BaseSchema;

    /**
     * 执行器的id就是schema配置的id
     */
    get id() {
        return this.executorBaseSchema.schemaId;
    };

    /**
     * 执行器的名称就是schema配置的name
     */
    get name() {
        return this.executorBaseSchema.schemaName;
    };

    /**
     * 执行器的描述，就是schema配置的描述加上"执行器"前缀
     */
    get desc() {
        return `【执行器】${this.executorBaseSchema.schemaDesc}`;
    }

    abstract get inputDataFieldDefs(): FlowNodeDataFieldDef[];

    abstract get outputDataFieldDefs(): FlowNodeDataFieldDef[];

    abstract execute(inputDataPack: ExecutionDataPack, ...args: any): Promise<ExecutionDataPack>;
}
