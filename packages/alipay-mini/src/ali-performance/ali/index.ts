import { replaceOld } from '../../../../utils/helpers'
import Store from '../core/store'
import { AliPerformanceDataType } from '../types'

/**
 * 性能数据整合
 * @param store 
 * @param entryList 
 */
function handlePerformanceData(store: Store, entryList) {
    const arr = []
    const obj = {}
    entryList.getEntries().forEach((entry: any) => {
        if (entry.entryType == "render") {
            arr.push(entry)
            return
        }
        obj[`${entry.name}name`] = entry.name || ''
        obj[`${entry.name}duration`] = entry.duration || 0
        obj[`${entry.name}entryType`] = entry.entryType || ''
        obj[`${entry.name}startTime`] = entry.startTime || ''
        if (entry.navigationType) {
            obj[`${entry.name}navigationType`] = entry.navigationType || ""
        }
        if (entry.packageName) { // 渲染层执行渲染结束时间。仅 firstRender 指标有效。
            obj[`${entry.name}packageName`] = entry.packageName || ''
        }
        if (entry.packageSize) { // 渲染层执行渲染结束时间。仅 firstRender 指标有效。
            obj[`${entry.name}packageSize`] = entry.packageSize || 0
        }

        if (entry.viewLayerReadyTime) { // 渲染层代码注入完成时间。仅 firstRender 指标有效。
            obj[`${entry.name}viewLayerReadyTime`] = entry.viewLayerReadyTime || 0
        }
        if (entry.initDataSendTime) { // 首次渲染参数从逻辑层发出的时间。仅 firstRender 指标有效。
            obj[`${entry.name}initDataSendTime`] = entry.initDataSendTime || 0
        }
        if (entry.initDataRecvTime) { // 首次渲染参数在渲染层收到的时间。仅 firstRender 指标有效。
            obj[`${entry.name}initDataRecvTime`] = entry.initDataRecvTime || 0
        }
        if (entry.viewLayerRenderStartTime) { // 渲染层执行渲染开始时间。仅 firstRender 指标有效。
            obj[`${entry.name}viewLayerRenderStartTime`] = entry.viewLayerRenderStartTime || 0
        }
        if (entry.viewLayerRenderEndTime) { // 渲染层执行渲染结束时间。仅 firstRender 指标有效。
            obj[`${entry.name}viewLayerRenderEndTime`] = entry.viewLayerRenderEndTime || 0
        }
    })
    // 性能数据
    if (Object.keys(obj).length > 0) {
        store.handleWxPerformance(AliPerformanceDataType.ALI_PERFORMANCE, obj)
    }
    // 资源
    if (arr.length > 0) {
        store.handleWxPerformance(AliPerformanceDataType.ALI_RESOURCE_FLOW, obj)
    }
}

/**
 * 监听性能数据
 * @param store 
 * @returns 
 */
export function initAliPerformance(store: Store) {
  // @ts-ignore
  if (!my || !my.getPerformance) {
    return
  }
  // 获取 performance 实例
  // @ts-ignore
  const performance = my.getPerformance()
  // 创建 observer
  const observer = performance.createObserver((entryList: any) => {
    handlePerformanceData(store, entryList)
  })
  observer.observe({ entryTypes: ['render', 'navigation', 'script', 'loadPackage', 'resource'] })
}