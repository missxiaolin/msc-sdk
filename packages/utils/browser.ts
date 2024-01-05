import { EVENTTYPES, WxAppEvents, WxPageEvents } from '../shared/index'
import { InitOptions } from '../types/index'
import { setFlag } from './index'

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
  setFlag(EVENTTYPES.VUE, !!paramOptions.watch.vueError)
  // wx App
  setFlag(WxAppEvents.AppOnError, !!paramOptions.watch.jsError)
  setFlag(WxAppEvents.AppOnUnhandledRejection, !!paramOptions.watch.promise)
  // setFlag(WxAppEvents.AppOnPageNotFound, !!paramOptions.watch)
  // wx Page
  setFlag(WxPageEvents.PageOnLoad, !!paramOptions.watch.pageChange)
  // mini Route
  // setFlag(EVENTTYPES.MINI_ROUTE, !!paramOptions.watch.pageChange)
}
