import { AliAppEvents, EVENTTYPES, WxAppEvents, WxPageEvents } from '../shared/index'
import { InitOptions } from '../types/index'
import { isAliMiniEnv, isWxMiniEnv, setFlag } from './index'

/**
 * 将地址字符串转换成对象
 * @returns 返回一个对象
 */
export function parseUrlToObj(url: string): {
  host?: string
  path?: string
  protocol?: string
  relative?: string
} {
  if (!url) {
    return {}
  }

  const match = url.match(/^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/)

  if (!match) {
    return {}
  }

  const query = match[6] || ''
  const fragment = match[8] || ''
  return {
    host: match[4],
    path: match[5],
    protocol: match[2],
    relative: match[5] + query + fragment // everything minus origin
  }
}

/**
 * 设置全局参数
 * @param paramOptions
 */
export function setSilentFlag(paramOptions: InitOptions = {}): void {
  setFlag(EVENTTYPES.XHR, !!paramOptions.watch.request)
  setFlag(EVENTTYPES.FETCH, !!paramOptions.watch.request)
  // setFlag(EVENTTYPES.CONSOLE, !!paramOptions.watch.console)
  setFlag(EVENTTYPES.DOM, !!paramOptions.watch.click)
  setFlag(EVENTTYPES.HISTORY, !!paramOptions.watch.pageChange)
  setFlag(EVENTTYPES.ERROR, !!paramOptions.watch.jsError)
  setFlag(EVENTTYPES.HASHCHANGE, !!paramOptions.watch.pageChange)
  setFlag(EVENTTYPES.RESOURCE, !!paramOptions.watch.resource)
  setFlag(EVENTTYPES.UNHANDLEDREJECTION, !!paramOptions.watch.promise)
  setFlag(EVENTTYPES.PERFORMANCE, !!paramOptions.watch.performance)
  setFlag(EVENTTYPES.VUE, !!paramOptions.watch.vueError)
  setFlag(EVENTTYPES.RECORDSCREEN, !!paramOptions.watch.recordScreen)
  // wx App
  if (isWxMiniEnv) {
    setFlag(WxAppEvents.AppOnError, !!paramOptions.watch.jsError)
    setFlag(WxAppEvents.AppOnUnhandledRejection, !!paramOptions.watch.promise)
    setFlag(EVENTTYPES.PageOnLoad, !!paramOptions.watch.pageChange)
  }
  // 支付宝小程序
  if (isAliMiniEnv) {
    setFlag(AliAppEvents.AppOnError, !!paramOptions.watch.jsError)
    setFlag(AliAppEvents.AppOnUnhandledRejection, !!paramOptions.watch.promise)
    setFlag(EVENTTYPES.PageOnLoad, !!paramOptions.watch.pageChange)
  }
}
