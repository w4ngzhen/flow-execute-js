/**
 * 路由条件
 */
import {BaseSchema} from "../index";

export interface RouterCondition {
    /**
     * always：总是进入下一个节点
     * expression：经过表达式进行计算后进入下一个执行器
     */
    type: 'always' | 'expression' | 'script';
    /**
     * 若为表达式（expression），则会根据表达式计算得到true/false来决定
     * 表达式只会由一行代码组成，且无需添加 return 关键字来返回。
     */
    expression?: string;
    /**
     * 若为脚本（script），则根据脚本运行得到结果。
     * 与表达式（expression）不同的是，脚本可以由多行代码组成，
     * 且脚本内容中应该使用return语句来返回真/假值
     * 如果没有返回，则视为false（引擎内部拿到的是undefined）
     */
    script?: string;
}

/**
 * 路由
 * 两个执行器节点的连接路径
 */
export interface RouterSchema extends BaseSchema {
    /**
     * 开始执行器ID，
     * Flow、Node都有对应的执行器
     */
    startId: string;
    /**
     * 目标执行ID
     * Flow、Node都有对应的执行器
     */
    targetId: string;
    /**
     * 条件配置，根据条件计算得到true/false来决定是否使用该条路由
     */
    condition?: RouterCondition;
}
