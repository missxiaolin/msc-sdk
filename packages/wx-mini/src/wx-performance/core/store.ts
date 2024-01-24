import { toStringValidateOption, validateOption } from '../../../../utils/helpers'
import {
  WxPerformanceInitOptions,
  WxPerformanceItem,
  WxPerformanceAnyObj
} from '../types/index'
import { WxPerformanceDataType, WxPerformanceItemType } from '../constant/index'
import { noop, getPageUrl } from '../utils/index'
import Event from './event'

class Store extends Event {
  immediately?: boolean
  maxBreadcrumbs?: number
  ignoreUrl?: RegExp
  report: (data: any) => void

  private stack: Array<any>

  // wx
  systemInfo: WechatMiniprogram.SystemInfo

  getBatteryInfo: () => WechatMiniprogram.GetBatteryInfoSyncResult
  getNetworkType: <T extends WechatMiniprogram.GetNetworkTypeOption = WechatMiniprogram.GetNetworkTypeOption>(
    option?: T
  ) => WechatMiniprogram.PromisifySuccessResult<T, WechatMiniprogram.GetNetworkTypeOption>

  // 小程序launch时间
  wxLaunchTime: number
  // 首次点击标志位
  private firstAction: boolean = false

  // 路由跳转start时间记录
  private navigationMap: WxPerformanceAnyObj = {}

  constructor(options: WxPerformanceInitOptions) {
    super()
    const { maxBreadcrumbs, immediately, reportCallback, ignoreUrl } = options
    validateOption(immediately, 'immediately', 'boolean') && (this.immediately = immediately)
    validateOption(maxBreadcrumbs, 'maxBreadcrumbs', 'number') && (this.maxBreadcrumbs = maxBreadcrumbs)
    this.report = validateOption(reportCallback, 'report', 'function') ? reportCallback : noop
    toStringValidateOption(ignoreUrl, 'ignoreUrl', '[object RegExp]') && (this.ignoreUrl = ignoreUrl)
    this.stack = []
  }

  filterUrl(url: string) {
    if (this.ignoreUrl && this.ignoreUrl.test(url)) return true
    return false
  }

  /**
   * @param now 
   */
  setLaunchTime(now: number) {
    this.wxLaunchTime = now
  }

  /**
   * 数据
   * @param type
   * @param item
   * @returns
   */
  async _createPerformanceData(type: WxPerformanceDataType, item: WxPerformanceAnyObj | number): Promise<WxPerformanceAnyObj> {
    return {
			[type]: {
				name: type,
				value: item,
				page: getPageUrl(),
			}
    }
  }

  /**
   * @param type
   * @param data
   */
  push(type: WxPerformanceDataType, data: number | WxPerformanceAnyObj) {
    switch (type) {
      case WxPerformanceDataType.WX_LIFE_STYLE:
      case WxPerformanceDataType.WX_NETWORK:
        this.simpleHandle(type, data as WxPerformanceItem)
        break
      case WxPerformanceDataType.MEMORY_WARNING: // 内存告警
        this.handleMemoryWarning(data)
        break
      case WxPerformanceDataType.WX_PERFORMANCE: // 性能
				this.handleWxPerformance(data)
				break
      case WxPerformanceDataType.WX_USER_ACTION:
        this.handleWxAction(data as WxPerformanceItem)
        break
      default:
    }
  }

  // 只统计首次点击
  async handleWxAction(data: WxPerformanceItem) {
    if (!this.firstAction) {
      const d = await this._createPerformanceData(WxPerformanceDataType.WX_USER_ACTION, [data])
      this._pushData(d)
      this.firstAction = true
    }
  }

	/**
	 * 性能
	 * @param data 
	 */
  async handleWxPerformance(data: number | WxPerformanceAnyObj) {
		// const item = await this._createPerformanceData(WxPerformanceDataType.WX_PERFORMANCE, data)
    this._pushData(data)
  }

  /**
   * 内存警告会立即上报
   * @param data
   */
  async handleMemoryWarning(data: WxPerformanceAnyObj | number) {
    const d = await this._createPerformanceData(WxPerformanceDataType.MEMORY_WARNING, data)
    this.report(d)
  }

  /**
   * 处理数据
   * @param type
   * @param data
   */
  async simpleHandle(type: WxPerformanceDataType, data: WxPerformanceItem) {
    const d = await this._createPerformanceData(type as WxPerformanceDataType, [data])
    this._pushData(d)
  }

  /**
   * 系统信息
   * @returns
   */
  _getSystemInfo(): WechatMiniprogram.SystemInfo {
    !this.systemInfo && (this.systemInfo = wx.getSystemInfoSync())
    return this.systemInfo
  }

  /**
   * 发送数据
   * @param data
   * @returns
   */
  async _pushData(data: WxPerformanceAnyObj | number) {
    if (this.immediately) {
      this.report(data)
      return
    }
    this.stack = this.stack.concat(data)
  }

  /**
   * 发送请求
   */
  async reportLeftData() {
    this.report([...this.stack])
    this.stack = []
  }

  customPaint() {
    const now = Date.now()
    const path = getPageUrl(false)
    setTimeout(async () => {
      if (path && this.navigationMap[path]) {
        const navigationStart = this.navigationMap[path]
        const data = await this._createPerformanceData(WxPerformanceDataType.WX_LIFE_STYLE, [
          {
            itemType: WxPerformanceItemType.WxCustomPaint,
            navigationStart: navigationStart,
            timestamp: now,
            duration: now - navigationStart
          }
        ])
        this._pushData(data)
      }
    }, 1000)
  }
}

export default Store
