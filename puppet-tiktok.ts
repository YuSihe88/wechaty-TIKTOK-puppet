/* eslint-disable no-unused-expressions */
/* eslint-disable indent */
/* eslint-disable no-undef */
/* eslint-disable semi */
/* eslint-disable sort-keys */
/* eslint-disable comma-dangle */
/* eslint-disable quotes */
/* eslint-disable no-console */
/* eslint-disable camelcase */
/* eslint-disable space-before-function-paren */
/* eslint-disable brace-style */
import http       from 'http'  // ✅
import express    from 'express' // ✅
import bodyParser from 'body-parser'// ✅
import axios      from 'axios'// ✅
import cores      from 'cors' // 引入cores，用来解决跨域
// import readline   from 'readline'
import { VERSION } from '../tiktok/version'
import {
  MessagePayload,
  MessageType,
  Puppet,
  PuppetOptions,
  FileBox,
  EventDongPayload,
  log,
  FriendshipPayload,
  MiniProgramPayload,
  RoomInvitationPayload,
  RoomMemberPayload,
  RoomPayload,
  UrlLinkPayload,
} from 'wechaty-puppet'

export type PuppettiktokServer = {port?: number}

// 两个对象：可以有自己定义的选项和原来的选项
// 可以将用户的key等放到这个对象内，在constructor中就会作为一个参数进行传入
export type PuppettiktokOptions = PuppetOptions & {
  tiktokServer?: PuppettiktokServer
}

// 调用get_token函数    ✅
async function get_token(url_code: string) {

  // console.log(`your url_code is：${url_code}`)

  const data = await axios.post('https://open.douyin.com/oauth/access_token/',
    {
      headers: {
        'Content-Type': 'multipart/form-database'
      },
      client_secret: '91db7a1f78af528d4a7f7299fc3bc231',
      code: url_code,
      grant_type: 'authorization_code',
      client_key: 'aw91pvk29c7jmvad'
    })
  const access_token = data.data['data']['access_token']
  console.log(`---------------第二步：获取token & content_id----------------\n`)
  console.log("your access_token is : " + access_token)
  const open_id = data.data['data']['open_id']
  // const info = {"content_id": content_id,"content_token":content_token}
  console.log("your open_id is : " + open_id)
  console.log(`\n`)
  return access_token

}

// 定义一个新的类，去继承puppet这个虚拟类（实现这个类中定义过的功能）
class Puppettiktok extends Puppet {

  static override VERSION = VERSION

  app: any
  server: any
  messageStore: any
  listStore: any
  imageStore: any
  roomJoinStore: any
  localTunnel: any
  contacts: any
  promise: any
  loginStatus = 'wating'

  // 机器人参数：
  // ✅client_secret: '91db7a1f78af528d4a7f7299fc3bc231'
  // ✅client_key: 'aw91pvk29c7jmvad'
  // your code is:701e1cfca18605ec7FQxn7iTTtLFmK9sVUoY
  // ✅your access_token is : act.8c72c1b63946103b6377046cd4ebcf89M0EpwCUqhEHq0Gfho6mrvBnuGOVx
  // ✅your open_id is : 9d34ba6b-e2e1-4aed-b417-de4a57ba4e36
  // your client_token is :clt.c1c7099b13009863cadc4abec0d5acc6E4e9DWKpJ1NhUpDyD0CgvXHbquqn
  // item_id ：@9Vxdh+OEV5tpPCCrbc48RM791WbgOPyCPpF5oAKnKlgSbfP760zdRmYqig357zEB3lPlgQC8JR1X7CIHr2MZ+w==

  // 这个其实是配置环境变量 ⬇️ 环境变量就是在代码运行开头可以输入的变量
  // appId: string = process.env.WECHATY_PUPPET_tiktok_APPID !
  // appSecret: string = process.env.WECHATY_PUPPET_tiktok_APPSECRET!
  // appVerificationToken: string = process.env.WECHATY_PUPPET_tiktok_TOKEN!

