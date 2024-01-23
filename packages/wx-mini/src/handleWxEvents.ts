import { getWxMiniDeviceInfo, targetAsString } from './utils'
import { _support, getFlag } from '../../utils/global'
import { Severity, ERRORTYPES_CATEGORY, EVENTTYPES } from '../../shared/index'
import { parseErrorString, getNowFormatTime, getTimestamp, unknownToString, getPageURL, formatUrlToStr } from '../../utils/helpers'
import { breadcrumb } from '../../core/breadcrumb'
import { MITOHttp } from '../../types/common'
import { MiniRoute } from './types'
import { Replace } from '../../types/replace'
import { handleConsole } from '../../core/transformData'
import generateUniqueID from '../../utils/generateUniqueID'


const HandleWxAppEvents = {
  /**
   * 获取device
   * @param options
   */
  async onShow(options: WechatMiniprogram.App.LaunchShowOption) {
    _support.deviceInfo = await getWxMiniDeviceInfo()
    console.log(options, _support.deviceInfo)
  },
  /**
   * js错误
   * @param error
   */
  onError(error: string) {
    if (!getFlag(EVENTTYPES.ERROR)) {
      return
    }
    const parsedError = parseErrorString(error)

    breadcrumb.push({
      errorMsg: parsedError.message,
      category: ERRORTYPES_CATEGORY.JS_ERROR,
      type: parsedError.name || 'UnKnowun',
      line: 0,
      col: 0,
      stackTraces: parsedError.stack,
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
  onUnhandledRejection(ev: WechatMiniprogram.OnUnhandledRejectionCallbackResult) {
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
  subType = '';

const HandleWxPageEvents = {
  onLoad() {
    if (!getFlag(EVENTTYPES.PageOnLoad)) {
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
  onAction(e: WechatMiniprogram.BaseEvent) {
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
        tagName: 'view',
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

const HandleWxEvents = {
  handleRoute(data: MiniRoute) {
    referrerPage = data.from
    subType = data.subType || ''
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

const HandleWxConsoleEvents = {
  console(data: Replace.TriggerConsole) {
    handleConsole(data)
  }
}

export { HandleWxAppEvents, HandleWxPageEvents, HandleNetworkEvents, HandlePerformanceEvents, HandleWxEvents, HandleWxConsoleEvents }
