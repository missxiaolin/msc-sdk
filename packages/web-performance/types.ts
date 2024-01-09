export interface IConfig {
    isCustomEvent?: boolean
    scoreConfig?: object
    logFpsCount?: number
    apiConfig?: object,
    hashHistory?: boolean
    excludeRemotePath?: Array<string>
    maxWaitCCPDuration?: number
    reportCallback: Function
  }

export interface IMetrics {
    name: string
    value: any
    score?: number
  }

export interface IMetricsObj {
    [prop: string]: IMetrics
  }

export interface IWebVitals {
  getCurrentMetrics(): IMetricsObj
}

export interface PerformanceEntryHandler {
  (entry: PerformanceEntry): void
}

export interface OnHiddenCallback {
  (event: Event): void
}

export interface Curve {
  median: number
  podr?: number
  p10?: number
}

export interface IScoreConfig {
  [prop: string]: { median: number; p10: number }
}

export interface IReportHandler {
  (metrics: IMetrics | IMetricsObj): void
}

export interface IPerformanceNavigationTiming {
  dnsLookup?: number
  initialConnection?: number
  ssl?: number
  ttfb?: number
  contentDownload?: number
  domParse?: number
  deferExecuteDuration?: number
  domContentLoadedCallback?: number
  resourceLoad?: number
  domReady?: number
  pageLoad?: number
}

export interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: DOMHighResTimeStamp
  processingEnd: DOMHighResTimeStamp
  duration: DOMHighResTimeStamp
  cancelable?: boolean
  target?: Element
}

export interface LayoutShift extends PerformanceEntry {
  value: number
  hadRecentInput: boolean
}

export interface OnPageChangeCallback {
  (event?: Event): void
}

export interface IEffectiveType {

  type: '4g' | '3g' | '2g' | 'slow-2g'
}

export interface INetworkInformation {
  downlink?: number
  effectiveType?: IEffectiveType
  rtt?: number
}

export interface IPageInformation {
  host: string
  hostname: string
  href: string
  protocol: string
  origin: string
  port: string
  pathname: string
  search: string
  hash: string
  userAgent?: string
  screenResolution: string
}

export interface IDeviceInformation {
  deviceMemory?: number | any
  hardwareConcurrency?: number
  jsHeapSizeLimit?: number
  totalJSHeapSize?: number
  usedJSHeapSize?: number
}