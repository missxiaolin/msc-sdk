import { EVENTTYPES, WxAppEvents, WxPageEvents } from '../shared/index'
import { InitOptions } from '../types/index'
import { setFlag } from './index'

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
