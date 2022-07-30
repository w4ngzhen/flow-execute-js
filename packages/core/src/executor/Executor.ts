import {ExecutionDataPack} from "../types/executor";
import {ExecutionDataFieldDef} from "../types/schema/node/node-schema";
import {BaseSchema} from "../types/schema";

export abstract class Executor {

    /**
     * 执行的基础Schema配置
     */
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

    /**
     * 执行器的输入定义
     */
    abstract get inputDataFieldDefs(): ExecutionDataFieldDef[];

    /**
     * 执行器的输出定义
     */
    abstract get outputDataFieldDefs(): ExecutionDataFieldDef[];

    /**
     * 每个具体的执行器要实现的执行内容
     * @param inputDataPack
     * @param args
     */
    abstract execute(inputDataPack: ExecutionDataPack, ...args: any): Promise<ExecutionDataPack>;

    /**
     * 重写toString
     */
    toString(): string {
        return JSON.stringify({
            id: this.id,
            desc: this.desc
        });
    }
}
