/**
 * Device Info
 * deviceMemory,the deviceMemory read-only property of the Navigator interface returns the approximate amount of device memory in gigabytes.
 * hardwareConcurrency,the navigator.hardwareConcurrency read-only property returns the number of logical processors available to run threads on the user's computer.
 * jsHeapSizeLimit,the maximum size of the heap, in bytes, that is available to the context.
 * totalJSHeapSize,the total allocated heap size, in bytes.
 * usedJSHeapSize,the currently active segment of JS heap, in bytes.
 * userAgent,a user agent is a computer program representing a person, for example, a browser in a Web context.
 * */
import { IDeviceInformation, IMetrics } from '../types'
import { isPerformanceSupported, isNavigatorSupported } from '../utils/isSupported'
import { convertToMB } from '../utils'
import { metricsName } from '../constants'
import metricsStore from '../lib/store'

const getDeviceInfo = (): IDeviceInformation | undefined => {
  if (!isPerformanceSupported()) {
    console.warn('browser do not support performance')
    return
  }

  if (!isNavigatorSupported()) {
    console.warn('browser do not support navigator')
    return
  }

  return {
    deviceMemory: 'deviceMemory' in navigator ? navigator['deviceMemory'] : 0,
    hardwareConcurrency: 'hardwareConcurrency' in navigator ? navigator['hardwareConcurrency'] : 0,
    jsHeapSizeLimit: 'memory' in performance ? convertToMB(performance['memory']['jsHeapSizeLimit']) : 0,
    totalJSHeapSize: 'memory' in performance ? convertToMB(performance['memory']['totalJSHeapSize']) : 0,
    usedJSHeapSize: 'memory' in performance ? convertToMB(performance['memory']['usedJSHeapSize']) : 0
  }
}

/**
 * @param {metricsStore} store
 * */
export const initDeviceInfo = (store: metricsStore): void => {
  const deviceInfo = getDeviceInfo()
  const metrics = { name: metricsName.DI, value: deviceInfo } as IMetrics

  store.set(metricsName.DI, metrics)
}
