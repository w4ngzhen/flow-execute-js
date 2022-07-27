import {ExecutionDataPack} from "../index";
import {BaseSchema} from "../../index";

/**
 * 流程节点执行切面处理器
 */
export type ExecutionAspectHandler =
    (executorSchema: BaseSchema, flowNodeOutputDataPack: ExecutionDataPack)
        => Promise<{ outputDataPack: ExecutionDataPack }>

