import {NodeExecutorSupplier} from "./node/NodeExecutorSupplier";
import {NodeExecutorConstructor} from "../types/executor/node";
import {FlowExecutor} from "./flow/FlowExecutor";
import {FlowSchema} from "../types/schema/flow";
import {ExecutionWalker} from "./ExecutionWalker";
import {ExecutionAspectHandler} from "../types/executor";


export class ExecutionManager {


    private readonly _nodeExecutorSupplier: NodeExecutorSupplier;
    private _executionAspectHandler?: ExecutionAspectHandler;
    private readonly _executionWalker: ExecutionWalker;

    constructor() {
        this._nodeExecutorSupplier = new NodeExecutorSupplier();
        this._executionWalker = new ExecutionWalker();
    }

    set executionAspectHandler(value: ExecutionAspectHandler) {
        this._executionAspectHandler = value;
    }

    get executionWalker(): ExecutionWalker {
        return this._executionWalker;
    }

    registerNodeExecutor(nodeType: string,
                         constructor: NodeExecutorConstructor) {
        this._nodeExecutorSupplier.registerNodeExecutor(nodeType, constructor)
    }


    buildFlowExecutor(flowSchema: FlowSchema) {
        return new FlowExecutor({
            flowSchema,
            nodeExecutorSupplier: this._nodeExecutorSupplier,
            executionWalker: this._executionWalker,
            executionAspectHandler: this._executionAspectHandler
        })
    }
}
