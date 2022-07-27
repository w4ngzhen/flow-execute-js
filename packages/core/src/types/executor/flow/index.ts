import {FlowSchema} from "../../schema/flow";
import {ExecutionAspectHandler} from "../flow-node";
import {ExecutionWalker} from "../../../executor/ExecutionWalker";
import {FlowNodeExecutorSupplier} from "../../../executor/flow-node/FlowNodeExecutorSupplier";

export interface FlowExecutorConfig {
    flowSchema: FlowSchema;
    flowNodeSupplier: FlowNodeExecutorSupplier;
    flowNodeExecutionWalker: ExecutionWalker;
    executionAspectHandler?: ExecutionAspectHandler;
}
