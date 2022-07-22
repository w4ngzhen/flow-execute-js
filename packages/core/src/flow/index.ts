import {FlowNode} from "../flow-node/AbstractFlowNode";
import {Router} from "../router";

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

    async run(startNodeId: string, startInput: any) {
        const startNode = this.flowNodes.find(sn => sn.id === startNodeId);
        if (!startNode) {
            throw new Error('Cannot find the start FlowNode: ' + startNodeId);
        }
        await this.runFlowNode(startNode, startInput);
    }

    async runFlowNode(flowNode: FlowNode, executeInput: any) {
        // 运行当前SN
        const output = await flowNode.execute(executeInput);
        console.log(`节点 ${flowNode.id} 执行完成，结果：${JSON.stringify(output)}`)
        const routers = this.findFlowNodeRouter(flowNode.id);
        if (!routers || routers.length === 0) {
            // 没有找到对应的路由，终止
            console.log('路由未找到')
            return;
        }
        // 找到符合条件的router
        let satisfiedRouter: Router | null = null;
        for (let i = 0; i < routers.length; i++) {
            const router = routers[i];
            const isSatisfied = await this.routerConditionCalculate(router, output);
            if (isSatisfied) {
                satisfiedRouter = router;
                break;
            }
        }
        if (!satisfiedRouter) {
            // 找不到满足的router，终止
            return;
        }
        const targetNodeId = satisfiedRouter.targetNodeId;
        const targetNode = this.flowNodes.find(sn => sn.id === targetNodeId);
        if (!targetNode) {
            // 找不到目标node，中止
            console.log('找不到目标node，中止')
            return;
        }
        // 递归
        await this.runFlowNode(targetNode, output);
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
            return await expressionFunc.call(null, nodeOutput);
        }

        throw new Error('Cannot handle router condition!');

    }
}
