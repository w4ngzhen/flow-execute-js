const {Flow, RawJsFlowNode} = require('@flow-execute/core');
const flow = new Flow();
const rawJsFlowNode1 = new RawJsFlowNode(
  '1',
  '基本执行',
  {
    jsCode: 'console.log(\'hello\');\nreturn { name: "hello", age: 18 }'
  }
);

const rawJsFlowNode2 = new RawJsFlowNode(
  '2',
  '打印用户信息',
  {
    jsCode: 'console.log(input);'
  }
);

const router1 = {
  startNodeId: '1',
  targetNodeId: '2',
  condition: {
    type: 'always'
  }
};

flow.addFlowNode(rawJsFlowNode1);
flow.addFlowNode(rawJsFlowNode2);

flow.addRouter(router1);

flow.run('1');
