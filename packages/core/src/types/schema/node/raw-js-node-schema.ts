import {NodeSchema} from "./node-schema";

export interface RawJsNodeContext {
    jsCode: string;
}

export interface RawJsNodeSchema extends NodeSchema<RawJsNodeContext> {

}
