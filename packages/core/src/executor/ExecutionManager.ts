import {NodeExecutorSupplier} from "./node/NodeExecutorSupplier";
import {NodeExecutorConstructor} from "../types/executor/node";
import {FlowExecutor} from "./flow/FlowExecutor";
import {FlowSchema} from "../types/schema/flow";
import {ExecutionWalker} from "./ExecutionWalker";
import {ExecutionAspectHandler} from "../types/executor";


export class ExecutionManager {

    private readonly _nodeExecutorSupplier: NodeExecutorSupplier;
    private _executionAspectHandler?: ExecutionAspectHandler;
    private _snapshotDetailRecordEnable: boolean;

    constructor() {
        this._nodeExecutorSupplier = new NodeExecutorSupplier();
        this._snapshotDetailRecordEnable = false;
    }

    set executionAspectHandler(value: ExecutionAspectHandler) {
        this._executionAspectHandler = value;
    }

    set snapshotDetailRecordEnable(value: boolean) {
        this._snapshotDetailRecordEnable = value;
    }


    registerNodeExecutor(nodeType: string,
                         constructor: NodeExecutorConstructor) {
        this._nodeExecutorSupplier.registerNodeExecutor(nodeType, constructor)
    }


    buildFlowExecutor(flowSchema: FlowSchema) {
        return new FlowExecutor({
            flowSchema,
            nodeExecutorSupplier: this._nodeExecutorSupplier,
            executionWalker: new ExecutionWalker({
                snapshotDetailRecordEnable: this._snapshotDetailRecordEnable
            }),
            executionAspectHandler: this._executionAspectHandler
        })
    }
}
