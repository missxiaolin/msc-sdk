import { validateOption } from '../../utils/helpers'
import {
  WxPerformanceInitOptions,
  WxPerformanceData,
  WxPerformanceItem,
  WxNetworkType,
  WxPerformanceEntryObj,
  WxPerformanceAnyObj
} from '../types/index'
import { WxPerformanceDataType, WxPerformanceItemType } from '../constant'
import { noop, getPageUrl } from '../utils'
import Event from './event'

class Store extends Event {
  immediately?: boolean
  maxBreadcrumbs?: number
  report: (data: Array<WxPerformanceData>) => void

  private stack: Array<WxPerformanceData>

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
    const { maxBreadcrumbs, immediately, reportCallback } = options
    validateOption(immediately, 'immediately', 'boolean') && (this.immediately = immediately)
    validateOption(maxBreadcrumbs, 'maxBreadcrumbs', 'number') && (this.maxBreadcrumbs = maxBreadcrumbs)
    this.report = validateOption(reportCallback, 'report', 'function') ? reportCallback : noop
    this.stack = []
  }

  /**
   * @param now 
   */
  setLaunchTime(now: number) {
    this.wxLaunchTime = now
  }

  /**
   * 获取网络状态
   * @returns
   */
  async _getNetworkType(): Promise<WxNetworkType> {
    let nk = { networkType: 'none', errMsg: '' } as WechatMiniprogram.GetNetworkTypeSuccessCallbackResult
    try {
      nk = await this.getNetworkType()
    } catch (err) {
      console.warn(`getNetworkType err = `, err)
    }
    return nk.networkType
  }

  /**
   * 数据
   * @param type
   * @param item
   * @returns
   */
  async _createPerformanceData(type: WxPerformanceDataType, item: Array<WxPerformanceItem>): Promise<WxPerformanceData> {
    const networkType = await this._getNetworkType()
    const date = new Date()
    return {
      timestamp: date.getTime(),
      time: date.toLocaleString(),
      networkType: networkType,
      batteryLevel: this.getBatteryInfo().level,
      systemInfo: this._getSystemInfo(),
      wxLaunch: this.wxLaunchTime,
      page: getPageUrl(),
      type: type,
      item: item
    }
  }

  /**
   * @param type
   * @param data
   */
  push(type: WxPerformanceDataType, data: WxPerformanceItem | Array<WxPerformanceItem>) {
    switch (type) {
      case WxPerformanceDataType.WX_LIFE_STYLE:
      case WxPerformanceDataType.WX_NETWORK:
        this.simpleHandle(type, data as WxPerformanceItem)
        break
      case WxPerformanceDataType.MEMORY_WARNING:
        this.handleMemoryWarning(data as WechatMiniprogram.OnMemoryWarningCallbackResult)
        break
      case WxPerformanceDataType.WX_PERFORMANCE:
        this.handleWxPerformance(data as Array<WxPerformanceItem>)
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
      this._pushData([d])
      this.firstAction = true
    }
  }

  /**
   * @param entry
   */
  buildNavigationStart(entry: WxPerformanceEntryObj) {
    if (entry.entryType === 'navigation') {
      // appLaunch时没有navigationStart
      this.navigationMap[entry.path] = entry.navigationStart || entry.startTime
    }
  }

  async handleWxPerformance(data: Array<WxPerformanceItem> = []) {
    const _data: Array<WxPerformanceItem> = data.map((d) => {
      this.buildNavigationStart(d)
      d.itemType = WxPerformanceItemType.Performance
      d.timestamp = Date.now()
      return d
    })
    const item = await this._createPerformanceData(WxPerformanceDataType.WX_PERFORMANCE, _data)
    this._pushData([item])
  }

  /**
   * 内存警告会立即上报
   * @param data
   */
  async handleMemoryWarning(data: WechatMiniprogram.OnMemoryWarningCallbackResult) {
    const d = await this._createPerformanceData(WxPerformanceDataType.MEMORY_WARNING, [
      { ...data, itemType: WxPerformanceItemType.MemoryWarning, timestamp: Date.now() }
    ])
    this.report([d])
  }

  /**
   * 处理数据
   * @param type
   * @param data
   */
  async simpleHandle(type: WxPerformanceDataType, data: WxPerformanceItem) {
    const d = await this._createPerformanceData(type as WxPerformanceDataType, [data])
    this._pushData([d])
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
  async _pushData(data: Array<WxPerformanceData>) {
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
        this._pushData([data])
      }
    }, 1000)
  }
}

export default Store
