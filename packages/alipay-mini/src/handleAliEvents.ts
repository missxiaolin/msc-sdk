import { ERRORTYPES_CATEGORY, EVENTTYPES, Severity } from '../../shared/constant'
import { parseErrorString, getNowFormatTime, getTimestamp, unknownToString, getPageURL, formatUrlToStr } from '../../utils/helpers'
import { getWxMiniDeviceInfo, targetAsString } from './utils'
import { _support, getFlag } from '../../utils/global'
import { MiniRoute } from './types'
import { MITOHttp } from '../../types/common'
import { breadcrumb } from '../../core/breadcrumb'
import { Replace } from '../../types/replace'
import { handleConsole } from '../../core/transformData'
import generateUniqueID from '../../utils/generateUniqueID'

const HandleAliAppEvents = {
  async onLaunch(options) {
    _support.deviceInfo = await getWxMiniDeviceInfo()
    console.log(options, _support.deviceInfo)
  },
  /**
   * 获取device
   * @param options
   */
  async onShow(options) {
    _support.deviceInfo = await getWxMiniDeviceInfo()
    console.log(options, _support.deviceInfo)
  },
  /**
   * JS 错误
   * @param error
   * @returns
   */
  onError(error: string) {
    if (!getFlag(EVENTTYPES.ERROR)) {
      return
    }
    // const parsedError = parseErrorString(error)

    breadcrumb.push({
      errorMsg: error,
      category: ERRORTYPES_CATEGORY.JS_ERROR,
      type: 'UnKnowun',
      line: 0,
      col: 0,
      stackTraces: [],
      subType: 'jsError',
      level: Severity.ERROR,
      happenTime: getTimestamp(),
      happenDate: getNowFormatTime()
    })
  },
  /**
   * pomise
   * @param ev
   */
  onUnhandledRejection(ev: MiniProgram.App.UnhandledRejectionRes) {
    if (!getFlag(EVENTTYPES.UNHANDLEDREJECTION)) {
      return
    }
    const promiseError = {
      level: Severity.WARN,
      category: ERRORTYPES_CATEGORY.PROMISE_ERROR,
      errorMsg: unknownToString(ev.reason),
      startTime: getTimestamp(),
      happenTime: getTimestamp(),
      happenDate: getNowFormatTime()
    }
    breadcrumb.push(promiseError)
  }
}

let popstateStartTime = getTimestamp(),
  referrerPage = '',
  subType = ''

const HandleAliEvents = {
  handleRoute(data: MiniRoute) {
    referrerPage = data.from
    subType = data.subType || ''
  }
}

const HandleAliPageEvents = {
  onLoad() {
    if (!getFlag(EVENTTYPES.PageOnLoad)) {
      return
    }
    // 首次会慢
    if (!_support.deviceInfo && getCurrentPages().length == 1) {
      setTimeout(() => {
        this.onLoad()
      })
      return
    }
    breadcrumb.push({
      level: Severity.INFO,
      category: ERRORTYPES_CATEGORY.PAGE_CHANGE,
      referrer: getPageURL(),
      type: '',
      to: getPageURL(),
      from: referrerPage || getPageURL(),
      subType,
      duration: Date.now() - popstateStartTime,
      startTime: getTimestamp(),
      happenTime: getTimestamp(),
      happenDate: getNowFormatTime()
    })
    popstateStartTime = getTimestamp()
  },
  onHide() {
    if (!_support.aliStore) {
      return
    }
    // TODO: 执行性能数据上报
    _support.aliStore.reportPerformanceData()
  },
  onAction(e) {
    if (!getFlag(EVENTTYPES.DOM)) {
      return
    }
    // @ts-ignore
    const { target = {}, detail = {}, timeStamp = '', type = '', currentTarget } = e
    try {
      breadcrumb.push({
        level: Severity.INFO,
        category: ERRORTYPES_CATEGORY.USER_CLICK,
        // @ts-ignore
        top: target.offsetTop || currentTarget.offsetTop,
        // @ts-ignore
        left: target.offsetLeft || currentTarget.offsetLeft,
        pageHeight: 0,
        scrollTop: 0,
        subType: type,
        tagName: currentTarget.tagName,
        targetInfo: {
          offsetWidth: 0,
          offsetHeight: 0
        },
        paths: '',
        startTime: timeStamp,
        innerHTML: targetAsString(e),
        happenTime: getTimestamp(),
        happenDate: getNowFormatTime(),
        viewport: {
          width: detail.x || 0,
          height: detail.y || 0
        }
      })
    } catch (e) {
      // Ignore
    }
  }
}

const HandleNetworkEvents = {
  handleRequest(data: MITOHttp) {
    if (!getFlag(EVENTTYPES.XHR)) {
      return
    }
    const isSuceess = data.status == 200
    breadcrumb.push({
      method: data.method,
      pathName: data.url || '', // 请求url
      requestText: data.reqData ? JSON.stringify(data.reqData) : '',
      requestTime: data.sTime,
      type: data.type,
      level: isSuceess ? Severity.INFO : Severity.ERROR,
      category: ERRORTYPES_CATEGORY.HTTP_LOG,
      status: data.status,
      eventType: 'load',
      statusText: '',
      responseText: data.responseText ? JSON.stringify(data.responseText) : '',
      duration: data.elapsedTime,
      happenTime: getTimestamp(),
      happenDate: getNowFormatTime(),
      responseTime: data.eTime,
      timeout: data.timeout || ''
    })
  }
}

const HandleAliConsoleEvents = {
  console(data: Replace.TriggerConsole) {
    handleConsole(data)
  }
}

const HandlePerformanceEvents = {
  handlePerformance(data) {
    const pageUrl = getPageURL()

    breadcrumb.push({
      level: Severity.INFO,
      category: ERRORTYPES_CATEGORY.PERFORMANCE,
      happenTime: getTimestamp(),
      happenDate: getNowFormatTime(),
      pageUrl,
      simpleUrl: formatUrlToStr(pageUrl),
      metrics: {
        sessionId: generateUniqueID(),
        objs: data
      }
    })
  }
}

export { HandleAliEvents, HandleAliAppEvents, HandleAliPageEvents, HandleNetworkEvents, HandleAliConsoleEvents, HandlePerformanceEvents }
