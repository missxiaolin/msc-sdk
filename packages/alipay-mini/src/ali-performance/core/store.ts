import { validateOption } from '../../../../utils/helpers'
import { AliPerformanceAnyObj, AliPerformanceInitOptions, AliPerformanceDataType } from '../types'
import Event from './event'
import { noop, getPageUrl } from '../utils/index'

class Store extends Event {
  report: (data: any) => void
  private stack: Array<any>
  private performanceObj: any

  constructor(options: AliPerformanceInitOptions) {
    super()
    const { reportCallback } = options
    this.report = validateOption(reportCallback, 'report', 'function') ? reportCallback : noop
    this.stack = []
  }

  async handleWxPerformance(data: AliPerformanceAnyObj) {
    // this.performanceObj[data.key] = data
  }

  /**
   * 数据
   * @param type
   * @param item
   * @returns
   */
  async _createPerformanceData(type: AliPerformanceDataType, item: AliPerformanceAnyObj | number): Promise<AliPerformanceAnyObj> {
    return {
      [type]: {
        name: type,
        value: item,
        page: getPageUrl()
      }
    }
  }

  /**
   * 内存警告会立即上报
   * @param data
   */
  async handleMemoryWarning(data: AliPerformanceAnyObj) {
    const d = await this._createPerformanceData(AliPerformanceDataType.MEMORY_WARNING, data)
    this.report(d)
  }
}

export default Store
