import { Breadcrumb } from '../core/index'
import { BreadcrumbPushData } from './breadcrumb'

type CANCEL = null | undefined | boolean

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE' | 'OPTIONS'

export enum EMethods {
  Get = 'GET',
  Post = 'POST',
  Put = 'PUT',
  Delete = 'DELETE'
}

interface IRequestHeaderConfig {
  url: HttpMethod
  method: string
}

type TSetRequestHeader = (key: string, value: string) => {}
export interface IBeforeAppAjaxSendConfig {
  setRequestHeader: TSetRequestHeader
}

export interface InitOptions extends HooksTypes {
  /**
   * 为false时，整个sdk将禁用
   */
  monitorSwitch?: boolean
  /**
   * 项目id
   */
  monitorAppId?: string
  /**
   * 获取用户
   */
  uuId?: any
  report?: {
    /**
     * 错误监控的dsn服务器地址
     */
    url?: string
    /**
     * 自定义上报地址
     */
    trackUrl?: string
    /**
     * 1:fetch 2:img
     */
    reportType?: number
    /**
     * img 尽量限制在 10条
     */
    maxQueues?: number
    /**
     * 是否加密
     */
    encryption?: number
    /**
     * 间隔
     */
    delay: number
  }
  watch?: {
    whiteScreen: boolean
    /**
     * 页面
     */
    pageChange: boolean
    /**
     * js 错误
     */
    jsError: boolean
    /**
     * vue 错误
     */
    vueError: boolean
    /**
     * promise
     */
    promise: boolean
    /**
     * 性能
     */
    performance: boolean
    /**
     * 点击
     */
    click?: boolean
    /**
     * 资源
     */
    resource?: boolean
    /**
     * 网络
     */
    request?: boolean
    /**
     * 在引入wx-mini的情况下，使用该参数用来开启
     */
    enableTrack?: boolean
  }

  customInfo?: {
    // 获取动态传参  (1.4.5版本及以后支持该方式)
    getDynamic: void
  }

  /**
   * 默认为空，所有ajax都会被监听，不为空时，filterXhrUrlRegExp.test(xhr.url)为true时过滤
   */
  filterXhrUrlRegExp?: RegExp

  /**
   * 按钮点击和微信触摸事件节流时间，默认是0
   */
  throttleDelayTime?: number
}

export interface HooksTypes {
  /**
   * 钩子函数，在每次添加用户行为事件前都会调用
   *
   * ../param breadcrumb 由SDK生成的breacrumb事件栈
   * ../param hint 当次的生成的breadcrumb数据
   * ../returns 如果返回 null | undefined | boolean 时，将忽略本次的push
   */
  beforePushBreadcrumb?(breadcrumb: Breadcrumb, hint: BreadcrumbPushData): CANCEL
  /**
   * 在状态小于400并且不等于0的时候回调用当前hook
   * ../param data 请求状态为200时返回的响应体
   * ../returns 如果返回 null | undefined | boolean 时，将忽略本次的上传
   */
  // afterSuccessHttp?<T>(data: T): string | CANCEL
  /**
   * 钩子函数，拦截用户页面的ajax请求，并在ajax请求发送前执行该hook，可以对用户发送的ajax请求做xhr.setRequestHeader
   * ../param config 当前请求的
   */
  beforeAppAjaxSend?(config: IRequestHeaderConfig, setRequestHeader: IBeforeAppAjaxSendConfig): void
}
