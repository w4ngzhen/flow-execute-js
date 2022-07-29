import {FlowNodeSchema} from "../../types/schema/flow-node/flow-node-schema";
import {ExecutionDataPack} from "../../types/executor";
import {Executor} from "../Executor";

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
        // 调用每个节点的自己实现
        const nativeOutput = await this.executeImpl(inputDataPack, args);
        // 将原生的输出数据根据当前节点的输出定义进行封装
        const currentNodeOutputDataPack =
            this.buildDataPackFromNativeOutput(nativeOutput);
        return currentNodeOutputDataPack;
    }

    /**
     * 1、如果 节点的 outputDataFieldDefs 数组只有一个元素，
     * 那么直接将 nativeOutput 作为该pack字段的值
     *
     * 2、如果 outputDataFieldDefs 数组多项，
     * 那么首先判断 nativeOutput 是否为object，不是则报错
     * 否则根据 outputDataFieldDefs 从 nativeOutput 中进行解构
     *
     * 1. outputDataFieldDefs = []
     * 无论原生输出为什么，输出数据包都为空：{}
     *
     * 2. outputDataFieldDefs只有一项
     * 无论原生输出为什么（可以是独立的字符串、数字，也可以是对象），
     * 都会将数据放在以该定义唯一项的名字作为属性名的位置上（暂时没考虑类型匹配）
     * 例如：
     * outputDataFieldDefs = [{name: 'myData', type: 'XXX'}]
     * nativeOutput = 'hello'，
     * 输出数据包为：{ myData: "hello" }
     * nativeOutput = { username: 'hello', age: 18 }，
     * 输出数据包则为：{ myData: { username: 'hello', age: 18 } }
     *
     * 3. outputDataFieldDefs有多项
     * 这种情况下，必须要求nativeOutput也是对象，
     * 此时会遍历数据定义中的每一项，并从nativeOutput对象中找到与该定义名称一样的属性的值，
     * 放进入输出数据包中
     * 例如：
     * outputDataFieldDefs = [
     * {name: 'myData', type: 'STRING'},
     * {name: 'myData2', type: 'NUMBER'}
     * ]
     * nativeOutput = 'hello' 或 18 或 某个数组，则会报错。
     * nativeOutput = { myData: 'hello', username: 'w4ngzhen' }
     * 那么输出数据包就是：{ myData: "hello", myData2: undefined }
     * 因为定义包含两项：myData 和 myData2，
     * 而从nativeOutput只找到了myData，值是 'hello'，没有myData2，此时username被忽略。
     *
     * @param nativeOutput
     * @private
     */
    private buildDataPackFromNativeOutput(nativeOutput: any) {
        const dataFieldDefs = this.outputDataFieldDefs;
        if (!dataFieldDefs || dataFieldDefs.length === 0) {
            return {};
        }

        if (dataFieldDefs.length === 1) {
            const [firstDef] = dataFieldDefs;
            const outputDataPack: ExecutionDataPack = {};
            outputDataPack[firstDef.name] = nativeOutput;
            return outputDataPack;
        }

        // dataFieldDefs.length > 1
        if (typeof nativeOutput !== 'object') {
            //fixme
            throw new Error('无法将 nativeOutput 根据数据定义映射到数据包中');
        }
        const outputDataPack: ExecutionDataPack = {};
        dataFieldDefs.forEach(def => {
            const fieldName = def.name;
            outputDataPack[fieldName] = nativeOutput[fieldName];
        })
        return outputDataPack;
    }


    toString(): string {
        return JSON.stringify({
            uuid: this.id,
            desc: this.desc,
            type: this.flowNodeType
        });
    }
}



