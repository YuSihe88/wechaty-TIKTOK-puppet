import express from 'express'
import http from 'http'
import axios from 'axios' // 引入axios框架，做数据获取用
import cores from 'cors' // 引入cores，用来解决跨域
import bodyParser from 'body-parser'//二维码阅读器
//import jimp from 'jimp'
//import QRReader from 'qrcode-reader'
//import fs from 'fs'//一个完全用 JavaScript 编写的 Node 图像处理库，零原生依赖
//https://blog.csdn.net/zhaoxiang66/article/details/103250076（fs文件管理系统：读文件，写文件，判断文件是否存在等）
//import asyncify from 'express-asyncify';

//http协议简述
//header:相当于一封信的信封，信封上显示你的名字，寄送的地址，邮编等等
//body:相当于信封内的信息，包括需要接收的参数等等
//params传参:一般用于get请求，params传参时参数会附于rul后面以问号形式展示
//body传参:一般用于post请求，body传参时需要在body里写json数组，参数不会显示在地址栏中
//get:get请求不会用来传账号密码，上述只是一个例子，因为get请求安全性很低，因为get会直接把参数展示在地址栏
//post:post请求一般用来传登录时的账号密码,以json数组的形式传给后台。
//post:请求在body中传参的安全性会比get请求高，因为post是用body中的json数组来传参给后台，url中不可见。
//res.end()与res.send()的区别：res.send() 将检查您的输出结构并相应地设置标题信息；
//在 res.end() 中，您只能使用文本进行响应，并且不会设置“ Content-Type ”

const app = express()   //用的是express框架
//const app = asyncify(express());


//返回一个平台要求的challenge值
//var router = express.Router();
const server = http.createServer(app)


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cores()); // 解决浏览器跨域问题

// router
//app.post('/', function (req: express.Request, res: express.Response) {
//console.log('start time', Date.now(),'content', JSON.stringify(req.body.content))
//console.log(typeof req.body.content)
//res.send(req.body.content)
//res.end(req.body.content);
//});

app.get('/douyin/get_code', (req: { query: { [x: string]: any } }, res: { send: (arg0: string) => void }) => {
  res.send(`your code is:${req.query["code"]}`)
  console.log(`---------------第一步：获取code----------------\n`)
  console.log(`your code is:${req.query["code"]}\n`)
  console.log(`\n`)
  basicInfo(req.query.code)
  //当我们生成一个code后，我们就调用操作函数（1）
})

// serve
server.listen(3000, () => {
  console.log(`请点击此网址完成登陆！：https://open.douyin.com/platform/oauth/connect/?client_key=awb1n7jdmttcsk2h&response_type=code&scope=item.comment,fans.list,user_info&redirect_uri=https://yusihe.loca.lt/douyin/get_code&state=1`)
})









/////////////////////////////////










//（1）操作函数 (调用其他函数的函数)
async function basicInfo(code: string) {

  //await get_code()    // ✅  （2）调用get_code函数获取code 

  const { content_token, content_id } = await get_token(code)    // ✅  （3）调用get_token函数➡️生成content_token

  await getUserinformation(content_id, content_token)   // ✅  （4）调用getUserinformation函数➡️生成id ,token➡️调用getFans函数 

  await getFans(content_id, content_token)    // ✅  （5）调用getFans函数 ➡️ get请求粉丝列表   ✅

  await getFollowing(content_id, content_token)    // ✅  （6）调用getFollowing函数 ➡️ get请求关注列表   ✅   (用户未授权该api)

  client_code = await get_client_code();   // ✅  （7）获取event事件的token。

  await getEvent(client_code);   // ✅  （8）获取事件订阅状态  

  await listen()   //   （9）监听到一个事件  

  //await getCommentList(client_token ,id ,item_id )  //  （9.5）获取评论列表

  //await reply_video(myObject.comment_id)}  //  (10)回复函数

  //await send_message(to_user_id)  //  （11）发送消息

  //await function message_judge(text:string)  //  （12）判断函数
}










/////////////////////////////////////////////









//（2）调用get_code函数获取code     ✅
async function get_code() {
  //获取抖音用户授权界面
  const data = await axios.get('https://open.douyin.com/platform/oauth/connect/',
    {
      params:
      {
        client_key: ' awb1n7jdmttcsk2h',
        response_type: 'code',
        scope: 'item.comment,fans.list,user_info',
        redirect_uri: 'https://yusihe.loca.lt/douyin/get_code',//（将获得的code返回到这个网址）
        state: 1
      }
    }
  )
}







