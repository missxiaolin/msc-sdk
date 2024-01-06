import { ReplaceHandler, subscribeEvent } from '../../core/subscribe'
import { getFlag } from '../../utils/global'
import { replaceOld } from '../../utils/helpers'
import { voidFun, WxAppEvents, WxEvents, EVENTTYPES } from '../../shared/index'
import { triggerHandlers } from '../../core/subscribe'
import { HandleWxAppEvents } from './handleWxEvents'

/**
 * @param type 
 */
function replace(type: WxEvents | EVENTTYPES) {
	switch (type) {
		case EVENTTYPES.XHR:
			// replaceNetwork()
			break
		case EVENTTYPES.MINI_ROUTE:
			// replaceRoute()
		default:
			break
	}
}

/**
 * @param handler 
 */
export function addReplaceHandler(handler: ReplaceHandler) {
	if (!subscribeEvent(handler)) return
	replace(handler.type as WxEvents)
}

export function replaceApp() {
	if (App) {
		const originApp = App
		App = function (appOptions: WechatMiniprogram.App.Option) {
			const methods = [WxAppEvents.AppOnShow, WxAppEvents.AppOnError, WxAppEvents.AppOnUnhandledRejection]
			methods.forEach((method) => {
				if (!getFlag(method)) return
				addReplaceHandler({
          callback: (data) => HandleWxAppEvents[method.replace('AppOn', 'on')](data),
          type: method
				})
				replaceOld(
          appOptions,
          method.replace('AppOn', 'on'),
          function (originMethod: voidFun) {
            return function (...args: any): void {
              // 让原本的函数比抛出的hooks先执行，便于埋点判断是否重复
              if (originMethod) {
                originMethod.apply(this, args)
              }
              triggerHandlers.apply(null, [method, ...args])
            }
          },
          true
        )
			})
			return originApp(appOptions)
		} as WechatMiniprogram.App.Constructor
	}
}
