const {FlowExecutor, RawJsFlowNodeExecutor, ApiFlowNodeExecutor} = require('@flow-execute/core');
const flow = new FlowExecutor({
  executionAspectHandler: (flowNode, outputDataPack) => {
    console.log('[flowNodeExecutionAspectHandler] - 当前要处理的节点：', flowNode);
    console.log('[flowNodeExecutionAspectHandler] - outputDataPack：', outputDataPack);
    return outputDataPack;
  }
});
const rawJsFlowNode1 = new RawJsFlowNodeExecutor({
  uuid: '1',
  desc: '根据initData得到基本的用户信息',
  context: {
    jsCode: `
    console.log('initData: ', initData);
    const {name} = initData;
    return {name: name, age: 18};
    `
  },
  inputDataFieldDefs: [
    {
      name: 'initData',
      type: "OBJECT"
    }
  ],
  outputDataFieldDefs: [
    {
      name: 'baseUserInfo',
      type: "OBJECT"
    }
  ]
});

const rawJsFlowNode2 = new RawJsFlowNodeExecutor({
  uuid: '2',
  desc: '打印用户信息，并计算一个id',
  context: {
    jsCode: `
    console.log('baseUserInfo: ', baseUserInfo);
    const {name, age} = baseUserInfo;
    return 'id_' + name + '-' + age;
    `
  },
  inputDataFieldDefs: [
    {
      name: 'baseUserInfo',
      type: 'OBJECT'
    },
  ],
  outputDataFieldDefs: [
    {
      name: 'id',
      type: "STRING"
    }
  ]
});

const apiFlowNode = new ApiFlowNodeExecutor({
  uuid: '3',
  desc: '根据ID获取服务端用户信息',
  context: {
    url: 'http://localhost:3000/getUserInfoById',
    method: 'GET'
  },
  inputDataFieldDefs: [
    {
      name: 'id',
      type: "STRING"
    }
  ],
  outputDataFieldDefs: [
    {
      name: 'userInfo',
      type: "OBJECT"
    }
  ]
});

const rawJsFlowNode4 = new RawJsFlowNodeExecutor({
  uuid: '4',
  desc: '打印服务端用户信息',
  context: {
    jsCode: `
    console.log('userInfo: ', userInfo);
    `
  },
  inputDataFieldDefs: [
    {
      name: 'userInfo',
      type: "OBJECT"
    },
  ],
});

const router1 = {
  startNodeId: '1',
  targetNodeId: '2',
  condition: {
    type: 'expression',
    expression: "baseUserInfo.age <= 19"
  }
};

const router2 = {
  startNodeId: '2',
  targetNodeId: '3',
  condition: {
    type: 'script',
    script: `
    const userId = id;
    console.log('这是Router Condition 中的脚本执行， userId: ', id);
    if ('' === userId) {
       return false;
    } else {
       return true;
    }
    `
  }
};

const router3 = {
  startNodeId: '3',
  targetNodeId: '4',
  condition: {
    type: 'always'
  }
};

flow.addFlowNode(rawJsFlowNode1);
flow.addFlowNode(rawJsFlowNode2);
flow.addFlowNode(apiFlowNode);
flow.addFlowNode(rawJsFlowNode4);

flow.addRouter(router1);
flow.addRouter(router2);
flow.addRouter(router3);

async function run() {
  const flowWalker = await flow.run('1', {initData: {name: 'wz'}});
  let flowSnapshotRecords = flowWalker.flowSnapshotRecords;
  console.log('flowSnapshotRecords', flowSnapshotRecords);
  const executionPath = flowSnapshotRecords.map(snapshot => {
    const {flowNodeSchema} = snapshot;
    return flowNodeSchema.toString();
  }).join(" -> ");
  console.log('执行路径：\n' + executionPath);
}

document.querySelector('#btn').addEventListener('click', () => {
  (async () => {
    await run();
  })();
});
