// @ts-ignore
import UAParser from './ua-parser'

export const uaParser = () => {
  const {
    ua,
    fingerPrint,
    browser: { name: browserName, version: browserVersion },
    engine: { name: engineName },
    device: { type: deviceType, model: deviceModel, vendor: deviceVendor },
    os: { name: osName, version: osVersion }
  } = new UAParser().getResult()
  const {
    screen: { height: screenHeight = '', width: screenWidth = '' },
    navigator: {
      language = [],
      // @ts-ignore
      connection: { effectiveType = '' }
    }
  } = window
  const uas = {
    deviceType: deviceType || 'PC', // 设备类型
    OS: `${osName} ${osVersion}`, // 操作系统
    browserInfo: `${browserName} ${browserVersion}`, // 浏览器信息
    device: deviceType && deviceVendor ? `${deviceVendor}` : `${browserName}` ? `${browserName}` : '', // 设备类型
    deviceModel: deviceType ? deviceModel : engineName,
    screenHeight, // 屏幕高
    screenWidth, // 屏幕宽
    language, // 当前使用的语言-国家
    netWork: effectiveType, // 联网类型
    fingerPrint, // 浏览器指纹
    userAgent: ua
  }

  return uas
}

/**
 * @param entry
 * @returns
 */
export function isCache(entry) {
  return entry.transferSize === 0 || (entry.transferSize !== 0 && entry.encodedBodySize === 0)
}

export function resolveNavigationTiming(entry) {
  /**
 {
      navigationStart,  // 同一个浏览器上下文中，上一个文档结束时的时间戳。如果没有上一个文档，这个值会和 fetchStart 相同。
      unloadEventStart,  // 上一个文档 unload 事件触发时的时间戳。如果没有上一个文档，为 0。
      unloadEventEnd, // 上一个文档 unload 事件结束时的时间戳。如果没有上一个文档，为 0。
      redirectStart, // 表示第一个 http 重定向开始时的时间戳。如果没有重定向或者有一个非同源的重定向，为 0。
      redirectEnd, // 表示最后一个 http 重定向结束时的时间戳。如果没有重定向或者有一个非同源的重定向，为 0。
      fetchStart, // 表示浏览器准备好使用 http 请求来获取文档的时间戳。这个时间点会在检查任何缓存之前。
      domainLookupStart, // 域名查询开始的时间戳。如果使用了持久连接或者本地有缓存，这个值会和 fetchStart 相同。
      domainLookupEnd, // 域名查询结束的时间戳。如果使用了持久连接或者本地有缓存，这个值会和 fetchStart 相同。
      connectStart, // http 请求向服务器发送连接请求时的时间戳。如果使用了持久连接，这个值会和 fetchStart 相同。
      connectEnd, // 浏览器和服务器之前建立连接的时间戳，所有握手和认证过程全部结束。如果使用了持久连接，这个值会和 fetchStart 相同。
      secureConnectionStart, // 浏览器与服务器开始安全链接的握手时的时间戳。如果当前网页不要求安全连接，返回 0。
      requestStart, // 浏览器向服务器发起 http 请求(或者读取本地缓存)时的时间戳，即获取 html 文档。
      responseStart, // 浏览器从服务器接收到第一个字节时的时间戳。
      responseEnd, // 浏览器从服务器接受到最后一个字节时的时间戳。
      domLoading, // dom 结构开始解析的时间戳，document.readyState 的值为 loading。
      domInteractive, // dom 结构解析结束，开始加载内嵌资源的时间戳，document.readyState 的状态为 interactive。
      domContentLoadedEventStart, // DOMContentLoaded 事件触发时的时间戳，所有需要执行的脚本执行完毕。
      domContentLoadedEventEnd,  // DOMContentLoaded 事件结束时的时间戳
      domComplete, // dom 文档完成解析的时间戳， document.readyState 的值为 complete。
      loadEventStart, // load 事件触发的时间。
      loadEventEnd, // load 时间结束时的时间。
      renderBlockingStatus, //谷歌107版本增加 可以精确识别页面上的资源是否有渲染阻塞；
    }
 */
  const {
    domainLookupStart,
    domainLookupEnd,
    connectStart,
    connectEnd,
    secureConnectionStart,
    requestStart,
    responseStart,
    responseEnd,
    domInteractive,
    domContentLoadedEventEnd,
    loadEventStart,
    fetchStart,
    type,
    renderBlockingStatus,
    redirectEnd,
    redirectStart,
    nextHopProtocol,
    domComplete,
    loadEventEnd
  } = entry

  return {
    // 白屏时间
    FP: responseEnd - fetchStart,
    Redirec: redirectEnd - redirectStart,
    // 首次可交互时间（TTI）：即 Time to interactive，记录从页面加载开始，到页面处于完全可交互状态所花费的时间。
    TTI: domInteractive === 0 ? 0 : domInteractive - fetchStart,
    // HTML加载完成时间也就是 DOM Ready 时间。
    DomReady: domContentLoadedEventEnd === 0 ? 0 : domContentLoadedEventEnd - fetchStart,
    // 页面完全加载时间
    Load: loadEventEnd === 0 ? 0 : loadEventEnd - fetchStart,
    // 首包时间
    FirseByte: responseStart - domainLookupStart,

    // 关键时间段
    // DNS查询耗时
    DNS: domainLookupEnd - domainLookupStart,
    // TCP连接耗时
    TCP: connectEnd - connectStart,
    // 	SSL安全连接耗时
    SSL: secureConnectionStart ? connectEnd - secureConnectionStart : 0,
    // 请求响应耗时
    TTFB: responseStart - requestStart,
    // 内容传输耗时
    Trans: responseEnd - responseStart,
    // DOM解析耗时
    DomParse: domComplete === 0 ? 0 : domComplete - domInteractive,
    // 资源加载耗时
    Res: loadEventStart - domContentLoadedEventEnd,
    type,
    renderBlockingStatus,
    nextHopProtocol
    // entry
  }
}

