import {FlowNodeExecutorSupplier} from "./flow-node/FlowNodeExecutorSupplier";
import {ExecutionAspectHandler, FlowNodeExecutorConstructor} from "../types/executor/flow-node";
import {FlowExecutor} from "./flow/FlowExecutor";
import {FlowSchema} from "../types/schema/flow";
import {ExecutionWalker} from "./ExecutionWalker";


export class ExecutionManager {

    private readonly _flowNodeExecutorSupplier: FlowNodeExecutorSupplier;
    private _executionAspectHandler?: ExecutionAspectHandler;
    private _snapshotDetailRecordEnable: boolean;

    constructor() {
        this._flowNodeExecutorSupplier = new FlowNodeExecutorSupplier();
        this._snapshotDetailRecordEnable = false;
    }

    set executionAspectHandler(value: ExecutionAspectHandler) {
        this._executionAspectHandler = value;
    }

    set snapshotDetailRecordEnable(value: boolean) {
        this._snapshotDetailRecordEnable = value;
    }


    registerFlowNodeExecutor(flowNodeType: string,
                             constructor: FlowNodeExecutorConstructor) {
        this._flowNodeExecutorSupplier.registerFlowNodeExecutor(flowNodeType, constructor)
    }


    newFlowExecutor(flowSchema: FlowSchema) {
        return new FlowExecutor({
            flowSchema,
            flowNodeSupplier: this._flowNodeExecutorSupplier,
            executionWalker: new ExecutionWalker({
                snapshotDetailRecordEnable: this._snapshotDetailRecordEnable
            }),
            executionAspectHandler: this._executionAspectHandler
        })
    }
}
