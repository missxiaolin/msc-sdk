import Store from '../core/store'
import { WxPerformanceDataType, WxPerformanceItemType } from '../constant/index'
import HandleEvents from './handleEvents'
import { getPageUrl } from '../utils/index'
import { replaceApp, replaceComponent, replaceNetwork, replacePage } from './replace'

// 电量
function noBatteryInfo(): WechatMiniprogram.GetBatteryInfoSyncResult {
  return {
    level: '0',
    isCharging: false
  }
}

// 网络状态
export function noNetworkType<T extends WechatMiniprogram.GetNetworkTypeOption = WechatMiniprogram.GetNetworkTypeOption>(
  option?: T
): WechatMiniprogram.PromisifySuccessResult<T, WechatMiniprogram.GetNetworkTypeOption> {
  return
  Promise.resolve({
    networkType: 'unknown',
    signalStrength: 0
  })
}

// 内存警告
export function initMemoryWarning(store: Store, need: boolean) {
  if (!need) return
  wx.onMemoryWarning((res: WechatMiniprogram.OnMemoryWarningCallbackResult) => {
    store.push(WxPerformanceDataType.MEMORY_WARNING, res.level)
  })
}

/**
 * @param store
 * @param need
 */
export function initNetworkInfo(store: Store, need: boolean): void {
  store.getNetworkType = need ? wx.getNetworkType : noNetworkType
}

/**
 * 存储用户电量
 * @param store
 * @param need
 */
export function initBatteryInfo(store: Store, need: boolean): void {
  store.getBatteryInfo = need ? wx.getBatteryInfoSync : noBatteryInfo
}

// appHide 发送
export function initWxHideReport(store: Store, immediately: boolean, onAppHideReport: boolean) {
  if (immediately || !onAppHideReport) return
  wx.onAppHide(() => {
    store.reportLeftData()
  })
}

// 微信性能
export function initWxPerformance(store: Store) {
  const performance = wx.getPerformance()
  const observer = performance.createObserver((entryList) => {
		const obj = {}
    const arr = []
		const entries = entryList.getEntries() || []
		entries.forEach(item => {
      if (item.name == 'resourceTiming') {
        arr.push(item)
        return
      }
			obj[`${item.name}name`] = item.name || ''
			obj[`${item.name}duration`] = item.duration || 0
			obj[`${item.name}entryType`] = item.entryType || ""
			obj[`${item.name}startTime`] = item.startTime || ""
			if (item.navigationType) {
				obj[`${item.name}navigationType`] = item.navigationType || ""
			}
			if (item.viewLayerReadyTime) { // 渲染层代码注入完成时间。仅 firstRender 指标有效。
				obj[`${item.name}viewLayerReadyTime`] = item.viewLayerReadyTime || 0
			}
			if (item.initDataSendTime) { // 首次渲染参数从逻辑层发出的时间。仅 firstRender 指标有效。
				obj[`${item.name}initDataSendTime`] = item.initDataSendTime || 0
			}
			if (item.initDataRecvTime) { // 首次渲染参数在渲染层收到的时间。仅 firstRender 指标有效。
				obj[`${item.name}initDataRecvTime`] = item.initDataRecvTime || 0
			}
			if (item.viewLayerRenderStartTime) { // 渲染层执行渲染开始时间。仅 firstRender 指标有效。
				obj[`${item.name}viewLayerRenderStartTime`] = item.viewLayerRenderStartTime || 0
			}
			if (item.viewLayerRenderEndTime) { // 渲染层执行渲染结束时间。仅 firstRender 指标有效。
				obj[`${item.name}viewLayerRenderEndTime`] = item.viewLayerRenderEndTime || 0
			}
			if (item.packageName) { // 渲染层执行渲染结束时间。仅 firstRender 指标有效。
				obj[`${item.name}packageName`] = item.packageName || ''
			}
			if (item.packageSize) { // 渲染层执行渲染结束时间。仅 firstRender 指标有效。
				obj[`${item.name}packageSize`] = item.packageSize || 0
			}
		})
    store.push(WxPerformanceDataType.WX_PERFORMANCE, {
      [WxPerformanceDataType.WX_PERFORMANCE]: {
        name: WxPerformanceDataType.WX_PERFORMANCE,
        value: obj,
        page: getPageUrl(),
      },
      [WxPerformanceDataType.WX_RESOURCE_FLOW]: {
        name: WxPerformanceDataType.WX_RESOURCE_FLOW,
        value: arr,
        page: getPageUrl(),
      }
    })
  })
  observer.observe({ entryTypes: ['navigation', 'render', 'script', 'loadPackage', 'resource'] })
}

// 网络请求性能和点击时间
export function initWxNetwork(store: Store) {
  for (const k in HandleEvents) {
    store.on(k as WxPerformanceItemType, HandleEvents[k])
  }
  replaceApp(store)
  replacePage(store)
  replaceComponent(store)
  replaceNetwork(store)
}
