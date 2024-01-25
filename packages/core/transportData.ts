import { getCurrentRoute, getCurrentRoutePlaintext } from '../wx-mini/src/utils'
import { BreadcrumbPushData } from '../types/breadcrumb'
import { InitOptions, FinalReportType, TransportDataType, DeviceInfo, EMethods } from '../types/index'
import { _support, formatUrlToStr, getPageURL, isAliMiniEnv, isBrowserEnv, isWxMiniEnv, validateOption, variableTypeDetection } from '../utils/index'
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
  beforeDataReport: unknown = null
  configReportXhr: unknown = null
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

  setUserId(uuId: any) {
    if (variableTypeDetection.isFunction(uuId)) {
      this.uuId = uuId()
      return
    }
    this.uuId = uuId || ""
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
      beforeDataReport,
      configReportXhr,
    } = options
    const { url, trackUrl, reportType, maxQueues } = report
    validateOption(monitorAppId, 'monitorAppId', 'string') && (this.monitorAppId = monitorAppId)
    validateOption(url, 'url', 'string') && (this.url = url)
    validateOption(trackUrl, 'trackUrl', 'string') && (this.trackUrl = trackUrl)
    validateOption(reportType, 'reportType', 'number') && (this.reportType = reportType)
    this.setUserId(uuId)
    // 设置请求最大值
    validateOption(maxQueues, 'maxQueues', 'number') && (this.queue.setMaxQueues(maxQueues))

    // 钩子函数，在每次发送事件前会调用
    validateOption(beforeDataReport, 'beforeDataReport', 'function') && (this.beforeDataReport = beforeDataReport)
    // 钩子函数，配置发送到服务端的xhr
    validateOption(configReportXhr, 'configReportXhr', 'function') && (this.configReportXhr = configReportXhr)
  }

  /**
   * @param data 
   * @returns 
   */
  async beforePost(data: FinalReportType) {
    let transportData = this.getTransportData(data)
    if (typeof this.beforeDataReport === 'function') {
      transportData = await this.beforeDataReport(transportData)
      if (!transportData) return false
    }
    
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
        uuId: this.uuId ? this.uuId : ''
      },
      deviceInfo: this.getDeviceInfo(),
      lists: [{
        ...data,
        pageUrl: isWxMiniEnv ? getCurrentRoutePlaintext() : pageUrl,
        simpleUrl: isWxMiniEnv ? getCurrentRoute() : formatUrlToStr(pageUrl)
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
      return this.wxPost(result, this.url)
    }
    if (isAliMiniEnv) {
      return this.aliPost(result, this.url)
    }
	}

  /**
	 * 支付宝请求发送
	 * @param data 
	 * @param url 
	 */
	async aliPost(data: any, url: string) {
    const requestFun = (): void => {
      let requestOptions: any = { method: 'POST' }
      requestOptions = {
        ...requestOptions,
        data: JSON.stringify({
					data: data
				}),
        url
      }
      my.request(requestOptions)
    }
		this.queue.pushToQueue(requestFun)
  }

	/**
	 * 微信请求发送
	 * @param data 
	 * @param url 
	 */
	async wxPost(data: any, url: string) {
    const requestFun = (): void => {
      let requestOptions = { method: 'POST' } as WechatMiniprogram.RequestOption
      requestOptions = {
        ...requestOptions,
        data: JSON.stringify({
					data: data
				}),
        url
      }
      wx.request(requestOptions)
    }
		this.queue.pushToQueue(requestFun)
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
      if (typeof this.configReportXhr === 'function') {
        this.configReportXhr(xhr, data)
      }
      xhr.send(JSON.stringify({
        data: data
      }))
    }
    this.queue.pushToQueue(requestFun)
  }
}

const transportData = _support.transportData || (_support.transportData = new TransportData())
export { transportData }
