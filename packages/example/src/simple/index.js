const {ExecutionManager, ExecutionWalker} = require('@flow-execute/core');

const flowSchema = {
  schemaId: '1',
  schemaName: '项目Schema',
  schemaDesc: '项目Schema',
  flowSchemas: [
    {
      schemaId: 'A6',
      schemaName: '子Flow',
      schemaDesc: '处理用户信息子Flow',
      flowSchemas: [],
      nodeSchemas: [
        {

          schemaId: 'A6_1',
          schemaName: 'handleUserName',
          schemaDesc: '将用户名称添加后缀 "_postfix"',
          nodeType: "RawJsNode",

          context: {
            jsCode: `
    console.log('准备给用户信息中的名称添加后缀: ', name, age);
    return {name: name + '_postfix', age: 18};
    `
          },
          inputDataFieldDefs: [
            {
              name: 'name',
              type: 'STRING'
            },
            {
              name: 'age',
              type: 'NUMBER'
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

          schemaId: 'A6_2',
          schemaName: 'userInfoAgePlusTen',
          schemaDesc: '用户信息中的年龄+10',
          nodeType: "RawJsNode",

          context: {
            jsCode: `
    const {name, age} = userInfo;
    return { name, age: age + 10 };
    `
          },
          inputDataFieldDefs: [
            {
              name: 'userInfo',
              type: 'OBJECT'
            },
          ],
          outputDataFieldDefs: [
            {
              name: 'name',
              type: "STRING"
            },
            {
              name: 'age',
              type: "NUMBER"
            }
          ]
        },
        {
          schemaId: 'A6_3',
          schemaName: 'printUserInfo',
          schemaDesc: '打印用户信息，并返回',
          nodeType: "RawJsNode",

          context: {
            jsCode: `
              alert(name);
              alert(age);
              return { name, age };
            `
          },
          inputDataFieldDefs: [
            {
              name: 'name',
              type: "STRING"
            },
            {
              name: 'age',
              type: "NUMBER"
            }
          ],
          outputDataFieldDefs: [
            {
              name: 'userInfo',
              type: "OBJECT"
            }
          ]
        }
      ],
      routerSchemas: [
        {
          schemaId: 'rr1',
          schemaName: '',
          schemaDesc: '',
          startId: 'A6_1',
          targetId: 'A6_2',
          condition: {
            type: 'always'
          }
        },
        {
          schemaId: 'rr2',
          schemaName: '',
          schemaDesc: '',
          startId: 'A6_2',
          targetId: 'A6_3',
          condition: {
            type: 'always'
          }
        },
      ],
      inputDataFieldDefs: [
        {
          name: 'name',
          type: 'STRING'
        },
        {
          name: 'age',
          type: 'NUMBER'
        }
      ],
      startId: 'A6_1'
    }
  ],
  nodeSchemas: [
    {

      schemaId: 'A1',
      schemaName: 'getToken',
      schemaDesc: '获取API调用前的Token',
      nodeType: "RawJsNode",

      context: {
        jsCode: `
    console.log('初始数据initData: ', initData);
    const {originalToken} = initData;
    return {
        originalToken, 
        seconds: new Date().getSeconds()
    };
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
          name: 'originalToken',
          type: "STRING"
        },
        {
          name: 'seconds',
          type: 'NUMBER'
        }
      ]
    },
    {
      schemaId: 'A2_1',
      schemaName: 'buildEvenToken',
      schemaDesc: '生成偶数秒的Token',
      nodeType: "RawJsNode",

      context: {
        jsCode: `
        return 'EVEN_' + originalToken;
    `
      },
      inputDataFieldDefs: [
        {
          name: 'originalToken',
          type: "STRING"
        }
      ],
      outputDataFieldDefs: [
        {
          name: 'token',
          type: "STRING"
        }
      ]
    },
    {
      schemaId: 'A2_2',
      schemaName: 'buildOddToken',
      schemaDesc: '生成奇数秒的Token',
      nodeType: "RawJsNode",

      context: {
        jsCode: `
        return 'ODD_' + originalToken;
    `
      },
      inputDataFieldDefs: [
        {
          name: 'originalToken',
          type: "STRING"
        }
      ],
      outputDataFieldDefs: [
        {
          name: 'token',
          type: "STRING"
        }
      ]
    },
    {
      schemaId: 'A3',
      schemaName: 'buildApiRequest',
      schemaDesc: '构建API请求数据',
      nodeType: "RawJsNode",

      context: {
        jsCode: `
        return {
            token: token,
            userId: 'user_id_001'
        };
    `
      },
      inputDataFieldDefs: [
        {
          name: 'token',
          type: "STRING"
        }
      ],
      outputDataFieldDefs: [
        {
          name: 'token',
          type: "STRING"
        },
        {
          name: 'userId',
          type: "STRING"
        }
      ]
    },
    {
      schemaId: 'A4',
      schemaName: 'getUserInfo',
      schemaDesc: '根据ID获取服务端用户信息',
      nodeType: "ApiNode",

      context: {
        url: 'http://localhost:3000/getUserInfoById',
        method: 'GET',
        responseAdapter: `
        const {status, data} = httpResponse;
        if (status !== 200) {
          return { id: 'err_id', name: 'err_user', age: 99 }
        }
        return data;
        `,
        headerFields: ['token'] // 从输入数据包的token添加到Header中
      },
      inputDataFieldDefs: [
        {
          name: 'token',
          type: "STRING"
        },
        {
          name: 'userId',
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
      schemaId: 'A5',
      schemaName: 'printUserInfoAndReturn',
      schemaDesc: '打印服务端用户信息并返回只返回名称name、年龄age',
      nodeType: "RawJsNode",

      context: {
        jsCode: `
    console.log('userInfo: ', userInfo);
    return {
      name: userInfo.name,
      age: userInfo.age
    };
    `
      },
      inputDataFieldDefs: [
        {
          name: 'userInfo',
          type: "OBJECT"
        },
      ],
      outputDataFieldDefs: [
        {
          name: 'name',
          type: 'STRING'
        },
        {
          name: 'age',
          type: 'NUMBER'
        }
      ]
    }
  ],
  routerSchemas: [
    {
      schemaId: 'r1',
      schemaName: '',
      schemaDesc: '秒钟为偶数',
      startId: 'A1',
      targetId: 'A2_1',
      condition: {
        type: 'expression',
        expression: "seconds % 2 === 0"
      }
    },
    {
      schemaId: 'r2',
      schemaName: '',
      schemaDesc: '秒钟为奇数',
      startId: 'A1',
      targetId: 'A2_2',
      condition: {
        type: 'expression',
        expression: "seconds % 2 !== 0"
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
    },
    {
      schemaId: 'r3',
      schemaName: '',
      schemaDesc: '',
      startId: 'A2_1',
      targetId: 'A3',
      condition: {
        type: 'always'
      }
    },
    {
      schemaId: 'r4',
      schemaName: '',
      schemaDesc: '',
      startId: 'A2_2',
      targetId: 'A3',
      condition: {
        type: 'always'
      }
    },
    {
      schemaId: 'r5',
      schemaName: '',
      schemaDesc: '',
      startId: 'A3',
      targetId: 'A4',
      condition: {
        type: 'always'
      }
    },
    {
      schemaId: 'r6',
      schemaName: '',
      schemaDesc: '',
      startId: 'A4',
      targetId: 'A5',
      condition: {
        type: 'always'
      }
    },
    {
      schemaId: 'r6',
      schemaName: '',
      schemaDesc: '',
      startId: 'A5',
      targetId: 'A6',
      condition: {
        type: 'always'
      }
    }
  ],
  startId: 'A1'
};

async function run() {

  const executionManager = new ExecutionManager();
  executionManager.executionWalker.snapshotDetailRecordEnable = true;
  executionManager.executionAspectHandler = (executorBaseSchema, outputDataPack) => {
    console.log('[切面处理器] - 当前要处理的节点：', executorBaseSchema);
    console.log('[切面处理器] - outputDataPack：', outputDataPack);
    return outputDataPack;
  };

  const flowExecutor = executionManager.buildFlowExecutor(flowSchema);

  const outputDataPack = await flowExecutor.execute({
    initData: {
      originalToken: 'abc'
    }
  });

  console.log('流程执行结束，outputDataPack：\n', outputDataPack);
  console.log('流程执行过程：\n', executionManager.executionWalker.executionSnapshotRecords);
}

document.querySelector('#btn').addEventListener('click', () => {
  (async () => {
    await run();
  })();
});

