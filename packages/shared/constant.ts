export type voidFun = () => void

export enum EMethods {
  Get = 'GET',
  Post = 'POST',
  Put = 'PUT',
  Delete = 'DELETE'
}

/** 等级程度枚举 */
export enum Severity {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO'
}

/**
 * 上报错误类型category
 */
export enum ERRORTYPES_CATEGORY {
  JS_ERROR = 'JS_ERROR',
  RESOURCE_ERROR = 'RESOURCE_ERROR',
  PROMISE_ERROR = 'PROMISE_ERROR',
  HTTP_LOG = 'HTTP_LOG',
  CONSOLE = 'CONSOLE',
  // CONSOLE_INFO = 'CONSOLE_INFO',
  // CONSOLE_WARN = 'CONSOLE_WARN',
  // CONSOLE_ERROR = 'CONSOLE_ERROR',
  // CROSS_SCRIPT_ERROR = 'CROSS_SCRIPT_ERROR',
  UNKNOW_ERROR = 'UNKNOW_ERROR',
  PERFORMANCE = 'PERFORMANCE',
  NETWORK_SPEED = 'NETWORK_SPEED',
  PAGE_CHANGE = 'PAGE_CHANGE',
  USER_CLICK = 'USER_CLICK',
  
}

export enum WxAppEvents {
  AppOnLaunch = 'AppOnLaunch', // 刚进入小程序
  AppOnShow = 'AppOnShow', // app onshow
  AppOnHide = 'AppOnHide', // app onHide
  AppOnError = 'AppOnError',
  AppOnPageNotFound = 'AppOnPageNotFound', // 监听小程序要打开的页面不存在事件。
  AppOnUnhandledRejection = 'AppOnUnhandledRejection' // 监听未处理的 Promise 拒绝事件。
}

export enum AliAppEvents {
  AppOnLaunch = 'AppOnLaunch', // 刚进入小程序
  AppOnShow = 'AppOnShow', // app onshow
  AppOnHide = 'AppOnHide', // app onHide
  AppOnError = 'AppOnError',
  AppOnPageNotFound = 'AppOnPageNotFound', // 监听小程序要打开的页面不存在事件。
  AppOnUnhandledRejection = 'AppOnUnhandledRejection' // 监听未处理的 Promise 拒绝事件。
}

export enum ELinstenerTypes {
  Touchmove = 'touchmove',
  Tap = 'tap',
  Longtap = 'longtap',
  Longpress = 'longpress'
}

export enum WxPageEvents {
  PageOnLoad = 'PageOnLoad',
  PageOnShow = 'PageOnShow',
  PageOnHide = 'PageOnHide',
  PageOnReady = 'PageOnReady',
  PageOnUnload = 'PageOnUnload',
  PageOnShareAppMessage = 'PageOnShareAppMessage',
  PageOnShareTimeline = 'PageOnShareTimeline',
  PageOnTabItemTap = 'PageOnTabItemTap'
}

export enum WxRouteEvents {
  SwitchTab = 'switchTab',
  ReLaunch = 'reLaunch',
  RedirectTo = 'redirectTo',
  NavigateTo = 'navigateTo',
  NavigateBack = 'navigateBack',
  NavigateToMiniProgram = 'navigateToMiniProgram',
  RouteFail = 'routeFail'
}

export enum AliRouteEvents {
  SwitchTab = 'switchTab',
  ReLaunch = 'reLaunch',
  RedirectTo = 'redirectTo',
  NavigateTo = 'navigateTo',
  NavigateBack = 'navigateBack',
  NavigateToMiniProgram = 'navigateToMiniProgram',
  RouteFail = 'routeFail'
}

export enum AliPageEvents {
  PageOnLoad = 'PageOnLoad',
  PageOnShow = 'PageOnShow',
  PageOnHide = 'PageOnHide',
  PageOnReady = 'PageOnReady',
  PageOnUnload = 'PageOnUnload',
  PageOnShareAppMessage = 'PageOnShareAppMessage',
  PageOnShareTimeline = 'PageOnShareTimeline',
  PageOnTabItemTap = 'PageOnTabItemTap'
}

// 微信
export type WxEvents = WxAppEvents | WxPageEvents | WxRouteEvents

// 支付宝
export type AliEvents = AliAppEvents | AliRouteEvents | AliPageEvents

/**
 * 重写的事件类型
 */
export enum EVENTTYPES {
  XHR = 'xhr',
  FETCH = 'fetch',
  CONSOLE = 'console',
  DOM = 'dom',
  HISTORY = 'history',
  ERROR = 'error',
  HASHCHANGE = 'hashchange',
  UNHANDLEDREJECTION = 'unhandledrejection',
  RESOURCE = 'resource',
  PERFORMANCE = 'performance',
  VUE = 'Vue',
  MEMORY_WARNING = 'miniMemoryWarning',
  NETWORK_STATUS_CHANGE = 'miniNetworkStatusChange',
  BATTERY_INFO = 'miniBatteryInfo',
  // for miniprogram
  AppOnShow = 'AppOnShow', // app onshow
  PageOnLoad = 'PageOnLoad',
  PageOnHide = 'PageOnHide',
  MINI_ROUTE = 'miniRoute',
}

/**
 * 用户行为栈事件类型
 */
export enum BREADCRUMBTYPES {
  XHR = 'Xhr',
  FETCH = 'Fetch',
  UNHANDLEDREJECTION = 'Unhandledrejection',
  VUE = 'Vue',
  REACT = 'React',
  RESOURCE = 'Resource',
  CONSOLE = 'Console'
}

export enum HTTPTYPE {
  XHR = 'xhr',
  FETCH = 'fetch'
}

export const ERROR_TYPE_RE = /^(?:[Uu]ncaught (?:exception: )?)?(?:((?:Eval|Internal|Range|Reference|Syntax|Type|URI|)Error): )?(.*)$/

const globalVar = {
  isLogAddBreadcrumb: true,
  crossOriginThreshold: 1000
}
export { globalVar }