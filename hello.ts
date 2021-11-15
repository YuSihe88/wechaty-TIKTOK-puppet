import express from 'express'
import http from 'http'
import axios from 'axios' // 引入axios框架，做数据获取用
import cores from 'cors' // 引入cores，用来解决跨域
import bodyParser from 'body-parser'
//import asyncify from 'express-asyncify';


const app = express()
//const app = asyncify(express());


//返回一个平台要求的challenge值
//var router = express.Router();
const server = http.createServer(app)

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cores()); // 解决浏览器跨域问题
app.post('/',function(req: express.Request,res: express.Response){
  //console.log('start time', Date.now(),'content', JSON.stringify(req.body.content))
  console.log(req.body.content)
  res.send(req.body.content)
  //res.end(req.body.content);
});


//这是一个获取token的函数+函数声明
async function get_token(url_code: string) {

  console.log(`your url_code is：${url_code}`)

  const data = await axios.post('https://open.douyin.com/oauth/access_token/', {
    headers: {
      'Content-Type': 'multipart/form-database'
    },
    client_secret: '9f4d56eb2e104551d2abceb51e34237e',
    code: url_code,
    grant_type: 'authorization_code',
    client_key: 'awb1n7jdmttcsk2h'
  })
 const content_token = data.data['data']['access_token']
 console.log("token_________"+content_token)
 const  content_id = data.data['data']['open_id']
  //const info = {"content_id": content_id,"content_token":content_token}
  console.log("content_id_________"+content_id)

  return { content_token, content_id }
}


//获取开发平台返回的code
app.get('/douyin/get_code', (req: { query: { [x: string]: any } },res: { send: (arg0: string) => void }) => { 
  res.send(`your code is:${req.query["code"]}`) 
  console.log(`your code is:${req.query["code"]}`)
  
  get_token(req.query.code)//这里调用了get_token函数
  //原本是想在操作函数中调用，但是操作函数中识别不了req字段
  //希望还是能在项目完成后整理一下逻辑关系
  })
  //此时，我们的电脑会给出一个code！！！！（老牛逼了！）

  

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





/*axios.post('https://open.douyin.com//oauth/access_token/?data&message', new FormData({
  
}))*/

//获取code
async function get_code() 
{
  //获取抖音用户授权界面
    const data = await axios.get('https://open.douyin.com/platform/oauth/connect/', 
    {
      params: 
      {
        client_key :' awb1n7jdmttcsk2h',
        response_type : 'code',
        scope : 'item.comment,fans.list,user_info',
        redirect_uri : 'https://yusihe.loca.lt/douyin/get_code',//（将获得的code返回到这个网址）
        state : 1
      }
    }


  )

  console.log(`https://open.douyin.com/platform/oauth/connect/?client_key=awb1n7jdmttcsk2h&response_type=code&scope=item.comment,fans.list,user_info&redirect_uri=https://yusihe.loca.lt/douyin/get_code&state=1`)
  //https://open.douyin.com/platform/oauth/connect/?client_key=awb1n7jdmttcsk2h&response_type=code&scope=item.comment,fans.list,user_info&redirect_uri=https://yusihe.loca.lt/douyin/get_code&state=1
  const qrUrl = data.request._redirectable. _currentUrl
  //const qrUrl = 'https://open.douyin.com/platform/oauth/connect/?client_key=awb1n7jdmttcsk2h&response_type=code&scope=item.comment,fans.list,user_info&redirect_uri=https://yusihe.loca.lt/douyin/get_code&state=1'
  console.log(data.request._redirectable. _currentUrl)
    await screenShot(qrUrl)
    //await run().catch((error) => console.error(error.stack))
    async function screenShot(qrUrl:string)
    {
      const options = 
      {
        path: 'douyin-puppet.jpg',  // set's the name of the output image'
        fullPage: false,
        // dimension to capture
        clip: 
        {
          x: 670,   // x coordinate
          y: 220,   // y coordinate
          width: 175,      // width
          height: 175   // height
        }
      }

   app.get('/',async function(req: { query: { code: any; }; },res: { end: (arg0: void) => void; }){
    const url_code = req.query["code"]
    //req.query.code
    await basicInfo(url_code)
    console.log("用户扫码user_info成功")
    res.end(console.log("用户扫码user_info成功"))

//    return url_code;
  })
}

  //操作函数 (调用其他函数)
async function basicInfo(code:string){

  const { content_token, content_id }=await get_token(code)
  
  await getUserinformation(content_id,content_token)

  await getFans(content_id,content_token)

  await eventListen()

}


//函数一：试图得到这个access_token：可以看到这里的code=url_code


//get请求获用户信息
async function getUserinformation(id : string, token : string) {//调用接口，发送请求，列举参数，打印输出
  const User_data =await axios.get('https://open.douyin.com/oauth/userinfo', {
    params: {
      open_id :id,
      access_token : token
    }
  })
  console.log("-------------------------------id + token-------")
  console.log(id)
  console.log(token)
  const Userinfo= User_data.data['data']
  const nickname = User_data.data['data']['nickname']
  console.log(nickname + "已登陆")
  console.log("--------------登陆用户基本信息-------------")
  console.log(Userinfo)
  return(await User_data).data['data']
}

//get请求粉丝列表
async function getFans(id : string,token : string) {
  const User_fans = axios.get('https://open.douyin.com/fans/list/',{
    params : {
      open_id : id,
      count : 10,
      access_token : token
    }
  })
  console.log("正在获取粉丝列表....")
  console.log("--------------粉丝基本情况-----------------")
  const fansInfo = (await User_fans).data['data']
  console.log(fansInfo)

}


function run() {
  throw new Error('Function not implemented.')
}

function eventListen() {
  throw new Error('Function not implemented.')
}

}

http.createServer(app).listen(3000, () => {
  console.log('server running at port 3000');
  console.log(`请点击次网址完成登陆！：https://open.douyin.com/platform/oauth/connect/?client_key=awb1n7jdmttcsk2h&response_type=code&scope=item.comment,fans.list,user_info&redirect_uri=https://yusihe.loca.lt/douyin/get_code&state=1`)
  
})


