import {AbstractFlowNode} from "../AbstractFlowNode";

export interface RawJsFlowNodeContext {
    jsCode: string;
}

export interface RawJsFlowNodeInput {

}

export interface RawJsFlowNodeOutput {

}

export class RawJsFlowNode
    extends AbstractFlowNode<RawJsFlowNodeContext,
        RawJsFlowNodeInput,
        RawJsFlowNodeOutput> {

    get type(): string {
        return "RawJsFlowNode";
    }

    async execute(input: RawJsFlowNodeInput): Promise<void | undefined | null | RawJsFlowNodeOutput> {
        // const funcObj = new Function(this.context.jsCode);
        const func = async (input) => {
            // fixme
            return await eval(this.context.jsCode);
            // return await funcObj.apply(undefined, input);
        }
        const res = await func(input);
        console.log(`code: ${this.context.jsCode}, args: ${JSON.stringify(input)}`);
        console.log(`res: ${JSON.stringify(res)}`)
        return res;
    }
}
