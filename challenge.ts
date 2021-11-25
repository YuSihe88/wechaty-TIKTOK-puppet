//const localtunnel=require('localtunnel')
const express = require('express');
const http = require('http');
const axios = require('axios'); // 引入axios框架，做数据获取用
const cores = require('cors'); // 引入cores，用来解决跨域
//var router = express.Router();
const app = express();
const server = http.createServer(app)
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cores()); // 解决浏览器跨域问题
app.post('/',function(req: { body: { content: any; }; },res: { send: (arg0: any) => void; }){
    console.log(req.body.content)
    res.send(req.body.content)
  });

app.listen(3000, () => {
            console.log('server running at port 3000');

    })
