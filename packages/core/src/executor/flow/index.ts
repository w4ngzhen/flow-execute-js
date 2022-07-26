import {AbstractFlowNodeExecutor} from "../flow-node/AbstractFlowNodeExecutor";
import {FlowWalker} from "./flow-walker";
import {getFuncInvokeArgList} from "../../utils/function";
import * as _ from "lodash";
import {RouterSchema} from "../../types/schema/router";
import {FlowNodeDataFieldDef, FlowNodeSchema} from "../../types/schema/flow-node/flow-node-schema";
import {ApiFlowNodeExecutor} from "../flow-node/impl/ApiFlowNodeExecutor";
import {RawJsFlowNodeExecutor} from "../flow-node/impl/RawJsFlowNodeExecutor";
import {FlowNodeExecutionAspectHandler, FlowNodeExecutionSnapshot} from "../../types/executor/flow-node";
import {FlowExecutorConfig} from "../../types/executor/flow";
import {ExecutionDataPack} from "../../types/executor";

export class FlowExecutor {


    private flowExecutorConfig: FlowExecutorConfig;

    get flowId() {
        return this.flowExecutorConfig.flowId;
    }

    get flowName() {
        return this.flowExecutorConfig.flowName;
    }

    get startFlowNodeId() {
        return this.flowExecutorConfig.startFlowNodeId;
    }

    get inputDataFieldDefs() {
        return this.flowExecutorConfig.inputDataFieldDefs;
    }

    get outputDataFieldDefs() {
        return this.flowExecutorConfig.outputDataFieldDefs;
    }

    /**
     * 存储的所有流程节点
     * @private
     */
    private readonly flowNodeExecutors: AbstractFlowNodeExecutor[];

    /**
     * 存储的所有路由
     * @private
     */
    private readonly routerSchemas: RouterSchema[];

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

    constructor(config?: FlowExecutorConfig) {
        this.flowNodeExecutors = [];
        this.routerSchemas = [];
        const {
            flowNodeSchemas,
            routerSchemas,
            snapshotDetailRecordEnable,
            flowNodeExecutionAspectHandler
        } = config || {};
        // 流程节点执行映射器
        this.flowNodeExecutionAspectHandler = flowNodeExecutionAspectHandler;
        // 是否启用快照详细记录
        this.snapshotDetailRecordEnable = snapshotDetailRecordEnable;
        // todo comment
        (flowNodeSchemas || []).forEach(flowNodeSchema => {
            this.setupFlowNodeExecutor(flowNodeSchema);
        });
        (routerSchemas || []).forEach(routerSchema => {
            this.setupRouter(routerSchema);
        });

    }

    private setupFlowNodeExecutor(flowNodeSchema: FlowNodeSchema<any>) {
        const {type} = flowNodeSchema;
        let flowNodeExecutor;
        if (type === 'ApiFlowNode') {
            flowNodeExecutor = new ApiFlowNodeExecutor(flowNodeSchema);
        } else if (type === 'RawJsFlowNode') {
            flowNodeExecutor = new RawJsFlowNodeExecutor(flowNodeSchema);
        }
        this.flowNodeExecutors.push(flowNodeExecutor);
    }

    private setupRouter(routerSchema: RouterSchema) {
        this.routerSchemas.push(routerSchema);
    }

    async execute(inputDataPack: ExecutionDataPack)
        : Promise<ExecutionDataPack> {
        const startNodeExecutor =
            this.flowNodeExecutors.find(node => node.uuid === this.startFlowNodeId);
        const walker = new FlowWalker({
            snapshotDetailRecordEnable: this.snapshotDetailRecordEnable
        })
        const result = await this.innerExecute(
            startNodeExecutor,
            inputDataPack,
            walker
        );

        if (!result) {
            console.error('流程执行异常终止');
            return {};
        }
        return result;
    }