/**
 * @description : 原生获取 cookie
 */
export const getCookie = (name: string) => {
  let resultVal = ''
  if (!name) return resultVal
  const splitName: any[] = name.split('.')
  const cookieKey = splitName.splice(0, 1)[0]
  // RegExp 和 match
  let arr: any = [];
  const reg = new RegExp('(^| )' + cookieKey + '=([^;]*)(;|$)')
  arr = document.cookie.match(reg)
  if (arr) {
    // 编码转换
    const cKey = decodeURIComponent(arr[2])
    if (splitName.length) {
      const ObjcKey = JSON.parse(cKey)
      let forVal = ''
      for (let i = 0, len = splitName.length; i < len; i++) {
        if (!i) {
          forVal = ObjcKey[splitName[i]]
        } else {
          forVal = forVal[splitName[i]]
        }
      }
      return (resultVal = forVal)
    }
    resultVal = cKey
  } else {
    return resultVal
  }
  return resultVal
}

/**
 *  排除不统计资源
 * @param {*} resource
 * @returns
 */
export function isIgnoreResource(resource) {
  const ignoreList = ['xmlhttprequest'] // 排除资源
  const { initiatorType, name } = resource
  return ignoreList.includes(initiatorType) || name.includes('/monitor/upload')
}

/**
 *  @description 计算资源加载时间
 * @param {*} entry
 * @returns
 */
export function resolveResourceTiming(entry) {
  /**
 // PerformanceResourceTiming 各字段说明
  {
    connectEnd, // 表示浏览器完成建立与服务器的连接以检索资源之后的时间
    connectStart, // 表示浏览器开始建立与服务器的连接以检索资源之前的时间
    decodedBodySize, // 表示在删除任何应用的内容编码之后，从*消息主体*的请求（HTTP 或缓存）中接收到的大小（以八位字节为单位）
    domainLookupEnd, // 表示浏览器完成资源的域名查找之后的时间
    domainLookupStart, // 表示在浏览器立即开始资源的域名查找之前的时间
    duration, // 返回一个timestamp，即 responseEnd 和 startTime 属性的差值
    encodedBodySize, // 表示在删除任何应用的内容编码之前，从*有效内容主体*的请求（HTTP 或缓存）中接收到的大小（以八位字节为单位）
    entryType, // 返回 "resource"
    fetchStart, // 表示浏览器即将开始获取资源之前的时间
    initiatorType, // 代表启动性能条目的资源的类型，如 PerformanceResourceTiming.initiatorType 中所指定
    name, // 返回资源 URL
    nextHopProtocol, // 代表用于获取资源的网络协议
    redirectEnd, // 表示收到上一次重定向响应的发送最后一个字节时的时间
    redirectStart, // 表示上一次重定向开始的时间
    requestStart, // 表示浏览器开始向服务器请求资源之前的时间
    responseEnd, // 表示在浏览器接收到资源的最后一个字节之后或在传输连接关闭之前（以先到者为准）的时间
    responseStart, // 表示浏览器从服务器接收到响应的第一个字节后的时间
    secureConnectionStart, // 表示浏览器即将开始握手过程以保护当前连接之前的时间
    serverTiming, // 一个 PerformanceServerTiming 数组，包含服务器计时指标的PerformanceServerTiming 条目
    startTime, // 表示资源获取开始的时间。该值等效于 PerformanceEntry.fetchStart
    transferSize, // 代表所获取资源的大小（以八位字节为单位）。该大小包括响应标头字段以及响应有效内容主体
    workerStart // 如果服务 Worker 线程已经在运行，则返回在分派 FetchEvent 之前的时间戳，如果尚未运行，则返回在启动 Service Worker 线程之前的时间戳。如果服务 Worker 未拦截该资源，则该属性将始终返回 0。
  }
 */

  const {
    name,
    duration,
    transferSize,
    initiatorType,
    startTime,
    responseEnd,
    domainLookupEnd,
    domainLookupStart,
    connectStart,
    connectEnd,
    secureConnectionStart,
    responseStart,
    requestStart,
    nextHopProtocol,
    renderBlockingStatus
  } = entry
  return {
    // name 资源地址
    name,
    // http协议版本
    nextHopProtocol,
    // transferSize 传输大小
    transferSize,
    // initiatorType 资源类型
    initiatorType,
    // startTime 开始时间
    startTime,
    // responseEnd 结束时间
    responseEnd,
    // 贴近 Chrome 的近似分析方案，受到跨域资源影响
    dns: domainLookupEnd - domainLookupStart,
    tcp: connectEnd - connectStart,
    // SSL安全连接耗时
    ssl: secureConnectionStart ? connectEnd - secureConnectionStart : 0,
    // 请求耗时
    ttfb: responseStart - requestStart,
    // 资源下载时间
    contentDownload: responseEnd - responseStart,
    // 资源的总耗时（包括等待时长，请求时长，响应时长，相当于 responseEnd - startTime）
    duration,
    renderBlockingStatus,
    // 计算每次加载的命中缓存
    isCache: isCache(entry)
  }
}
