const express = require('express');
const app = express();

// 路由：字符串类型
app.get('/getUserInfoById', function (req, res) {
  const {id: userId} = req.query;
  res.json({
    userId: userId,
    username: 'GET_name_' + Math.random()
  });
});

app.post('/post-example', (req, res) => {
  const {id: userId} = req.body;
  res.json({
    userId: userId,
    username: 'POST_name_' + Math.random()
  });
});

app.listen(3000);
