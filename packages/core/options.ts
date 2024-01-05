import { InitOptions } from '../types/index'
import { setSilentFlag, validateOption } from '../utils/index'
import { _support } from '../utils/index'
import { breadcrumb } from './breadcrumb'

export class Options {
  beforeAppAjaxSend: Function = () => {}
  enableTraceId: Boolean

  constructor() {
    this.enableTraceId = false
  }

  bindOptions(options: InitOptions = {}): void {
    const { beforeAppAjaxSend } = options
    validateOption(beforeAppAjaxSend, 'beforeAppAjaxSend', 'function') && (this.beforeAppAjaxSend = beforeAppAjaxSend)
  }
}

/**
 * init core methods
 * @param paramOptions
 */
export function initOptions(paramOptions: InitOptions = {}) {
  setSilentFlag(paramOptions)
  breadcrumb.bindOptions(paramOptions)
}

const options = _support.options || (_support.options = new Options())

export { options }
