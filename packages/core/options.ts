import { InitOptions } from '../types/index'
import { setSilentFlag, validateOption, toStringValidateOption } from '../utils/index'
import { _support } from '../utils/index'
import { breadcrumb } from './breadcrumb'
import { transportData } from './transportData'

export class Options {
  beforeAppAjaxSend: Function = () => {}
  enableTraceId: Boolean
  filterXhrUrlRegExp: RegExp

  throttleDelayTime = 0

  constructor() {
    this.enableTraceId = false
  }

  /**
   * 初始化栈
   * @param options 
   */
  bindOptions(options: InitOptions = {}): void {
    const { beforeAppAjaxSend, filterXhrUrlRegExp, throttleDelayTime } = options
    validateOption(beforeAppAjaxSend, 'beforeAppAjaxSend', 'function') && (this.beforeAppAjaxSend = beforeAppAjaxSend)
    toStringValidateOption(filterXhrUrlRegExp, 'filterXhrUrlRegExp', '[object RegExp]') && (this.filterXhrUrlRegExp = filterXhrUrlRegExp)

    validateOption(throttleDelayTime, 'throttleDelayTime', 'number') && (this.throttleDelayTime = throttleDelayTime)
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
}

const options = _support.options || (_support.options = new Options())

export { options }
