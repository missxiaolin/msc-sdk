import generateUniqueID from '../utils/generateUniqueID';
import { InitOptions } from '../types/index'
import { setSilentFlag, validateOption, toStringValidateOption } from '../utils/index'
import { _support } from '../utils/index'
import { breadcrumb } from './breadcrumb'
import { transportData } from './transportData'

export class Options {
  traceIdFieldName = 'Trace-Id'

  beforeAppAjaxSend: Function = () => {}
  enableTraceId: Boolean
  filterXhrUrlRegExp: RegExp
  includeHttpUrlTraceIdRegExp: RegExp

  throttleDelayTime = 0

  /**
     * 白屏监控
     */
  whiteScreen?: boolean
  /**
   * 白屏检测的项目是否有骨架屏
   */
  skeletonProject?: boolean
  /**
   * 白屏检测的容器列表
   */
  whiteBoxElements?: string[];

  // 录屏使用
  silentRecordScreen: boolean = false
  recordScreenTypeList: string[] = []

  constructor() {
    this.enableTraceId = false
  }

  /**
   * 初始化栈
   * @param options 
   */
  bindOptions(options: InitOptions = {}): void {
    const { beforeAppAjaxSend, filterXhrUrlRegExp, throttleDelayTime, watch, traceIdFieldName, includeHttpUrlTraceIdRegExp } = options
    validateOption(beforeAppAjaxSend, 'beforeAppAjaxSend', 'function') && (this.beforeAppAjaxSend = beforeAppAjaxSend)
    toStringValidateOption(filterXhrUrlRegExp, 'filterXhrUrlRegExp', '[object RegExp]') && (this.filterXhrUrlRegExp = filterXhrUrlRegExp)
    toStringValidateOption(includeHttpUrlTraceIdRegExp, 'includeHttpUrlTraceIdRegExp', '[object RegExp]') &&
      (this.includeHttpUrlTraceIdRegExp = includeHttpUrlTraceIdRegExp)
    validateOption(throttleDelayTime, 'throttleDelayTime', 'number') && (this.throttleDelayTime = throttleDelayTime)
    validateOption(traceIdFieldName, 'traceIdFieldName', 'string') && (this.traceIdFieldName = traceIdFieldName)
    // 白屏检测的
    validateOption(watch.whiteScreen, 'whiteScreen', 'boolean') && (this.whiteScreen = watch.whiteScreen)
    validateOption(watch.skeletonProject,'skeletonProject', 'boolean') && (this.skeletonProject = watch.skeletonProject)
    validateOption(watch.whiteBoxElements, 'whiteBoxElements', 'array') && (this.whiteBoxElements = watch.whiteBoxElements)
  }
}

const options = _support.options || (_support.options = new Options())

export { options }

/**
 * @param httpUrl 
 * @param callback 
 */
export function setTraceId(httpUrl: string, callback: (headerFieldName: string, traceId: string) => void) {
  const { includeHttpUrlTraceIdRegExp, enableTraceId } = options
  if (enableTraceId && includeHttpUrlTraceIdRegExp && includeHttpUrlTraceIdRegExp.test(httpUrl)) {
    const traceId = generateUniqueID()
    callback(options.traceIdFieldName, traceId)
  }
}

/**
 * init core methods
 * @param paramOptions
 */
export function initOptions(paramOptions: InitOptions = {}) {
  // 初始化状态
  setSilentFlag(paramOptions)
  // 初始化应用重写函数
  breadcrumb.bindOptions(paramOptions)
  // 初始化各类组合参数
  transportData.bindOptions(paramOptions)
  // 绑定其他配置项
  options.bindOptions(paramOptions)
}


