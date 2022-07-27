import {RouterSchema} from "../types/schema/router";
import {ExecutionDataPack} from "../types/executor";
import {getFuncInvokeArgList} from "../utils/function";
import * as _ from "lodash";

export const routerConditionCalculate = async (router: RouterSchema,
                                        dataPack: ExecutionDataPack): Promise<boolean> => {
    const {
        type: routerConditionType, expression, script
    } = router.condition || {};

    // 'always' 直接通过
    if (routerConditionType === 'always') {
        return true;
    }

    // 表达式/脚本都会使用统一的方式处理（使用Function对象）
    if (['expression', 'script'].indexOf(routerConditionType) >= 0) {

        const {
            argNameList,
            argValueList
        } = getFuncInvokeArgList(dataPack);

        // 最终Function执行代码
        let funcBody: string;
        if (routerConditionType === 'expression') {
            funcBody = _.trim(expression || '');
            if (funcBody === '') {
                return false;
            }
            // 表达式是没有return语句的，但是我们使用的Function，所以需要添加return
            funcBody = `return (${funcBody});`;
        } else {
            // routerConditionType === 'script'
            funcBody = _.trim(script || '');
            if (funcBody === '') {
                return false;
            }
        }

        // ['name', 'userInfo'] => 'name, userInfo'
        const argNameListStr = argNameList.join(', ');
        console.debug('RouterCondition 函数参数列表：', argNameListStr);
        console.debug('RouterCondition 执行代码：', funcBody);
        const func = new Function(argNameListStr, funcBody);
        try {
            const result = await func.apply(null, argValueList);
            if (typeof result !== 'boolean') {
                console.warn('当前路由表达式计算的返回非boolean类型，将按照JavaScript的数据真值检测逻辑');
            }
            return !!result;
        } catch (e) {
            console.error('路由逻辑判断报错，将直接该路由为false', e);
            return false;
        }
    }

    // 未知的类型，总是返回true
    console.warn('当前路由类型未知，将直接返回true！');
    return true;
}
