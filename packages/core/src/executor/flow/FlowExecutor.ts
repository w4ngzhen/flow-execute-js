import {NodeExecutor} from "../node/NodeExecutor";
import * as _ from "lodash";
import {RouterSchema} from "../../types/schema/router";
import {FlowExecutorConfig} from "../../types/executor/flow";
import {ExecutionDataPack, ExecutionSnapshot} from "../../types/executor";
import {filterDataPackByFieldDef} from "../../utils/data-pack";
import {routerConditionCalculate} from "../../router";
import {Executor} from "../Executor";
import {BaseSchema} from "../../types/schema";

export class FlowExecutor extends Executor {

    /**
     * 每个流程执行器保存执行器配置
     * @private
     */
    private readonly _flowExecutorConfig: FlowExecutorConfig;

    get executorBaseSchema(): BaseSchema {
        const {
            schemaId,
            schemaName,
            schemaDesc
        } = this._flowExecutorConfig.flowSchema;
        return {
            schemaId,
            schemaName,
            schemaDesc
        };
    }

    /**
     * 执行器的start ID
     */
    get startId() {
        return this._flowExecutorConfig.flowSchema.startId;
    }

    get inputDataFieldDefs() {
        return this._flowExecutorConfig.flowSchema.inputDataFieldDefs;
    }

    get outputDataFieldDefs() {
        return this._flowExecutorConfig.flowSchema.outputDataFieldDefs;
    }

    /**
     * 该流程具备子流程
     * @private
     */
    private readonly flowExecutors: FlowExecutor[];
    /**
     * 存储的所有流程节点
     * @private
     */
    private readonly nodeExecutors: NodeExecutor[];

    /**
     * 存储的所有路由
     * @private
     */
    private readonly routerSchemas: RouterSchema[];

    /**
     * 执行切面处理器
     * 在运行下一个执行器前（下个执行器、下个执行器的输入数据包），进行切面处理
     * 可以在切面处理器中改变下个执行器的输入数据包内容
     * @private
     */
    get executionAspectHandler() {
        return this._flowExecutorConfig.executionAspectHandler;
    }

    /**
     * 执行漫步者
     */
    get executionWalker() {
        return this._flowExecutorConfig.executionWalker;
    }

    constructor(config?: FlowExecutorConfig) {
        super();

        this._flowExecutorConfig = config;

        const {
            flowSchema,
            ...restConfig
        } = this._flowExecutorConfig;

        const {
            flowSchemas,
            nodeSchemas,
            routerSchemas,
        } = flowSchema;

        // 构建当前流程中的所有的流程执行器
        this.flowExecutors = (flowSchemas || []).map(flowSchema => {
            return new FlowExecutor({
                flowSchema,
                // 对于子流程来说，除了flowSchema外，
                // 其他的配置都是根流程透传
                ...restConfig
            });
        });

        // 构建当前流程中所有流程节点执行器
        this.nodeExecutors = (nodeSchemas || []).map(nodeSchema => {
            console.debug('构建流程节点执行器');
            return this._flowExecutorConfig.nodeExecutorSupplier.getNodeExecutor(nodeSchema.nodeType);
        });

        // 防止引用修改，使用深拷贝
        this.routerSchemas = _.cloneDeep(routerSchemas || []);
    }

    async execute(inputDataPack: ExecutionDataPack)
        : Promise<ExecutionDataPack> {
        let executor: Executor;
        const startNodeExecutor =
            this.nodeExecutors.find(node => node.id === this.startId);
        if (startNodeExecutor) {
            executor = startNodeExecutor;
        } else {
            executor = this.flowExecutors.find(flowExecutor => flowExecutor.id === this.startId);
        }

        if (!executor) {
            throw new Error('找不到启动执行器：' + this.startId);
        }

        // 得到的ExecutionDataPack分两种情况，
        // 但是这个数据包在内部有两种可能：
        // 1、节点执行得到数据包，这个数据包已经在流程节点内部进行数据因涉过
        const outputDataPack: ExecutionDataPack = await this.innerExecute(
            executor,
            inputDataPack
        );
        if (!outputDataPack) {
            console.error('流程执行异常终止');
            return {};
        }

        return outputDataPack;
    }

