export enum EListenerTypes {
  Touchmove = 'touchmove',
  Tap = 'tap',
  LongTap = 'longtap',
  LongPress = 'longpress'
}

export enum WxPerformanceDataType {
  MEMORY_WARNING = 'memory-waring', // MEMORY_WARNING
  WX_PERFORMANCE = 'wx-performance', // WX_PERFORMANCE
  WX_NETWORK = 'wx-network', // WX_NETWORK
  WX_LIFE_STYLE = 'wx-life_style', // WX_LIFE_STYLE
  WX_USER_ACTION = 'wx-user_action' // WX_LIFE_STYLE
}

export enum WxPerformanceItemType {
  MemoryWarning = 'WxMemory',
  Performance = 'WxPerformance',
  Network = 'WxNetwork',
  AppOnLaunch = 'AppOnLaunch',
  AppOnShow = 'AppOnShow',
  AppOnHide = 'AppOnHide',
  AppOnError = 'AppOnError',
  AppOnPageNotFound = 'AppOnPageNotFound',
  AppOnUnhandledRejection = 'AppOnUnhandledRejection',
  PageOnLoad = 'PageOnLoad',
  PageOnShow = 'PageOnShow',
  PageOnHide = 'PageOnHide',
  PageOnReady = 'PageOnReady',
  PageOnUnload = 'PageOnUnload',
  PageOnShareAppMessage = 'PageOnShareAppMessage',
  PageOnShareTimeline = 'PageOnShareTimeline',
  PageOnTabItemTap = 'PageOnTabItemTap',
  WaterFallFinish = 'WaterFallFinish',
  UserTap = 'WxUserTap',
  UserTouchMove = 'WxUserTouchMove',
  WxRequest = 'WxRequest',
  WxUploadFile = 'WxUploadFile',
  WxDownloadFile = 'WxDownloadFile',
  WxCustomPaint = 'WxCustomPaint'
}

export const WxListenerTypes = {
  [EListenerTypes.Tap]: WxPerformanceItemType.UserTap,
  [EListenerTypes.Touchmove]: WxPerformanceItemType.UserTouchMove
}
