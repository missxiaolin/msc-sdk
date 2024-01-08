import { ReplaceHandler, subscribeEvent } from '../../core/subscribe'
import { getFlag } from '../../utils/global'
import { replaceOld, throttle } from '../../utils/helpers'
import { voidFun, WxAppEvents, WxEvents, EVENTTYPES, WxPageEvents, ELinstenerTypes } from '../../shared/index'
import { triggerHandlers } from '../../core/subscribe'
import { HandleWxAppEvents, HandleWxPageEvents } from './handleWxEvents'
import { options as sdkOptions } from '../../core/options'

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

/**
 * 监听配置项下的页面生命周期函数
 */
function replacePageLifeMethods(
  options:
    | WechatMiniprogram.Page.Options<WechatMiniprogram.Page.DataOption, WechatMiniprogram.Page.CustomOption>
		| WechatMiniprogram.Component.MethodOption,
	methods
) {
  methods.forEach((method) => {
    replaceOld(
      options,
      method.replace('PageOn', 'on'),
      function (originMethod: (args: any) => void) {
        return function (...args: any[]): void {
          triggerHandlers.apply(null, [method, ...args])
          if (originMethod) {
            return originMethod.apply(this, args)
          }
        }
      },
      true
    )
  })
}

/**
 * 监听配置项下的手势处理方法
 */
function replaceAction(
  options:
    | WechatMiniprogram.Page.Options<WechatMiniprogram.Page.DataOption, WechatMiniprogram.Page.CustomOption>
    | WechatMiniprogram.Component.MethodOption
) {
  function gestureTrigger(e) {
		e.mitoWorked = true // 给事件对象增加特殊的标记，避免被无限透传
    triggerHandlers(EVENTTYPES.DOM, e)
  }
  const throttleGesturetrigger = throttle(gestureTrigger, sdkOptions.throttleDelayTime)
	const linstenerTypes = [ELinstenerTypes.Touchmove, ELinstenerTypes.Tap]
  if (options) {
    Object.keys(options).forEach((m) => {
      if ('function' !== typeof options[m]) {
        return
      }
      replaceOld(
        options,
        m,
        function (originMethod: (args: any) => void) {
          return function (...args: any): void {
            const e = args[0]
            if (e && e.type && e.currentTarget && !e.mitoWorked) {
              if (linstenerTypes.indexOf(e.type) > -1) {
                throttleGesturetrigger(e)
              }
            }
            return originMethod.apply(this, args)
          }
        },
        true
      )
    })
  }
}

export function replacePage() {
	if (!Page) {
		return
	}
	const originPage = Page
	let methods = [WxPageEvents.PageOnLoad]
	methods.forEach((method) => {
		if (!getFlag(method)) return
		addReplaceHandler({
			callback: (data) => HandleWxPageEvents[method.replace('PageOn', 'on')](data),
			type: method
		})
		Page = function (pageOptions): WechatMiniprogram.Page.Constructor {
			replacePageLifeMethods(pageOptions, methods)
			replaceAction(pageOptions)
			return originPage.call(this, pageOptions)
		}
	})

}
