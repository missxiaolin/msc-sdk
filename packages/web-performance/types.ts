export interface IConfig {
    isCustomEvent?: boolean
    scoreConfig?: object
    logFpsCount?: number
    apiConfig?: object,
    hashHistory?: boolean
    excludeRemotePath?: Array<string>
    maxWaitCCPDuration: number
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