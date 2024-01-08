import { getWxMiniDeviceInfo } from './utils'
import { _support } from '../../utils/global'
import { Severity, ERRORTYPES_CATEGORY } from '../../shared/index'
import { parseErrorString, getNowFormatTime, getTimestamp } from '../../utils/helpers'
import { breadcrumb } from '../../core/breadcrumb'

const HandleWxAppEvents = {
  /**
   * 获取device
   * @param options
   */
  async onShow(options: WechatMiniprogram.App.LaunchShowOption) {
    _support.deviceInfo = await getWxMiniDeviceInfo()
    console.log(options, _support.deviceInfo)
  },
  /**
   * js错误
   * @param error
   */
  onError(error: string) {
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
  onUnhandledRejection(ev: WechatMiniprogram.OnUnhandledRejectionCallbackResult) {
    console.log(ev)
  }
}

export { HandleWxAppEvents }
