import { Breadcrumb } from "../core/index"
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
  uuId?: void
  report?: {
    /**
     * 错误监控的dsn服务器地址
     */
    url?: string
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
    // 获取动态传参  1.4.5版本及以后支持该方式
    getDynamic: void
  }
}

export interface HooksTypes {
  /**
   * 忽视某些错误不上传
   */
  // ignoreErrors?: Array<string | RegExp>
  /**
   * 默认20，最大100，超过100还是设置成100
   */
  maxBreadcrumbs?: number
  /**
   * 钩子函数，在每次添加用户行为事件前都会调用
   *
   * ../param breadcrumb 由SDK生成的breacrumb事件栈
   * ../param hint 当次的生成的breadcrumb数据
   * ../returns 如果返回 null | undefined | boolean 时，将忽略本次的push
   */
  beforePushBreadcrumb?(breadcrumb: Breadcrumb, hint: BreadcrumbPushData): BreadcrumbPushData | CANCEL
}
