import * as _ from 'lodash';
import {ExecutionSnapshot} from "../../types/executor";


/**
 * 详细流程执行快照
 */
interface SnapshotDetailRecord {
    /**
     * 当前记录时候，执行结束的执行器ID
     */
    [currentFlowNodeId: string]: {
        /**
         * 快照记录时间
         */
        snapshotLogTime: Date;
        /**
         * 当前记录时候，整个流程执行链的快照记录，
         * 假如有1、2、3流程，那么
         * 1 => [1]
         * 2 => [1, 2]
         * 3 => [1, 2, 3]
         */
        currentFullFlowNodeSnapshots: ExecutionSnapshot[];
    };
}

/**
 * 流程Walker初始配置
 */
interface FlowNodeExecutionWalkerConfig {
    snapshotDetailRecordEnable: boolean;
}

/**
 * 流程Walker
 * 按照每一个执行器的执行过程，逐节点进行状态记录，
 * 方便后续进行调试等
 */
export class ExecutionWalker {
    get flowSnapshotRecords(): ExecutionSnapshot[] {
        return _.cloneDeep(this._flowSnapshotRecords);
    }

    /**
     * Flow每执行一次会记录一次快照
     * @private
     */
    private readonly _flowSnapshotRecords: ExecutionSnapshot[];
    /**
     * 是否启用详细的快照记录
     * 这个功能只会在开发debug时候启动
     * @private
     */
    private readonly _snapshotDetailRecordEnable: boolean;
    /**
     * 详细快照记录，会记录每一个执行器的执行当前情况
     * @private
     */
    private readonly _flowNodeSnapshotDetailRecord: SnapshotDetailRecord;


    constructor(config: FlowNodeExecutionWalkerConfig) {
        const {snapshotDetailRecordEnable} = config || {};
        this._flowSnapshotRecords = [];
        this._snapshotDetailRecordEnable = snapshotDetailRecordEnable;
        this._flowNodeSnapshotDetailRecord = {};
        if (this._snapshotDetailRecordEnable) {
            console.warn('【警告】当前FlowWalker启用了详细记录（_snapshotDetailRecordEnable），在流程节点数据较多时可能引发性能问题')
        }
    }

    record(snapshot: ExecutionSnapshot) {
        this._flowSnapshotRecords.push(snapshot);
        const {baseSchema} = snapshot;
        const {schemaId} = baseSchema;
        if (this._snapshotDetailRecordEnable) {
            this._flowNodeSnapshotDetailRecord[schemaId] = {
                snapshotLogTime: new Date(),
                currentFullFlowNodeSnapshots: _.cloneDeep(this._flowSnapshotRecords)
            }
        }
    }
}
