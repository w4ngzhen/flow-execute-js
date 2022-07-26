import {Router} from "../router";
import {FlowNodeDataFieldDef, FlowNodeDataPack, FlowNodeExecutionSnapshot} from "../types/flow-node";
import {AbstractFlowNode} from "../flow-node/AbstractFlowNode";
import {FlowWalker} from "./flow-walker";

/**
 * 流程节点执行映射器
 */
type FlowNodeExecutionAspectHandler =
    (flowNode: AbstractFlowNode, flowNodeOutputDataPack: FlowNodeDataPack)
        => Promise<{ outputDataPack: FlowNodeDataPack }>

/**
 * 流程配置
 */
export interface FlowConfig {
    snapshotDetailRecordEnable: boolean;
    flowNodeExecutionAspectHandler: FlowNodeExecutionAspectHandler;
}

export class Flow {

    /**
     * 存储的所有流程节点
     * @private
     */
    private readonly flowNodes: AbstractFlowNode[];

    /**
     * 存储的所有路由
     * @private
     */
    private readonly routers: Router[];

    /**
     * 流程节点执行切面处理器
     * 在处理下一个节点前（下个节点、下个节点的输入数据包），进行切面处理
     * 可以在切面处理器中改变下个节点或下个节点的输入数据包内容
     * @private
     */
    private readonly flowNodeExecutionAspectHandler: FlowNodeExecutionAspectHandler;

    /**
     * 是否启用快照详细记录
     * @private
     */
    private readonly snapshotDetailRecordEnable: boolean;

    constructor(config?: FlowConfig) {
        this.flowNodes = [];
        this.routers = [];
        const {
            snapshotDetailRecordEnable,
            flowNodeExecutionAspectHandler
        } = config || {};
        // 流程节点执行映射器
        this.flowNodeExecutionAspectHandler = flowNodeExecutionAspectHandler;
        // 是否启用快照详细记录
        this.snapshotDetailRecordEnable = snapshotDetailRecordEnable;
    }

    addFlowNode(flowNode: AbstractFlowNode) {
        this.flowNodes.push(flowNode);
    }

    addRouter(router: Router) {
        this.routers.push(router);
    }

    async run(startNodeId: string,
              startInputDataPack: FlowNodeDataPack): Promise<FlowWalker> {
        const startNode = this.flowNodes.find(node => node.uuid === startNodeId);
        if (!startNode) {
            throw new Error('Cannot find the start FlowNode: ' + startNodeId);
        }
        const walker = new FlowWalker({
            snapshotDetailRecordEnable: this.snapshotDetailRecordEnable
        })
        await this.runFlowNode(
            startNode,
            startInputDataPack,
            walker
        );
        return walker;
    }

    async runFlowNode(flowNode: AbstractFlowNode,
                      inputDataPack: FlowNodeDataPack,
                      flowWalker: FlowWalker): Promise<void> {

        console.debug('准备处理节点: ' + flowNode.toString());

        // 准备当前节点的输入数据集
        const currentNodeInputDataPack = Flow.pickArgsFromInputDataPack(flowNode.inputDataFieldDefs, inputDataPack);
        console.debug('解析节点输入数据包（inputDataPack）', currentNodeInputDataPack)

        // 准备初始的snapshot
        const currentNodeSnapshot: FlowNodeExecutionSnapshot = {
            flowNode: flowNode,
            inputDataPack: inputDataPack,
            startTime: new Date(),
        };


        // 切面封装
        const aspectHandle = async (flowNode: AbstractFlowNode,
                                    originalOutputDataPack: FlowNodeDataPack): Promise<FlowNodeDataPack> => {
            if (!this.flowNodeExecutionAspectHandler
                || typeof this.flowNodeExecutionAspectHandler !== 'function') {
                return originalOutputDataPack;
            }
            // 如配置了切面handler，那么使用handler进行数据处理
            try {
                const handledOutputData = await this.flowNodeExecutionAspectHandler(flowNode, originalOutputDataPack);
                if (typeof originalOutputDataPack !== 'undefined'
                    && typeof handledOutputData === 'undefined') {
                    console.warn('你可能在flowNodeExecutionAspectHandler忘记了返回数据？')
                }
                return handledOutputData;
            } catch (e) {
                // 出错了，打印日志并跳过
                console.error('流程节点执行切面处理器出错，将忽略该切面的处理')
                // 忽略切面的处理，直接使用原先的数据
                // fixme 这里outputDataPack可能存在handler内部将数据修改的情况发生，
                // fixme 最好是送入handler前进行克隆
                return originalOutputDataPack;
            }
        }

        try {
            console.debug('执行该节点')

            // 执行节点自身逻辑，得到自身逻辑的数据（不是数据包）
            const currentNodeOutput = await flowNode.execute(currentNodeInputDataPack, {});
            // 根据字段定义和生成的数据进行处理，生成Output数据包，具体逻辑见实现
            const currentNodeOutputDataPack = Flow.buildFromOutputDataPack(flowNode.outputDataFieldDefs, currentNodeOutput);

            currentNodeSnapshot.outputDataPack = await aspectHandle(flowNode, currentNodeOutputDataPack);
            currentNodeSnapshot.finishTime = new Date();

            // 记录snapshot信息
            flowWalker.record(currentNodeSnapshot);

            console.debug(`节点 ${flowNode.toString()} 执行完成`)
            console.debug(`节点本身执行结果（outputData）：`, currentNodeOutput)
            console.debug(`节点执行结果数据包（outputDataPack）：`, currentNodeOutputDataPack);
        } catch (e) {

            // todo 暂不支持异常的逻辑恢复逻辑
            console.debug('节点执行异常', e);
            // 节点执行异常，需要记录异常信息到snapshot中，并退出
            currentNodeSnapshot.outputDataPack = null;
            currentNodeSnapshot.finishTime = new Date();

            currentNodeSnapshot.isExecutionError = true;
            currentNodeSnapshot.error = e;

            flowWalker.record(currentNodeSnapshot);
            return;
        }

        const routers = this.findFlowNodeRouter(flowNode.uuid);
        if (routers.length === 0) {
            // 没有找到对应的路由，终止
            // todo 可以增加日志记录
            return;
        }

        // 找到符合条件的router
        let satisfiedRouter: Router | null = null;
        for (let i = 0; i < routers.length; i++) {
            const router = routers[i];
            const isSatisfied = await this.routerConditionCalculate(router, currentNodeSnapshot.outputDataPack);
            if (isSatisfied) {
                satisfiedRouter = router;
                break;
            }
        }
        if (!satisfiedRouter) {
            // 找不到满足的router，终止
            // todo 可以增加日志记录
            return;
        }
        const targetNodeId = satisfiedRouter.targetNodeId;
        const targetNode = this.flowNodes.find(sn => sn.uuid === targetNodeId);
        if (!targetNode) {
            // 找不到目标node，中止
            // todo 可以增加日志记录
            return;
        }

        // 递归（目标节点以及当前节点的输出，作为递归的输入）
        await this.runFlowNode(targetNode, currentNodeSnapshot.outputDataPack, flowWalker);
    }

