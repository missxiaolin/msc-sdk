import { BreadcrumbPushData } from '../types/breadcrumb'
import { InitOptions } from '../types/index'
import { _support, slientConsoleScope, validateOption } from '../utils/index'
import { transportData } from './transportData'

export class Breadcrumb {
  beforePushBreadcrumb: unknown = null

  push(data: BreadcrumbPushData): void {
    if (typeof this.beforePushBreadcrumb === 'function') {
      let result: BreadcrumbPushData = null
      // 如果用户输入console，并且logger是打开的会造成无限递归，
      // 应该加入一个开关，执行这个函数前，把监听console的行为关掉
      const beforePushBreadcrumb = this.beforePushBreadcrumb
      slientConsoleScope(() => {
        result = beforePushBreadcrumb(this, data)
      })
      if (!result) return
      this.immediatePush(result)
      return
    }
    this.immediatePush(data)
  }

  /**
   * @param data 
   */
  immediatePush(data: BreadcrumbPushData) {
    /**
     * 发送请求
     */
    transportData.send(data)
  }
  /**
   * 初始化参数
   * @param options
   */
  bindOptions(options: InitOptions = {}): void {
    const { beforePushBreadcrumb } = options
    validateOption(beforePushBreadcrumb, 'beforePushBreadcrumb', 'function') && (this.beforePushBreadcrumb = beforePushBreadcrumb)
  }
}

const breadcrumb = _support.breadcrumb || (_support.breadcrumb = new Breadcrumb())
export { breadcrumb }
