import {FlowSchema} from "../../schema/flow";
import {ExecutionAspectHandler} from "../node";
import {ExecutionWalker} from "../../../executor/ExecutionWalker";
import {NodeExecutorSupplier} from "../../../executor/node/NodeExecutorSupplier";

export interface FlowExecutorConfig {
    flowSchema: FlowSchema;
    nodeExecutorSupplier: NodeExecutorSupplier;
    executionWalker: ExecutionWalker;
    executionAspectHandler?: ExecutionAspectHandler;
}
