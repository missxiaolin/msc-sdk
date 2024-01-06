import { BreadcrumbPushData } from '../types/breadcrumb'
import { InitOptions, FinalReportType, TransportDataType, DeviceInfo, EMethods } from '../types/index'
import { _support, formatUrlToStr, getPageURL, isBrowserEnv, isWxMiniEnv, validateOption } from '../utils/index'
import Queue from '../utils/queue'

/**
 * 用来传输数据类，包含img标签、xhr请求
 * 功能：支持img请求和xhr请求、可以断点续存（保存在localstorage），
 * 待开发：目前不需要断点续存，因为接口不是很多，只有错误时才触发，如果接口太多可以考虑合并接口、
 *
 * ../class Transport
 */
export class TransportData {
  queue: Queue
  url = ''
  trackUrl = ''
  monitorAppId = ''
  reportType = 1
  uuId: void | any

  constructor() {
    this.queue = new Queue()
  }
  
  /**
   * 校验是不是服务端上报地址
   * @param targetUrl 
   * @returns 
   */
  isSdkTransportUrl(targetUrl: string): boolean {
    let isSdkDsn = false
    if (this.url && targetUrl.indexOf(this.url) !== -1) {
      isSdkDsn = true
    }
    if (this.trackUrl && targetUrl.indexOf(this.trackUrl) !== -1) {
      isSdkDsn = true
    }
    return isSdkDsn
  }

  /**
   * 初始化参数
   * @param options 
   */
  bindOptions(options: InitOptions = {}): void {
    const {
      monitorAppId,
      uuId,
      report,
    } = options
    const { url, trackUrl, reportType, maxQueues } = report
    validateOption(monitorAppId, 'monitorAppId', 'string') && (this.monitorAppId = monitorAppId)
    validateOption(url, 'url', 'string') && (this.url = url)
    validateOption(trackUrl, 'trackUrl', 'string') && (this.trackUrl = trackUrl)
    validateOption(reportType, 'reportType', 'number') && (this.reportType = reportType)
    validateOption(uuId, 'uuId', 'function') && (this.uuId = uuId)
    // 设置请求最大值
    validateOption(maxQueues, 'maxQueues', 'number') && (this.queue.setMaxQueues(maxQueues))
  }

  /**
   * @param data 
   * @returns 
   */
  async beforePost(data: FinalReportType) {
    const transportData = this.getTransportData(data)
    return transportData
  }

  /**
   * 拿到全局设备参数
   * @returns 
   */
  getDeviceInfo(): DeviceInfo | any {
    return _support.deviceInfo || {}
  }

  /**
   * 组装参数
   * @param data 
   * @returns 
   */
  getTransportData(data: FinalReportType): TransportDataType {
    const pageUrl = getPageURL();
    return {
      appUid: {
        monitorAppId: this.monitorAppId,
        uuId: this.uuId ? this.uuId() : ''
      },
      deviceInfo: this.getDeviceInfo(),
      lists: [{
        ...data,
        pageUrl: pageUrl,
        simpleUrl: formatUrlToStr(pageUrl)
      }]
    }
  }

  /**
   * 发送请求
   * @param data 
   * @returns 
   */
  async send(data: BreadcrumbPushData) {
    const result = await this.beforePost(data)
    if (!result) return
    if (isBrowserEnv) {
      return this.xhrPost(result, this.url)
    }
    if (isWxMiniEnv) {
      // return this.wxPost(result, dsn)
    }
  }

  /**
   * @param data 
   * @param url 
   */
  async xhrPost(data: any, url: string) {
    const requestFun = (): void => {
      const xhr = new XMLHttpRequest()
      xhr.open(EMethods.Post, url)
      xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
      xhr.withCredentials = true
      xhr.send(JSON.stringify({
        data: data
      }))
    }
    this.queue.pushToQueue(requestFun)
  }
}

const transportData = _support.transportData || (_support.transportData = new TransportData())
export { transportData }
