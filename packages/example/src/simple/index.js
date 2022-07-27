const {ExecutionManager} = require('@flow-execute/core');

const flowSchema = {
  schemaId: '1',
  schemaName: '项目Schema',
  schemaDesc: '项目Schema',
  flowSchemas: [],
  flowNodeSchemas: [
    {

      schemaId: '111',
      schemaName: 'getUserInfo',
      schemaDesc: '根据initData得到基本的用户信息',
      flowNodeType: "RawJsFlowNode",

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
    },
    {

      schemaId: '222',
      schemaName: 'printUserInfoAndCalcId',
      schemaDesc: '打印用户信息，并计算一个id',
      flowNodeType: "RawJsFlowNode",

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
    },
    {
      schemaId: '333',
      schemaName: 'getUserInfoByIdFromServer',
      schemaDesc: '根据ID获取服务端用户信息',
      flowNodeType: "ApiFlowNode",

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
    },
    {
      schemaId: '444',
      schemaName: 'printUserInfoFromServer',
      schemaDesc: '打印服务端用户信息',
      flowNodeType: "RawJsFlowNode",

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
    }
  ],
  routerSchemas: [
    {
      schemaId: 'r1',
      schemaName: '',
      schemaDesc: '',
      startId: '111',
      targetId: '222',
      condition: {
        type: 'expression',
        expression: "baseUserInfo.age <= 19"
      }
    },
    {
      schemaId: 'r2',
      schemaName: '',
      schemaDesc: '',
      startId: '222',
      targetId: '333',
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
    },
    {
      schemaId: 'r2',
      schemaName: '',
      schemaDesc: '',
      startId: '333',
      targetId: '444',
      condition: {
        type: 'always'
      }
    }
  ],
  startId: '111'
};

async function run() {

  const executionManager = new ExecutionManager();
  executionManager.executionAspectHandler = (flowNode, outputDataPack) => {
    console.log('[切面处理器] - 当前要处理的节点：', flowNode);
    console.log('[切面处理器] - outputDataPack：', outputDataPack);
    return outputDataPack;
  };
  const flowExecutor = executionManager.newFlowExecutor(flowSchema);
  const outputDataPack = await flowExecutor.execute({initData: {name: 'wz'}});
  console.log('outputDataPack：\n', outputDataPack);
}

document.querySelector('#btn').addEventListener('click', () => {
  (async () => {
    await run();
  })();
});

