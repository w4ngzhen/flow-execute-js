import {
    FlowNodeConfig,
    FlowNodeDataFieldDef,
    FlowNodeDataPack
} from "../types/flow-node";

export abstract class AbstractFlowNode<ContextT = any> {
    /**
     * 节点唯一ID
     */
    readonly uuid: string;
    /**
     * 关于节点的描述
     */
    readonly desc: string;
    /**
     * 节点上下文
     */
    readonly context: ContextT;

    /**
     * 节点的输入定义
     */
    readonly inputDataFieldDefs: FlowNodeDataFieldDef[] | undefined;

    /**
     * 节点的输出定义
     */
    readonly outputDataFieldDefs: FlowNodeDataFieldDef[] | undefined;

    /**
     * FlowNode类型，需要各个节点自己实现
     */
    abstract get flowNodeType(): string;

    /**
     * 节点构造函数
     * @param flowNodeConfig
     */
    constructor(flowNodeConfig: FlowNodeConfig<ContextT>) {

        const {
            uuid,
            desc,
            context,
            inputDataFieldDefs,
            outputDataFieldDefs
        } = flowNodeConfig;

        this.uuid = uuid;
        this.desc = desc;
        this.context = context;
        this.inputDataFieldDefs = inputDataFieldDefs;
        this.outputDataFieldDefs = outputDataFieldDefs;
    }

    abstract execute(
        inputDataPack: FlowNodeDataPack,
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
