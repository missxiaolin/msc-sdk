import { AliAppEvents, AliEvents, AliPageEvents, AliRouteEvents, EVENTTYPES } from '../../shared/constant'
import { ReplaceHandler, subscribeEvent, triggerHandlers } from '../../core/subscribe'
import { getCurrentRoute, getNavigateBackTargetUrl } from './utils'
import { getFlag } from '../../utils/global'
import { HandleAliAppEvents, HandleAliPageEvents } from './handleAliEvents'
import { replaceOld, throttle, getTimestamp } from '../../utils/helpers'
import { voidFun, ELinstenerTypes } from '../../shared/index'
import { options as sdkOptions } from '../../core/options'

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

/**
 * 监听配置项下的页面生命周期函数
 * @param options
 * @param methods
 */
function replacePageLifeMethods(options, methods) {
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
 * @param options 
 */
function replaceAction(options) {
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

// 页面uv pv
export function replacePage() {
  if (!Page) {
    return
  }
  const originPage = Page
  const methods = [AliPageEvents.PageOnLoad]
  methods.forEach((method) => {
    if (!getFlag(method)) return
    addReplaceHandler({
      callback: (data) => HandleAliPageEvents[method.replace('PageOn', 'on')](data),
      type: method
    })
    Page = function (pageOptions) {
      replacePageLifeMethods(pageOptions, methods)
      replaceAction(pageOptions)
      return originPage.call(this, pageOptions)
    }
  })
}
