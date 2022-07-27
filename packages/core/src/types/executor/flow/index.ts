import {FlowSchema} from "../../schema/flow";
import {ExecutionAspectHandler} from "../flow-node";
import {ExecutionWalker} from "../../../executor/flow/ExecutionWalker";

export interface FlowExecutorConfig {
    flowSchema: FlowSchema;
    flowNodeExecutionWalker: ExecutionWalker;
    executionAspectHandler?: ExecutionAspectHandler;
}
