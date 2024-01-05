import { BREADCRUMBTYPES, Severity, ERRORTYPES_CATEGORY, EVENTTYPES, ERROR_TYPE_RE } from '../shared/index'
import { MITOHttp, ResourceErrorTarget, ReportDataType, Replace } from '../types/index'
import { extractErrorStack, getFlag, getNowFormatTime, getPageURL, getTimestamp, isError } from '../utils/index'
import { breadcrumb } from '../core'
import { resourceTransform } from '../core/transformData'

const HandleEvents = {
  // xhr/fetch 请求重写
  handleHttp(data: MITOHttp, type: BREADCRUMBTYPES): void {
    const status = data.status // 200 or 500
    const isSuceess = status >= 200 && status < 300
    const metrics = {
      type,
      method: data.method,
      level: isSuceess ? Severity.INFO : Severity.ERROR,
      category: ERRORTYPES_CATEGORY.HTTP_LOG,
      status,
      eventType: data.eventType, // load error abort
      pathName: data.url, // 请求路径
      statusText: data.statusText, // 状态码
      duration: data.elapsedTime, // 持续时间
      timeout: data.timeout,
      responseText: data.responseText, // 响应体
      requestText: data.reqData || '',
      happenTime: data.eTime,
      happenDate: getNowFormatTime()
    }
    breadcrumb.push(metrics)
  },
  /**
   * 处理window的error的监听回到
   */
  handleError(errorEvent: ErrorEvent) {
    const target = errorEvent.target as ResourceErrorTarget
    // 资源错误
    if (target.localName && getFlag(EVENTTYPES.RESOURCE)) {
      // 资源加载错误 提取有用数据
      const data = resourceTransform(errorEvent)
      breadcrumb.push({
        ...data,
        category: ERRORTYPES_CATEGORY.RESOURCE_ERROR,
        level: target.localName.toUpperCase() === 'IMG' ? Severity.WARN : Severity.ERROR,
        happenTime: getTimestamp(),
        happenDate: getNowFormatTime()
      })
    }
    // code error
    const { message, filename, lineno, colno, error } = errorEvent
    if (!message) {
      return
    }
    let result: ReportDataType
    if (error && isError(error)) {
      result = extractErrorStack(error, Severity.ERROR)
    }
    // 处理SyntaxError，stack没有lineno、colno
    result || (result = HandleEvents.handleNotErrorInstance(message, filename, lineno, colno))
    breadcrumb.push({
      errorMsg: result.message,
      category: ERRORTYPES_CATEGORY.JS_ERROR,
      type: result.name || 'UnKnowun',
      line: 0,
      col: 0,
      stackTraces: result.stack,
      subType: 'jsError',
      level: Severity.ERROR,
      happenTime: getTimestamp(),
      happenDate: getNowFormatTime()
    })
  },
  /**
   * @param message 
   * @param filename 
   * @param lineno 
   * @param colno 
   * @returns 
   */
  handleNotErrorInstance(message: string, filename: string, lineno: number, colno: number) {
    let name: string | any = 'UNKNOWN'
    const url = filename || getPageURL()
    let msg = message
    console.log(message)
    const matches = message.match(ERROR_TYPE_RE)
    if (matches[1]) {
      name = matches[1]
      msg = matches[2]
    }
    const element = {
      url,
      func: 'UNKNOWN_FUNCTION',
      args: 'UNKNOWN',
      line: lineno,
      col: colno
    }
    return {
      url,
      name,
      message: msg,
      level: Severity.ERROR,
      time: getTimestamp(),
      stack: [element]
    }
  },

  /**
   * history
   * @param data 
   */
  handleHistory(data: Replace.IRouter): void {
    const { to = getPageURL(), from = '', subType = 'popstate', duration = 0 } = data;
    breadcrumb.push({
      level: Severity.INFO,
      category: ERRORTYPES_CATEGORY.PAGE_CHANGE,
      referrer: getPageURL(),
      type: window.performance?.navigation?.type,
      to,
      from,
      subType,
      duration,
      startTime: performance.now(),
      happenTime: getTimestamp(),
      happenDate: getNowFormatTime()
    })
  },

  /**
   * hash
   * @param data 
   */
  handleHashchange(data: Replace.IRouter): void {
    const { to = getPageURL(), from = '', subType = 'popstate', duration = 0 } = data;
    breadcrumb.push({
      level: Severity.INFO,
      category: ERRORTYPES_CATEGORY.PAGE_CHANGE,
      referrer: getPageURL(),
      type: window.performance?.navigation?.type,
      to,
      from,
      subType,
      duration,
      startTime: performance.now(),
      happenTime: getTimestamp(),
      happenDate: getNowFormatTime()
    })
  }
}

export { HandleEvents }
