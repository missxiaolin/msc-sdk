import { getWxMiniDeviceInfo } from './utils'
import { _support, getFlag } from '../../utils/global'
import { parseErrorString, getNowFormatTime, getTimestamp, unknownToString, getPageURL, formatUrlToStr } from '../../utils/helpers'
import { MiniRoute } from './types'
import { ERRORTYPES_CATEGORY, EVENTTYPES, Severity } from '../../shared/constant'
import { breadcrumb } from '../../core/breadcrumb'

const HandleAliAppEvents = {
  /**
   * 获取device
   * @param options
   */
  async onShow(options) {
    _support.deviceInfo = await getWxMiniDeviceInfo()
    console.log(options, _support.deviceInfo)
  },
  /**
   * JS 错误
   * @param error 
   * @returns 
   */
  onError(error: string) {
    if (!getFlag(EVENTTYPES.ERROR)) {
      return
    }
    const parsedError = parseErrorString(error)

    breadcrumb.push({
      errorMsg: parsedError.message,
      category: ERRORTYPES_CATEGORY.JS_ERROR,
      type: parsedError.name || 'UnKnowun',
      line: 0,
      col: 0,
      stackTraces: parsedError.stack,
      subType: 'jsError',
      level: Severity.ERROR,
      happenTime: getTimestamp(),
      happenDate: getNowFormatTime()
    })
  },
  /**
   * pomise
   * @param ev
   */
  onUnhandledRejection(ev: MiniProgram.App.UnhandledRejectionRes) {
    if (!getFlag(EVENTTYPES.UNHANDLEDREJECTION)) {
      return
    }
    const promiseError = {
      level: Severity.WARN,
      category: ERRORTYPES_CATEGORY.PROMISE_ERROR,
      errorMsg: unknownToString(ev.reason),
      startTime: getTimestamp(),
      happenTime: getTimestamp(),
      happenDate: getNowFormatTime()
    }
    breadcrumb.push(promiseError)
  }
}

let popstateStartTime = getTimestamp(),
  referrerPage = '',
  subType = ''

const HandleAliEvents = {
  handleRoute(data: MiniRoute) {
    referrerPage = data.from
    subType = data.subType || ''
  }
}

export { HandleAliEvents, HandleAliAppEvents }
