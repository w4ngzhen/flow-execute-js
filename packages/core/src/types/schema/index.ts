import {FlowSchema} from "./flow";
import {FlowNodeSchema} from "./flow-node/flow-node-schema";
import {RouterSchema} from "./router";

export interface ExecutionSchema {
    name: string;
    flowSchemas: FlowSchema[];
    flowNodeSchemas: FlowNodeSchema<any>[];
    routerSchemas: RouterSchema[];
    startId: string;
}
