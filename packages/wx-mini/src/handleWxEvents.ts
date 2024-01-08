import { getWxMiniDeviceInfo } from './utils'
import { _support } from '../../utils/global'
import { Severity, ERRORTYPES_CATEGORY } from '../../shared/index'
import { parseErrorString, getNowFormatTime, getTimestamp, unknownToString, getPageURL } from '../../utils/helpers'
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
referrerPage = ''

const HandleWxPageEvents = {
	onLoad() {
		breadcrumb.push({
			level: Severity.INFO,
      category: ERRORTYPES_CATEGORY.PAGE_CHANGE,
      referrer:  getPageURL(),
      type: '',
      to: getPageURL(),
      from: referrerPage || getPageURL(),
      subType: '',
      duration: Date.now() - popstateStartTime,
      startTime: getTimestamp(),
      happenTime: getTimestamp(),
      happenDate: getNowFormatTime(),
		})
		popstateStartTime = getTimestamp()
	},
	onAction(e: WechatMiniprogram.BaseEvent) {
		console.log(e)
	}
}

export { HandleWxAppEvents, HandleWxPageEvents }