  id: string  = '9d34ba6b-e2e1-4aed-b417-de4a57ba4e36'
  client_key: string = 'aw91pvk29c7jmvad'
  client_secret:  string = '91db7a1f78af528d4a7f7299fc3bc231'
  code: string  = '701e1cfca18605ec7FQxn7iTTtLFmK9sVUoY'
  token?: string
  static loginStatus: string

  // constructor ：一个构造器 ; option ：一些启动参数
  constructor (
    public override options: PuppettiktokOptions = {},
  )
  // 调用父类，绑定环境变量，
  {
    super(options)
  }

  override version () { return VERSION }

  // 用start函数开启一个express服务
  override async start (): Promise<void> {
    this.app = express()
    this.server = http.createServer(this.app)
    this.app.use(bodyParser.json({ limit: '1mb' }))
    this.app.use(bodyParser.urlencoded({ extended: true }))
    this.app.use(cores())
    this.messageStore = {}

    // 监听3000端口
    this.server.listen(3000, () => {
      // eslint-disable-next-line no-console
      console.log('请点击此网址完成登陆！：https://open.douyin.com/platform/oauth/connect/?client_key=aw91pvk29c7jmvad&response_type=code&scope=item.comment,fans.list,user_info&redirect_uri=https://yusihe.loca.lt/douyin/get_code?state=1')
    })

    const basicInfo = async (code: string) => {

      await get_code()    // ✅  （2）调用get_code函数获取code
      this.token = await get_token(code)    // ✅  （3）调用get_token函数➡️生成content_token
    }

    async function get_code() {
      // 获取抖音用户授权界面
      const data = await axios.get('https://open.douyin.com/platform/oauth/connect/',
        {
          params:
          {
            client_key: 'aw91pvk29c7jmvad',
            response_type: 'code',
            scope: 'item.comment,fans.list,user_info',
            redirect_uri: 'https://yusihe.loca.lt/douyin/get_code',
            state: 1
          }
        }
      )
      return data;
    }
    this.app.get('/douyin/get_code', async (req: { query: { [x: string]: any } }, res: { send: (arg0: string) => void }) => {
      res.send(`your code is:${req.query["code"]}`)
      console.log('---------------第一步：获取code----------------\n')
      console.log(`your code is:${req.query["code"]}\n`)
      console.log(`\n`)
      await basicInfo(req.query.code)
      this.loginStatus = 'logged in'
      // 当我们生成一个code后，我们就调用操作函数（1）
    })

    // this.id = this.appId
    this.state.on(true)

    this.app.post('/', async (req: any, _res: any) => // ✅
    {
      const payload = req.body // payload的原理！！非常非常非常重要！🌸
      console.log("    ##监听到一个事件##    " + req.body.event)
      // 事件一：授权事件
      if (payload.event === 'authorize')
      {
        console.log("    ##监听到一个授权事件##    ")
        return null
      }

      // 事件二：回调事件：webhook(姑且把他看成回调事件)
      else if (payload.event === 'receive_msg')
      {
        console.log("    ##监听到一个私信事件##    ")
        console.log(" messageinfo is ：" + payload.content + "\n")
        if (payload.content.text === 'ding')
        {
          // this.messageStore[payload.event.open_message_id] = payload.event
          this.emit('message', {
            messageId: payload.event.open_message_id,
          })
        }
        return null
      }
      //  若消息是未定义的消息，就扔出一个错误
      else {
        console.error('Type undefined: ', payload)
        log.error('Type undefined: ', payload)
        return null
      }
    })

    await new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        if (this.loginStatus === 'logged in') {
          clearInterval(interval)
          resolve()
        }
      }, 500)
    })
    }

  override ding (data?: string): void {
    const eventDongPayload: EventDongPayload = {
      data: data ? data! : 'ding-dong',
      // 条件判断语句：若data有值，则为前面的类型，若没有值，则为后面的类型
    }
    this.emit('dong', eventDongPayload)
  }

  override async stop (): Promise<void> {
    await this.localTunnel.close()
  }

  override async logout (): Promise<void> {
    log.warn('There is no need to use this method \'logout\' in a tiktok bot.')
  }

  override async contactList (): Promise<string[]> {
      // eslint-disable-next-line prefer-const
      let token = this.token
    const User_fans = axios.get('https://open.douyin.com/fans/list/', {
      params: {
        open_id: this.id,
        count: 1,
        access_token: token
      }
    })
    console.log(`---------------调用getFans函数 ➡️ get请求粉丝列表----------------\n`)
    console.log("正在获取粉丝列表....")
    console.log(`\n`)
    console.log("    ##粉丝基本情况##    ")
    console.log(`\n`)
    console.log(`\n`)
    const fansInfo = (await User_fans).data['data']
    console.log(fansInfo)
    return fansInfo

  }

  protected override contactRawPayload (): Promise<any> {
    throw new Error('Method not implemented.')
  }

  protected contactRawPayloadParser (): Promise<import('wechaty-puppet').ContactPayload> {
    throw new Error('Method not implemented.')
  }

  override async messageSendText (_conversationId: string, _text: string): Promise<string | void> {
    const data = await axios.post('https://open.douyin.com/enterprise/im/message/send/?open_id=9d34ba6b-e2e1-4aed-b417-de4a57ba4e36&access_token=act.8c72c1b63946103b6377046cd4ebcf89M0EpwCUqhEHq0Gfho6mrvBnuGOVx', {

      headers:
      { 'Content-Type': 'application/json' },
      message_type: 'text',  // 发送消息的种类，其他 image图片；video视频；card卡片
      to_user_id: '75742155-bddc-4982-87e6-6be93a5591a6',
      // eslint-disable-next-line sort-keys
      content: JSON.stringify({ text : 'dong' }),
    })
    // console.log("私信回复结束！")
    return data.data
  }

  public override async messageRawPayload (messageId: string): Promise<any> {
    return this.messageStore[messageId]
  }

  public override async messageRawPayloadParser (rawPayload: any): Promise<MessagePayload> {
    // tiktokmessage Payload -> Puppet message payload
    const _types: { [key: string]: MessageType } = {
      // file: MessageType.Attachment,
      // image: MessageType.Image,
      text: MessageType.Text,
    }
    const payload: MessagePayload = {
      fromId: rawPayload.from_user_id,
      id: rawPayload.open_id,
      text: rawPayload.content.text,
      timestamp: Date.now(),
      toId: rawPayload.to_user_id, // TODO
      type: _types[rawPayload.content.type],
    }
    return payload
  }

  // friendship
  override async friendshipAccept (): Promise<void> {
    throw new Error('Method not implemented.')
  }

  override async friendshipAdd (): Promise<void> {
    throw new Error('Method not implemented.')
  }

  override async friendshipSearchPhone (): Promise<string> {
    throw new Error('Method not implemented.')
  }

  override async friendshipSearchWeixin (): Promise<string> {
    throw new Error('Method not implemented.')
  }

  protected override friendshipRawPayload (): Promise<any> {
    throw new Error('Method not implemented.')
  }

  // contact
  override contactPhone (): Promise<void> {
    throw new Error('Method not implemented.')
  }

  override contactCorporationRemark (): Promise<void> {
    throw new Error('Method not implemented.')
  }

  override contactDescription (): Promise<void> {
    throw new Error('Method not implemented.')
  }

  override async contactSelfName (): Promise<void> {
    console.error('The name of tiktok bot can not be modified.')
    log.error('The name of tiktok bot can not be modified.')
  }

  override async contactSelfQRCode (): Promise<string> {
    throw new Error('Method not implemented.')
  }

  override async contactSelfSignature (): Promise<void> {
    console.error('The signature of tiktok bot can not be modified.')
    log.error('The signature of tiktok bot can not be modified.')
  }

  override async tagContactAdd (): Promise<void> {
    throw new Error('Method not implemented.')
  }

  override async tagContactDelete (): Promise<void> {
    throw new Error('Method not implemented.')
  }

  override tagContactList(): Promise<string[]>;
  override tagContactList(): Promise<string[]>
  override tagContactList (): Promise<string[]> | null {
    throw new Error('Method not implemented.')
  }

  override async tagContactRemove (): Promise<void> {
    throw new Error('Method not implemented.')
  }

  override contactAlias(contactId: string): Promise<string>
  override contactAlias(contactId: string, alias: string): Promise<void>
  override async contactAlias (): Promise<string | void> {
    console.error('There is no alias in tiktok.')
    log.error('There is no alias in tiktok.')
  }

  override contactAvatar(contactId: string): Promise<FileBox>
  override contactAvatar(contactId: string, file: FileBox): Promise<void>
  override async contactAvatar (): Promise<FileBox | void> {
    console.error('The avatar of tiktok contact can not be modified.')
    log.error('The avatar of tiktok contact can not be modified.')
  }

  // message
  override async messageContact (): Promise<string> {
    throw new Error('Method not implemented.')
  }

  override async messageSendContact (): Promise<string | void> {
    console.error('You can not send contact with bot in tiktok yet.')
    log.error('You can not send contact with bot in tiktok yet.')
  }

  override async messageSendFile (): Promise<string | void> {
    throw new Error('Method not implemented.')
  }

  override async messageSendMiniProgram (): Promise<string | void> {
    log.error('There is no mini program in tiktok.')
  }

  override async messageSendUrl (): Promise<string | void> {
    throw new Error('Method not implemented.')
  }

  override messageRecall (): Promise<boolean> {
    throw new Error('Method not implemented.')
  }

  protected friendshipRawPayloadParser(): Promise<FriendshipPayload> {
    throw new Error('Method not implemented.')
  }

  messageFile(): Promise<FileBox> {
    throw new Error('Method not implemented.')
  }

  messageImage(): Promise<FileBox> {
    throw new Error('Method not implemented.')
  }

  messageMiniProgram(): Promise<MiniProgramPayload> {
    throw new Error('Method not implemented.')
  }

  messageUrl(): Promise<UrlLinkPayload> {
    throw new Error('Method not implemented.')
  }

  roomInvitationAccept(): Promise<void> {
    throw new Error('Method not implemented.')
  }

  protected roomInvitationRawPayload(): Promise<any> {
    throw new Error('Method not implemented.')
  }

  protected roomInvitationRawPayloadParser(): Promise<RoomInvitationPayload> {
    throw new Error('Method not implemented.')
  }

  roomAdd(): Promise<void> {
    throw new Error('Method not implemented.')
  }

  roomAvatar(): Promise<FileBox> {
    throw new Error('Method not implemented.')
  }

  roomCreate(): Promise<string> {
    throw new Error('Method not implemented.')
  }

  roomDel(): Promise<void> {
    throw new Error('Method not implemented.')
  }

  roomList(): Promise<string[]> {
    throw new Error('Method not implemented.')
  }

  roomQRCode(): Promise<string> {
    throw new Error('Method not implemented.')
  }

  roomQuit(): Promise<void> {
    throw new Error('Method not implemented.')
  }

  roomTopic(roomId: string): Promise<string>
  roomTopic(roomId: string, topic: string): Promise<void>
  roomTopic(): Promise<void> | Promise<string> {
    throw new Error('Method not implemented.')
  }

  protected roomRawPayload(): Promise<any> {
    throw new Error('Method not implemented.')
  }

  protected roomRawPayloadParser(): Promise<RoomPayload> {
    throw new Error('Method not implemented.')
  }

  roomAnnounce(roomId: string): Promise<string>
  roomAnnounce(roomId: string, text: string): Promise<void>
  roomAnnounce(): Promise<void> | Promise<string> {
    throw new Error('Method not implemented.')
  }

  roomMemberList(): Promise<string[]> {
    throw new Error('Method not implemented.')
  }

  protected roomMemberRawPayload(): Promise<any> {
    throw new Error('Method not implemented.')
  }

  protected roomMemberRawPayloadParser(): Promise<RoomMemberPayload> {
    throw new Error('Method not implemented.')
  }

}

export { Puppettiktok }
export default Puppettiktok
