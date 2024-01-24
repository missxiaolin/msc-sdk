export interface AliPerformanceAnyObj {
  [k: string]: any
}

export interface AliPerformanceInitOptions {
  /**
   * 上报方法
   */
  reportCallback: (data: AliPerformanceAnyObj) => void
}

export enum WxPerformanceDataType {
  MEMORY_WARNING = 'memory-waring', // MEMORY_WARNING
  WX_PERFORMANCE = 'wx-performance', // WX_PERFORMANCE
  WX_RESOURCE_FLOW = 'wx-resource-flow' // 资源
}

export enum AliPerformanceItemType {
  MemoryWarning = 'AliMemory',
  Performance = 'AliPerformance',
}

export type Listener = (...args: any[]) => void