    /**
     * 根据输入数据定义从输入数据包中进行字段提取
     * 只有在inputDataFieldDefList中提到数据的才能使用
     * @param inputDataFieldDefList
     * @param inputDataPack
     */
    static pickArgsFromInputDataPack(
        inputDataFieldDefList: FlowNodeDataFieldDef[],
        inputDataPack: FlowNodeDataPack): FlowNodeDataPack {

        const _inputDataPack = inputDataPack || {};
        const filteredDataPack: FlowNodeDataPack = {};

        inputDataFieldDefList.forEach(def => {
            const argName = def.name;
            filteredDataPack[argName] = _inputDataPack[argName];
        })
        return filteredDataPack
    }

    /**
     * 1、如果 outputDataFieldDefs 只有一个，
     * 那么直接将currentNodeOutput作为该pack字段的值
     * 2、如果 outputDataFieldDefs 有多个，
     * 那么首先判断currentNodeOutput是否为object，不是的话报错，
     * 否则根据 outputDataFieldDefs 从currentNodeOutput中提取
     * @param outputDataFieldDefs
     * @param flowNodeOutputData
     */
    static buildFromOutputDataPack(
        outputDataFieldDefs: FlowNodeDataFieldDef[],
        flowNodeOutputData: any): FlowNodeDataPack {

        if (!outputDataFieldDefs || outputDataFieldDefs.length === 0) {
            return {};
        }

        if (outputDataFieldDefs.length === 1) {
            const [firstDef] = outputDataFieldDefs;
            const outputDataPack: FlowNodeDataPack = {};
            outputDataPack[firstDef.name] = flowNodeOutputData;
            return outputDataPack;
        }

        // outputDataFieldDefs.length > 1
        if (typeof flowNodeOutputData !== 'object') {
            //fixme
            throw new Error('无法对flowNodeOutputData映射到pack中');
        }
        const outputDataPack: FlowNodeDataPack = {};
        outputDataFieldDefs.forEach(def => {
            const fieldName = def.name;
            outputDataPack[fieldName] = flowNodeOutputData[fieldName];
        })
        return outputDataPack;
    }

    private findFlowNodeRouter(flowNodeId: string): Router[] {
        return this.routers.filter(r => r.startNodeId === flowNodeId);
    }

    private async routerConditionCalculate(router: Router, nodeOutput): Promise<boolean> {
        const {type: routerConditionType, expression} = router.condition;
        if (routerConditionType === 'always') {
            return true;
        }
        if (routerConditionType === 'expression') {
            let expressionFunc: Function;
            if (typeof expression === 'string') {
                expressionFunc = new Function(expression);
            } else {
                expressionFunc = expression;
            }
            return await expressionFunc.call(null, nodeOutput, {}, {});
        }

        throw new Error('Cannot handle router condition!');

    }
}
