export interface AliPerformanceAnyObj {
  [k: string]: any
}

export interface AliPerformanceInitOptions {
  /**
   * 上报方法
   */
  reportCallback: (data: AliPerformanceAnyObj) => void
}

export enum AliPerformanceDataType {
  MEMORY_WARNING = 'memory-waring', // MEMORY_WARNING
  ALI_PERFORMANCE = 'ali-performance', // WX_PERFORMANCE
  ALI_RESOURCE_FLOW = 'ali-resource-flow' // 资源
}

export enum AliPerformanceItemType {
  MemoryWarning = 'AliMemory',
  Performance = 'AliPerformance',
}

export type Listener = (...args: any[]) => void