import { BREADCRUMBTYPES, Severity, ERRORTYPES_CATEGORY, EVENTTYPES, ERROR_TYPE_RE } from '../shared/index'
import { MITOHttp, ResourceErrorTarget, ReportDataType, Replace } from '../types/index'
import { extractErrorStack, formatUrlToStr, getFlag, getNowFormatTime, getPageURL, getTimestamp, isError } from '../utils/index'
import { breadcrumb } from '../core/index'
import { resourceTransform } from '../core/transformData'
import { resolveNavigationTiming, isIgnoreResource, resolveResourceTiming } from './utils'

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
    const { to = getPageURL(), from = '', subType = 'popstate', duration = 0 } = data
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
    const { to = getPageURL(), from = '', subType = 'popstate', duration = 0 } = data
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
   * @param ev
   */
  handleUnhandleRejection(event: PromiseRejectionEvent): void {
    try {
      const { reason = '', timeStamp } = event
      if (!reason) {
        return
      }
      // 判断当前被捕获的异常url，是否是异常处理url，防止死循环
      // if (event.reason.config && event.reason.config.url) {
      //     this.url = event.reason.config.url;
      // }
      // reason = reason.toString()
      const promiseError = {
        level: Severity.WARN,
        category: ERRORTYPES_CATEGORY.PROMISE_ERROR,
        errorMsg: reason,
        startTime: timeStamp,
        happenTime: getTimestamp(),
        happenDate: getNowFormatTime()
      }
      breadcrumb.push(promiseError)
    } catch (error) {
      console.error(error)
    }
  },

  /**
   * 用户点击
   * @param data
   */
  handleDom(data) {
    const event = data.data
    const target = event.target
    const { offsetWidth, offsetHeight, tagName, outerHTML, innerHTML } = target
    const { top, left } = target.getBoundingClientRect()
    const paths = event.path
      ?.map((item) => {
        const { tagName, id, className } = item
        return tagName && `${tagName}${id ? '#' + id : ''}${className ? '.' + className.replace(/''/g, '.') : ''}`
      })
      .filter(Boolean)
    // if (paths && paths.length > 5) {
    //     paths = paths.slice(0, 5)
    // }
    breadcrumb.push({
      level: Severity.INFO,
      category: ERRORTYPES_CATEGORY.USER_CLICK,
      top,
      left,
      pageHeight: document.documentElement.scrollHeight || document.body.scrollHeight,
      scrollTop: document.documentElement.scrollTop || document.body.scrollTop,
      subType: data.category,
      tagName,
      targetInfo: {
        offsetWidth,
        offsetHeight
      },
      paths: paths || '',
      startTime: event.timeStamp,
      outerHTML,
      innerHTML,
      happenTime: getTimestamp(),
      happenDate: getNowFormatTime(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    })
  },
  metricsStore: {},
  /**
   * 性能
   * @param data
   */
  handlePerformance(entryList) {
    this.metricsStore = {}
    const entryTypeEmu = {
      // FP (First Paint) 为首次渲染的时间点，在性能统计指标中，从用户开始访问 Web 页面的时间点到 FP 的时间点这段时间可以被视为 白屏时间，也就是说在用户访问 Web 网页的过程中，FP 时间点之前，用户看到的都是没有任何内容的白色屏幕，用户在这个阶段感知不到任何有效的工作在进行
      'first-paint': 'FP', // 首次非网页背景像素渲染（fp）(白屏时间)
      // FCP (First Contentful Paint) 为首次有内容渲染的时间点，在性能统计指标中，从用户开始访问 Web 页面的时间点到 FCP 的时间点这段时间可以被视为 无内容时间，也就是说在用户访问 Web 网页的过程中，FCP 时间点之前，用户看到的都是没有任何实际内容的屏幕，用户在这个阶段获取不到任何有用的信息。

      'first-contentful-paint': 'FCP', // 首次内容渲染（fcp)(灰屏时间)
      // 最大内容绘画（LCP）是 Core Web Vitals 度量标准，用于度量视口中最大的内容元素何时可见。它可以用来确定页面的主要内容何时在屏幕上完成渲染
      // 'largest-contentful-paint': "LCP",
      // First Input Delay 度量用户第一次与页面交互的延迟时间，是用户第一次与页面交互到浏览器真正能够开始处理事件处理程序以响应该交互的时间
      'first-input': 'FID', // FID 是从用户第一次与页面交互 FID 时间在 100ms 内的能 让用户得到良好的使用体验
      // Cumulative Layout Shift 是对在页面的整个生命周期中发生的每一次意外布局变化的最大布局变化得分的度量
      // 'cumulative-layout-shift': 'CLS',
      navigation: 'NT',
      resource: 'RF'
    }
    let resourceTimesList = []
    // 静态资源加载的缓存命中率:  静态资源的 duration 为0 && 静态资源的 transferSize 不为0
    // let cacheQuantity = 0;
    const length = entryList.length - 1
    entryList.forEach((resource, index) => {
      const { entryType, name, startTime, processingStart, processingEnd } = resource
      if (entryType === 'navigation') {
        this.metricsStore[entryTypeEmu[entryType]] = resolveNavigationTiming(resource)
      } else if (entryType === 'paint' && name === 'first-paint') {
        this.metricsStore[entryTypeEmu[name]] = {
          name: 'first-paint',
          startTime,
          RF: resourceTimesList
        }
        resourceTimesList = []
      } else if (entryType === 'paint' && name === 'first-contentful-paint') {
        this.metricsStore[entryTypeEmu[name]] = {
          name: 'first-contentful-paint',
          startTime,
          RF: resourceTimesList
        }
        resourceTimesList = []
      } else if (entryType === 'first-input') {
        this.metricsStore[entryTypeEmu[entryType]] = {
          name: 'first-input',
          startTime,
          processingStart,
          processingEnd
        }
      } else {
        // 资源
        // 排除 上报接口
        if (!isIgnoreResource(resource) && entryType == 'resource') {
          resourceTimesList.push(resolveResourceTiming(resource))
        }
      }
      if (length === index) {
        this.metricsStore.RF = resourceTimesList
        resourceTimesList = []
      }
    })
    const pageUrl = getPageURL()
    breadcrumb.push({
      level: Severity.INFO,
      category: ERRORTYPES_CATEGORY.PERFORMANCE,
      happenTime: getTimestamp(),
      happenDate: getNowFormatTime(),
      pageUrl,
      simpleUrl: formatUrlToStr(pageUrl),
      ...this.metricsStore
    })
  }
}

export { HandleEvents }