// http.createServer(app).listen(3000, () => {
//   console.log('server running at port 3000');
//   console.log(`请点击此网址完成登陆！：https://open.douyin.com/platform/oauth/connect/?client_key=awb1n7jdmttcsk2h&response_type=code&scope=item.comment,fans.list,user_info&redirect_uri=https://yusihe.loca.lt/douyin/get_code&state=1`)

// })










//////////////////////////////////









//（3）调用get_token函数➡️生成content_token    ✅
async function get_token(url_code: string) {

  //console.log(`your url_code is：${url_code}`)

  const data = await axios.post('https://open.douyin.com/oauth/access_token/',
    {
      headers: {
        'Content-Type': 'multipart/form-database'
      },
      client_secret: '9f4d56eb2e104551d2abceb51e34237e',
      code: url_code,
      grant_type: 'authorization_code',
      client_key: 'awb1n7jdmttcsk2h'
    })
  const content_token = data.data['data']['access_token']
  console.log(`---------------第二步：获取token & content_id----------------\n`)
  console.log("your token is : " + content_token)
  const content_id = data.data['data']['open_id']
  //const info = {"content_id": content_id,"content_token":content_token}
  console.log("your content_id is : " + content_id)
  console.log(`\n`)
  console.log(`\n`)

  //getUserinformation(content_id,content_token)
  //此处调用getUserinformation函数！！！！！！
  return { content_token, content_id }

}







//////////////////////////////////////








//（4）调用getUserinformation函数➡️生成id ,token➡️调用getFans函数   ✅
//get请求获用户信息
async function getUserinformation(id: string, token: string) {//调用接口，发送请求，列举参数，打印输出
  const User_data = await axios.get('https://open.douyin.com/oauth/userinfo', {
    params: {
      open_id: id,
      access_token: token
    }
  })
  console.log(`---------------第三步：调用getUserinformation函数 & 生成id----------------\n`)
  const Userinfo = User_data.data['data']
  const nickname = User_data.data['data']['nickname']
  console.log(nickname + "已登陆")
  console.log("    ##登陆用户基本信息##    ")
  console.log(Userinfo)
  console.log(`\n`)
  console.log(`\n`)

  //getFans(id ,token)//调用函数！！
  return (await User_data).data['data']
}









/////////////////////////////////////










//（5）调用getFans函数 ➡️ get请求粉丝列表   ✅
async function getFans(id: string, token: string) {
  const User_fans = axios.get('https://open.douyin.com/fans/list/', {
    params: {
      open_id: id,
      count: 1,
      access_token: token
    }
  })
  console.log(`---------------第四步：调用getFans函数 ➡️ get请求粉丝列表----------------\n`)
  console.log("正在获取粉丝列表....")
  console.log(`\n`)
  console.log("    ##粉丝基本情况##    ")
  console.log(`\n`)
  console.log(`\n`)
  const fansInfo = (await User_fans).data['data']
  console.log(fansInfo)

}








////////////////////////////////////////








//（6）调用getFollowing函数 ➡️ get请求关注列表   ✅   (用户未授权该api)
async function getFollowing(id: string, token: string) {
  const User_following = axios.get('https://open.douyin.com/following/list/',
    {
      params:
      {
        open_id: id,
        count: 1,
        access_token: token
      }
    })
  console.log(`---------------第五步：调用getFollowing函数 ➡️ get请求关注列表----------------\n`)
  console.log("正在获取关注列表....\n")
  console.log("    ##关注基本情况##    \n")
  console.log(`\n`)
  console.log(`\n`)
  const followingInfo = (await User_following).data['data']
  console.log(followingInfo)

}









///////////////////////////////////////









//（7）获取event事件的token。   ✅
let client_code = ''    //用于调用不需要授权就可以调用的接口
async function get_client_code() {
  console.log("--------------第六步：进入event事件函数开始运行-----------------\n")
  const data = await axios.post('https://open.douyin.com/oauth/client_token',
    {
      headers:
      {
        'Content-Type': 'multipart/form-data'
      },
      client_secret: '9f4d56eb2e104551d2abceb51e34237e',
      grant_type: 'client_credential',
      client_key: 'awb1n7jdmttcsk2h'
    })
  const content_token = data.data['data']['access_token']
  //const info = {"content_id": content_id,"content_token":content_token}
  console.log("\n事件监听启动....\n")

  console.log("your content_token is :" + content_token)
  console.log(`\n`)
  console.log(`\n`)
  return content_token;
}









///////////////////////////////////////////










