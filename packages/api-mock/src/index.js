const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

// 路由：字符串类型
app.get('/getUserInfoById', function (req, res) {
  const {id: userId} = req.query;
  res.json({
    userId: userId,
    name: 'GET_name_' + Math.random(),
    age: 20
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
