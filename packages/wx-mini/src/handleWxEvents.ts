import { getWxMiniDeviceInfo } from './utils'
import { _support } from '../../utils/global'

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
		
	},
	/**
	 * pomise 
	 * @param ev 
	 */
	onUnhandledRejection(ev: WechatMiniprogram.OnUnhandledRejectionCallbackResult) {

	}
}

export {
	HandleWxAppEvents
}