/**
 * 上报错误类型
 */
export enum ERRORTYPES {
  JS_ERROR = 'JS_ERROR',
  RESOURCE_ERROR = 'RESOURCE_ERROR',
  PROMISE_ERROR = 'PROMISE_ERROR',
  HTTP_LOG = 'HTTP_LOG',
  CONSOLE_INFO = 'CONSOLE_INFO',
  CONSOLE_WARN = 'CONSOLE_WARN',
  CONSOLE_ERROR = 'CONSOLE_ERROR',
  CROSS_SCRIPT_ERROR = 'CROSS_SCRIPT_ERROR',
  UNKNOW_ERROR = 'UNKNOW_ERROR',
  PERFORMANCE = 'PERFORMANCE',
  NETWORK_SPEED = 'NETWORK_SPEED',
  PAGE_CHANGE = 'PAGE_CHANGE',
  USER_CLICK = 'USER_CLICK',
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO'
}

export enum WxAppEvents {
  AppOnLaunch = 'AppOnLaunch', // 刚进入小程序
  AppOnShow = 'AppOnShow', // app onshow
  AppOnHide = 'AppOnHide', // app onHide
  AppOnError = 'AppOnError',
  AppOnPageNotFound = 'AppOnPageNotFound', // 监听小程序要打开的页面不存在事件。
  AppOnUnhandledRejection = 'AppOnUnhandledRejection' // 监听未处理的 Promise 拒绝事件。
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

export type WxEvents = WxAppEvents | WxPageEvents | WxRouteEvents
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
  MITO = 'mito',
  VUE = 'Vue',
  // for miniprogram
  MINI_ROUTE = 'miniRoute',
  MINI_PERFORMANCE = 'miniPerformance',
  MINI_MEMORY_WARNING = 'miniMemoryWarning',
  MINI_NETWORK_STATUS_CHANGE = 'miniNetworkStatusChange',
  MINI_BATTERY_INFO = 'miniBatteryInfo'
}