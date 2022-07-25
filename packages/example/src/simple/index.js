const {Flow, RawJsFlowNode, ApiFlowNode} = require('@flow-execute/core');
const flow = new Flow();
const rawJsFlowNode1 = new RawJsFlowNode({
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

const rawJsFlowNode2 = new RawJsFlowNode({
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

const apiFlowNode = new ApiFlowNode({
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

const rawJsFlowNode4 = new RawJsFlowNode({
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
    type: 'always'
  }
};

const router2 = {
  startNodeId: '2',
  targetNodeId: '3',
  condition: {
    type: 'always'
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

document.querySelector('#btn').addEventListener('click', () => {
  (async function run() {
    const path = await flow.run('1', {initData: {name: 'wz'}});
    const display = path.map(node => node.toString()).join(" -> ");
    console.log('执行路径：\n' + display);
  })();
});