    /**
     * 内部执行
     * @param executor
     * @param inputDataPack
     * @private
     */
    private async innerExecute(executor: Executor,
                               inputDataPack: ExecutionDataPack): Promise<ExecutionDataPack | undefined> {

        console.debug(`\n\n\n=== 准备调用执行器, id = '${executor.id}' ===`);

        // 准备当前执行器的输入数据包
        const currentExecutorInputDataPack = filterDataPackByFieldDef(
            executor.inputDataFieldDefs,
            inputDataPack
        );
        console.debug('解析执行输入数据包（inputDataPack）', currentExecutorInputDataPack)

        // 准备初始的snapshot
        const currentExecutionSnapshot: ExecutionSnapshot = {
            baseSchema: _.cloneDeep(executor.executorBaseSchema),
            inputDataPack: inputDataPack,
            startTime: new Date(),
        };

        // 切面封装
        const aspectHandle = async (baseSchema: BaseSchema, originalOutputDataPack: ExecutionDataPack): Promise<ExecutionDataPack> => {
            if (!this.executionAspectHandler
                || typeof this.executionAspectHandler !== 'function') {
                return originalOutputDataPack;
            }
            // 如配置了切面handler，那么使用handler进行数据处理
            try {
                const handledOutputData =
                    await this.executionAspectHandler(baseSchema, originalOutputDataPack);
                if (typeof originalOutputDataPack !== 'undefined'
                    && typeof handledOutputData === 'undefined') {
                    console.warn('你可能在 executionAspectHandler 忘记了返回数据？')
                }
                return handledOutputData;
            } catch (e) {
                // 出错了，打印日志并跳过
                console.error('流程执行切面处理器出错，将忽略该切面的处理')
                // 忽略切面的处理，直接使用原先的数据
                // fixme 这里outputDataPack可能存在handler内部将数据修改的情况发生，
                // fixme 最好是送入handler前进行克隆
                return originalOutputDataPack;
            }
        }

        try {
            console.debug('运行执行器')

            // 得到数据包
            const currExecutionOutputDataPack = await executor.execute(currentExecutorInputDataPack, {});

            // snapshot信息保存
            currentExecutionSnapshot.outputDataPack =
                await aspectHandle(executor.executorBaseSchema, currExecutionOutputDataPack);
            currentExecutionSnapshot.finishTime = new Date();

            // 记录snapshot信息
            this.executionWalker.record(currentExecutionSnapshot);

            console.debug(`执行器 ${executor.id} 执行完成`)
            console.debug(`执行结果数据包（outputDataPack）：`, currExecutionOutputDataPack);
        } catch (e) {

            // todo 暂不支持异常的逻辑恢复逻辑
            console.debug('执行器执行异常', e);
            // 执行器执行异常，需要记录异常信息到snapshot中，并退出
            currentExecutionSnapshot.outputDataPack = null;
            currentExecutionSnapshot.finishTime = new Date();

            currentExecutionSnapshot.isExecutionError = true;
            currentExecutionSnapshot.error = e;

            this.executionWalker.record(currentExecutionSnapshot);
            return;
        }

        // 获取以当前执行器作为起始执行器的所有router
        const routers = this.routerSchemas.filter(
            router => router.startId === executor.id
        );
        if (routers.length === 0) {
            // 没有找到对应的路由，终止
            console.debug('路由为空，流程结束');
            return currentExecutionSnapshot.outputDataPack;
        }

        // 找到符合条件的router
        let satisfiedRouter: RouterSchema | null = null;
        for (let i = 0; i < routers.length; i++) {
            const router = routers[i];
            const isSatisfied = await routerConditionCalculate(router, currentExecutionSnapshot.outputDataPack);
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
        const targetId = satisfiedRouter.targetId;

        // 根据targetId依然要从流程执行器和流程节点执行器中查找


        const targetNodeExecutor = this.nodeExecutors.find(fnExecutor => fnExecutor.id === targetId);
        if (!targetNodeExecutor) {
            // 找不到目标node，中止
            // todo 可以增加日志记录
            return;
        }

        // 递归（目标执行器以及当前执行器的输出，作为递归的输入）
        return await this.innerExecute(targetNodeExecutor, currentExecutionSnapshot.outputDataPack);
    }


    /**
     * 根据执行器id从流程执行器列表/流程节点执行器中
     * @param executorId
     * @private
     */
    private getExecutor(executorId: string): FlowExecutor | NodeExecutor {
        const startNodeExecutor =
            this.nodeExecutors.find(nodeExecutor => nodeExecutor.id === this.startId);
        if (startNodeExecutor) {
            return startNodeExecutor;
        } else {
            return this.flowExecutors.find(flowExecutor => flowExecutor.id === this.startId);
        }
    }
}