    async innerExecute(flowNodeExecutor: AbstractFlowNodeExecutor,
                       inputDataPack: ExecutionDataPack,
                       flowWalker: FlowWalker): Promise<ExecutionDataPack | undefined> {

        console.debug(`\n\n\n=== 准备处理节点: ${flowNodeExecutor.toString()} ===`);

        // 准备当前节点的输入数据包
        const currentNodeInputDataPack = FlowExecutor.pickArgsFromInputDataPack(flowNodeExecutor.inputDataFieldDefs, inputDataPack);
        console.debug('解析节点输入数据包（inputDataPack）', currentNodeInputDataPack)

        // 准备初始的snapshot
        const currentNodeSnapshot: FlowNodeExecutionSnapshot = {
            flowNodeSchema: flowNodeExecutor.flowNodeSchema,
            inputDataPack: inputDataPack,
            startTime: new Date(),
        };


        // 切面封装
        const aspectHandle = async (flowNodeSchema: FlowNodeSchema<any>,
                                    originalOutputDataPack: ExecutionDataPack): Promise<ExecutionDataPack> => {
            if (!this.flowNodeExecutionAspectHandler
                || typeof this.flowNodeExecutionAspectHandler !== 'function') {
                return originalOutputDataPack;
            }
            // 如配置了切面handler，那么使用handler进行数据处理
            try {
                const handledOutputData = await this.flowNodeExecutionAspectHandler(flowNodeSchema, originalOutputDataPack);
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
            const currentNodeOutput = await flowNodeExecutor.execute(currentNodeInputDataPack, {});
            // 根据字段定义和生成的数据进行处理，生成Output数据包，具体逻辑见实现
            const currentNodeOutputDataPack = FlowExecutor.buildFromOutputDataPack(flowNodeExecutor.outputDataFieldDefs, currentNodeOutput);

            currentNodeSnapshot.outputDataPack = await aspectHandle(flowNodeExecutor.flowNodeSchema, currentNodeOutputDataPack);
            currentNodeSnapshot.finishTime = new Date();

            // 记录snapshot信息
            flowWalker.record(currentNodeSnapshot);

            console.debug(`节点 ${flowNodeExecutor.toString()} 执行完成`)
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

        const routers = this.findFlowNodeRouter(flowNodeExecutor.uuid);
        if (routers.length === 0) {
            // 没有找到对应的路由，终止
            console.debug('路由为空，流程结束');
            return currentNodeSnapshot.outputDataPack;
        }

        // 找到符合条件的router
        let satisfiedRouter: RouterSchema | null = null;
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
            console.debug('无满足路由，流程结束')
            return;
        }
        const targetNodeId = satisfiedRouter.targetNodeId;
        const targetNode = this.flowNodeExecutors.find(sn => sn.uuid === targetNodeId);
        if (!targetNode) {
            // 找不到目标node，中止
            // todo 可以增加日志记录
            return;
        }

        // 递归（目标节点以及当前节点的输出，作为递归的输入）
        return await this.innerExecute(targetNode, currentNodeSnapshot.outputDataPack, flowWalker);
    }

    /**
     * 根据输入数据定义从输入数据包中进行字段提取
     * 只有在inputDataFieldDefList中提到数据的才能使用
     * @param inputDataFieldDefList
     * @param inputDataPack
     */
    static pickArgsFromInputDataPack(
        inputDataFieldDefList: FlowNodeDataFieldDef[],
        inputDataPack: ExecutionDataPack): ExecutionDataPack {

        const _inputDataPack = inputDataPack || {};
        const filteredDataPack: ExecutionDataPack = {};

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
        flowNodeOutputData: any): ExecutionDataPack {

        if (!outputDataFieldDefs || outputDataFieldDefs.length === 0) {
            return {};
        }

        if (outputDataFieldDefs.length === 1) {
            const [firstDef] = outputDataFieldDefs;
            const outputDataPack: ExecutionDataPack = {};
            outputDataPack[firstDef.name] = flowNodeOutputData;
            return outputDataPack;
        }

        // outputDataFieldDefs.length > 1
        if (typeof flowNodeOutputData !== 'object') {
            //fixme
            throw new Error('无法对flowNodeOutputData映射到pack中');
        }
        const outputDataPack: ExecutionDataPack = {};
        outputDataFieldDefs.forEach(def => {
            const fieldName = def.name;
            outputDataPack[fieldName] = flowNodeOutputData[fieldName];
        })
        return outputDataPack;
    }

    private findFlowNodeRouter(flowNodeId: string): RouterSchema[] {
        return this.routerSchemas.filter(r => r.startNodeId === flowNodeId);
    }

    private async routerConditionCalculate(router: RouterSchema,
                                           flowNodeDataPack: ExecutionDataPack)
        : Promise<boolean> {
        const {
            type: routerConditionType,
            expression,
            script
        } = router.condition || {};

        // 'always' 直接通过
        if (routerConditionType === 'always') {
            return true;
        }

        // 表达式/脚本都会使用统一的方式处理（使用Function对象）
        if (['expression', 'script'].indexOf(routerConditionType) >= 0) {

            const {
                argNameList,
                argValueList
            } = getFuncInvokeArgList(flowNodeDataPack);

            // 最终Function执行代码
            let funcBody: string;
            if (routerConditionType === 'expression') {
                funcBody = _.trim(expression || '');
                if (funcBody === '') {
                    return false;
                }
                // 表达式是没有return语句的，但是我们使用的Function，所以需要添加return
                funcBody = `return (${funcBody});`;
            } else {
                // routerConditionType === 'script'
                funcBody = _.trim(script || '');
                if (funcBody === '') {
                    return false;
                }
            }

            // ['name', 'userInfo'] => 'name, userInfo'
            const argNameListStr = argNameList.join(', ');
            console.debug('RouterCondition 函数参数列表：', argNameListStr);
            console.debug('RouterCondition 执行代码：', funcBody);
            const func = new Function(argNameListStr, funcBody);
            try {
                const result = await func.apply(null, argValueList);
                if (typeof result !== 'boolean') {
                    console.warn('当前路由表达式计算的返回非boolean类型，将按照JavaScript的数据真值检测逻辑');
                }
                return !!result;
            } catch (e) {
                console.error('路由节点逻辑判断报错，将直接该路由为false', e);
                return false;
            }
        }

        // 未知的类型，总是返回true
        console.warn('当前路由类型未知，将直接返回true！');
        return true;
    }
}
