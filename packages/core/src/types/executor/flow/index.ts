import {FlowSchema} from "../../schema/flow";
import {FlowNodeExecutionAspectHandler} from "../flow-node";

export interface FlowExecutorConfig extends FlowSchema {
    snapshotDetailRecordEnable: boolean;
    flowNodeExecutionAspectHandler: FlowNodeExecutionAspectHandler;
}