//（8）获取事件订阅状态      ✅
async function getEvent(client_token: string) {
  const { data } = await axios.get('https://open.douyin.com/event/status/list/', {
    params: {
      access_token: client_token
    }
  })
  const eventstate = data.data
  console.log("---------------第七步：当前事件状态如下！-----------------\n")
  console.log(eventstate)
  console.log(`\n`)
  console.log(`\n`)
}









//////////////////////////////////////////////









//(10)回复函数
async function reply_video(comment_id: string) {
  console.log("-------------第九步，进入回复函数---------------")
  const data = await axios.post('https://open.douyin.com/item/comment/reply/?open_id=edf1c13c-7510-49cf-84c2-90cf488e6a23&access_token=act.2ed0dcac7cadf30a5f7c57e3c4973f15ZK0VjHjvRolK6SyCNsxE73OghRwR', {
   
  headers:
    {
      'Content-Type': 'application/json'
    },
    comment_id: comment_id,
    item_id: '@9VwGh/3FVs09K2Oic9NvSM7802DrOfCDO5R0oQOnKVMUbPf060zdRmYqig357zEBoV43KFUCTA12L0r5GFc8kA==',
    content: 'dong'

  })

  console.log(data.data)
  send_message()
  return data.data
  //  console.log(data)
  //const info = {"content_id": content_id,"content_token":content_token}
}









//////////////////////////////////////








 

//（9）监听到一个事件      
async function listen() {
  console.log("-------------第八步，进入监听函数---------------")
  app.post('/', function (req: { body: { event: string; content: { content: any; }; }; }, res: { end: () => void; }) {
    console.log("    ##监听到一个事件##    " + req.body.event)
  
    if (req.body.event == 'item_comment_reply') {
      console.log("收到一条视频评论!!!!\n")
      console.log("1：commentinfo is ：" + req.body.content + "\n")
      const data = req.body.content
      console.log("2：content is ：" + data.content + "\n")
      var myObject = eval('(' + data + ')' + "\n");
      console.log("3：myObject.comment_id is ：" + myObject.comment_id + "\n")
      if (myObject.content === "ding") 
      {
        reply_video(myObject.comment_id)
        //这里是试图调用reply_video函数
      }
    }
    // reply_video(comment_id,content_id,content_token)}
    res.end();
  });
}










    /////////////////////////////////////////////










    //（11）发送消息

    async function send_message() {
      const data = await axios.post('https://open.douyin.com/enterprise/im/message/send/?open_id=edf1c13c-7510-49cf-84c2-90cf488e6a23&access_token=act.2ed0dcac7cadf30a5f7c57e3c4973f15ZK0VjHjvRolK6SyCNsxE73OghRwR', {
   
      headers:
        {
          'Content-Type': 'application/json'
        },
        message_type: 'text',//发送消息的种类，其他 image图片；video视频；card卡片
        to_user_id: '48c49190-ca78-4187-bba4-7d5d8e245a80',//消息接收方的openid
        content: { text: "dong" }//这个转义报错了需要改写 ,
      })
      return data.data

    }
  









//////////////////////////////////////////////////////////////////









    /*
    async function send_message(opsend_message(open_id : string)en_id : string) {
      const data = await axios.post('https://open.douyin.com/enterprise/im/message/send/?open_id=${open_id}&access_token=${access_token}', {
        headers: {
          'Content-Type': 'application/json'
        },
        message_type : 'text',//发送消息的种类，其他 image图片；video视频；card卡片
        to_user_id : open_id,//消息接收方的openid
        content: {text: "dong"}//这个转义报错了需要改写 ,
      })
      return data.data 
    
    }
    */


    //////////////////////////////////////////







    //（12）判断函数
/* async function message_judge(text: string) {
   const reply_dong = 'dong'
   const reply_introduction = '企业介绍'
   const reply_picture = '这里放置图片id'
   //const reply_link = '这里放置link链接'
   if (text == 'ding') {
     return reply_dong
   } else if (text == '介绍') {
     return reply_introduction
   } else if (text == '图片') {
     return reply_picture
   }
   //return message_judge.toString
 }

*/









//////////////////////////////////////////////////////////










    //（9.5）获取评论列表
/*async function getCommentList(client_token : string,id : string,item_id : string) {
  const {data} =  await axios.get('https://open.douyin.com/item/comment/list/',{
     params : {
      open_id : id,
      count : 10,
      item_id : item_id,
      access_token : client_token
     }
   })
   const CommentList = data.data
   console.log("---------------当前事件状态如下！-----------------\n")
   console.log(CommentList)
 }
 */







    //////////////////////////////////////////