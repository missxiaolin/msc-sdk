import { WxPerformanceInitOptions } from './types/index'
import Store from './core/store'
import { initBatteryInfo, initNetworkInfo, initMemoryWarning, initWxHideReport, initWxPerformance, initWxNetwork } from './wx/index'

class WxPerformance {
  private store: Store

  constructor(options: WxPerformanceInitOptions) {
    const {
      reportCallback,
      ignoreUrl,
      immediately = true,
      maxBreadcrumbs = 10,
      needNetworkStatus = true,
      needBatteryInfo = true,
      needMemoryWarning = true,
      onAppHideReport = true
    } = options
    const store = new Store({ maxBreadcrumbs, immediately, reportCallback, ignoreUrl })
    this.store = store

    // 用户电量
    initBatteryInfo(store, needBatteryInfo)
    initNetworkInfo(store, needNetworkStatus)
    initMemoryWarning(store, needMemoryWarning)
    // 如果 immediately为false 会在appHide的时候发送数据
    initWxHideReport(store, immediately, onAppHideReport)
    // initWxPerformance(store)
    // initWxNetwork(store)
  }

  customPaint() {
    this.store.customPaint()
  }
}

export { WxPerformance }
