import {FlowNode} from "../flow-node/AbstractFlowNode";
import {Router} from "../router";
import {FlowNodeDataFieldDef, FlowNodeDataPack} from "../types/flow-node";

export class Flow {

    private readonly flowNodes: FlowNode[];

    private readonly routers: Router[];

    constructor() {
        this.flowNodes = [];
        this.routers = [];
    }

    addFlowNode(flowNode: FlowNode) {
        this.flowNodes.push(flowNode);
    }

    addRouter(router: Router) {
        this.routers.push(router);
    }

    async run(startNodeId: string,
              startInput: FlowNodeDataPack): Promise<FlowNode[]> {
        const startNode = this.flowNodes.find(node => node.uuid === startNodeId);
        if (!startNode) {
            throw new Error('Cannot find the start FlowNode: ' + startNodeId);
        }
        const flowNodeExecutePath: FlowNode[] = [];
        await this.runFlowNode(startNode, startInput, flowNodeExecutePath);
        return flowNodeExecutePath;
    }

    async runFlowNode(flowNode: FlowNode,
                      inputDataPack: FlowNodeDataPack,
                      flowNodePath: FlowNode[]) {

        flowNodePath.push(flowNode);

        console.debug('准备处理节点: ' + flowNode.toString());

        // 准备当前节点的输入数据集
        const currentNodeInputDataPack = Flow.pickArgsFromInputDataPack(flowNode.inputDataFieldDefs, inputDataPack);
        console.debug('处理节点输入数据包（inputDataPack）', currentNodeInputDataPack)

        // 执行节点
        // todo 异常处理
        console.debug('执行该节点')
        const currentNodeOutput = await flowNode.execute(currentNodeInputDataPack, {});
        console.debug('节点执行完毕')

        // 根据字段定义和生成的数据进行处理，生成数据包，具体逻辑见实现
        const currentNodeOutputDataPack = Flow.buildFromOutputDataPack(flowNode.outputDataFieldDefs, currentNodeOutput);

        console.debug(`节点 ${flowNode.toString()} 执行完成`)
        console.debug(`节点本身执行结果（outputData）：`, currentNodeOutput)
        console.debug(`节点执行结果数据包（outputDataPack）：`, currentNodeOutputDataPack);

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
            const isSatisfied = await this.routerConditionCalculate(router, currentNodeOutput);
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
        // 递归
        await this.runFlowNode(targetNode, currentNodeOutputDataPack, flowNodePath);
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
