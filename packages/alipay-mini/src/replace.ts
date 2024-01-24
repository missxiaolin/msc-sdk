import { AliAppEvents, AliEvents, AliRouteEvents, EVENTTYPES } from '../../shared/constant'
import { ReplaceHandler, subscribeEvent, triggerHandlers } from '../../core/subscribe'
import { getCurrentRoute, getNavigateBackTargetUrl } from './utils'
import { getFlag } from '../../utils/global'
import { HandleAliAppEvents } from './handleAliEvents'
import { replaceOld } from '../../utils/helpers'
import { voidFun } from '../../shared/index'

/**
 * @param type
 */
function replace(type: AliEvents | EVENTTYPES) {
  switch (type) {
    case EVENTTYPES.CONSOLE:
      //   replaceConsole()
      break
    case EVENTTYPES.XHR:
      //   replaceNetwork()
      break
    case EVENTTYPES.PERFORMANCE:
      //   replacePerformance()
      break
    case EVENTTYPES.MINI_ROUTE:
      replaceRoute()
    default:
      break
  }
}

/**
 * @param handler
 */
export function addReplaceHandler(handler: ReplaceHandler) {
  if (!subscribeEvent(handler)) return
  replace(handler.type as AliEvents)
}

// 路由
function replaceRoute() {
  if (!getFlag(EVENTTYPES.MINI_ROUTE)) {
    return
  }
  const methods = [
    AliRouteEvents.SwitchTab,
    AliRouteEvents.ReLaunch,
    AliRouteEvents.RedirectTo,
    AliRouteEvents.NavigateTo,
    AliRouteEvents.NavigateBack,
    AliRouteEvents.NavigateToMiniProgram
  ]
  methods.forEach((method) => {
    const originMethod = my[method] as Function
    Object.defineProperty(my, method, {
      writable: true,
      enumerable: true,
      configurable: true,
      value: function (options) {
        let toUrl
        if (method === AliRouteEvents.NavigateBack) {
          toUrl = getNavigateBackTargetUrl(options)
        } else {
          toUrl = options.url
        }
        const data = {
          from: getCurrentRoute(),
          to: toUrl,
          subType: method
        }
        triggerHandlers(EVENTTYPES.MINI_ROUTE, data)

        return originMethod.call(this, options)
      }
    })
  })
}

// app整改
export function replaceApp() {
  if (!App) {
    return
  }
  const originApp = App
  App = function (appOptions) {
    const methods = [AliAppEvents.AppOnShow, AliAppEvents.AppOnError, AliAppEvents.AppOnUnhandledRejection]
    methods.forEach((method) => {
      if (!getFlag(method)) return
      addReplaceHandler({
        callback: (data) => HandleAliAppEvents[method.replace('AppOn', 'on')](data),
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
  }
}
