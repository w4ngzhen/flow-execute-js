import {FlowSchema} from "../../schema/flow";
import {ExecutionWalker} from "../../../executor/ExecutionWalker";
import {NodeExecutorSupplier} from "../../../executor/node/NodeExecutorSupplier";
import {ExecutionAspectHandler} from "../index";

export interface FlowExecutorConfig {
    flowSchema: FlowSchema;
    nodeExecutorSupplier: NodeExecutorSupplier;
    executionWalker?: ExecutionWalker;
    executionAspectHandler?: ExecutionAspectHandler;
}
