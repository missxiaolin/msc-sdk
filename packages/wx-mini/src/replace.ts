import { ReplaceHandler, subscribeEvent } from '../../core/subscribe'
import { getFlag } from '../../utils/global'
import { replaceOld, throttle, getTimestamp } from '../../utils/helpers'
import {
  voidFun,
  WxAppEvents,
  WxEvents,
  EVENTTYPES,
  WxPageEvents,
  ELinstenerTypes,
  EMethods,
  HTTPTYPE,
  WxRouteEvents
} from '../../shared/index'
import { triggerHandlers } from '../../core/subscribe'
import { HandleWxAppEvents, HandleWxPageEvents } from './handleWxEvents'
import { options as sdkOptions } from '../../core/options'
import { transportData } from '../../core/transportData'
import { MITOHttp } from '../../types/common'
import { variableTypeDetection, isEmptyObject } from '../../utils/is'
import { getCurrentRoute, getNavigateBackTargetUrl } from './utils'
import { MiniRoute } from './types'
import { WxPerformance } from '../../wx-performance/index'

/**
 * @param type
 */
function replace(type: WxEvents | EVENTTYPES) {
  switch (type) {
    case EVENTTYPES.XHR:
      replaceNetwork()
      break
    case EVENTTYPES.PERFORMANCE:
      replacePerformance()
      break
    case EVENTTYPES.MINI_ROUTE:
      replaceRoute()
    default:
      break
  }
}

function isFilterHttpUrl(url: string) {
  return sdkOptions.filterXhrUrlRegExp && sdkOptions.filterXhrUrlRegExp.test(url)
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

// 页面uv pv
export function replacePage() {
  if (!Page) {
    return
  }
  const originPage = Page
  const methods = [WxPageEvents.PageOnLoad]
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

// 网络请求
function replaceNetwork() {
  // const hookMethods = ['request', 'downloadFile', 'uploadFile']
  const hookMethods = ['request']
  hookMethods.forEach((hook) => {
    const originRequest = wx[hook]
    Object.defineProperty(wx, hook, {
      writable: true,
      enumerable: true,
      configurable: true,
      value: function (...args: any[]) {
        const options: WechatMiniprogram.RequestOption | WechatMiniprogram.DownloadFileOption | WechatMiniprogram.UploadFileOption = args[0]
        let method: string
        if ((options as WechatMiniprogram.RequestOption).method) {
          method = (options as WechatMiniprogram.RequestOption).method
        } else if (hook === 'downloadFile') {
          method = EMethods.Get
        } else {
          method = EMethods.Post
        }
        const { url } = options
        let header = options.header
        !header && (header = {})

        if ((method === EMethods.Post && transportData.isSdkTransportUrl(url)) || isFilterHttpUrl(url)) {
          return originRequest.call(this, options)
        }
        let reqData = undefined
        if (hook === 'request') {
          reqData = (options as WechatMiniprogram.RequestOption).data
        } else if (hook === 'downloadFile') {
          reqData = {
            filePath: (options as WechatMiniprogram.DownloadFileOption).filePath
          }
        } else {
          // uploadFile
          reqData = {
            filePath: (options as WechatMiniprogram.UploadFileOption).filePath,
            name: (options as WechatMiniprogram.UploadFileOption).name
          }
        }

        const data: MITOHttp = {
          type: HTTPTYPE.XHR,
          method,
          url,
          reqData,
          sTime: getTimestamp(),
          timeout: options.timeout
        }
        function setRequestHeader(key: string, value: string) {
          header[key] = value
        }
        sdkOptions.beforeAppAjaxSend && sdkOptions.beforeAppAjaxSend({ method, url }, { setRequestHeader })

        const successHandler:
          | WechatMiniprogram.RequestSuccessCallback
          | WechatMiniprogram.DownloadFileSuccessCallback
          | WechatMiniprogram.UploadFileFailCallback = function (res) {
          const endTime = getTimestamp()
          data.responseText = (variableTypeDetection.isString(res.data) || variableTypeDetection.isObject(res.data)) && res.data
          data.elapsedTime = endTime - data.sTime
          data.status = res.statusCode
          data.errMsg = res.errMsg
          data.time = endTime

          triggerHandlers(EVENTTYPES.XHR, data)
          if (typeof options.success === 'function') {
            return options.success(res)
          }
        }

        const _fail = options.fail
        const failHandler:
          | WechatMiniprogram.RequestFailCallback
          | WechatMiniprogram.DownloadFileFailCallback
          | WechatMiniprogram.UploadFileFailCallback = function (err) {
          // 系统和网络层面的失败
          const endTime = getTimestamp()
          data.eTime = endTime
          data.elapsedTime = endTime - data.sTime
          data.errMsg = err.errMsg
          data.status = 0
          triggerHandlers(EVENTTYPES.XHR, data)
          if (variableTypeDetection.isFunction(_fail)) {
            return _fail(err)
          }
        }

        const actOptions = {
          ...options,
          success: successHandler,
          fail: failHandler
        }

        return originRequest.call(this, actOptions)
      }
    })
  })
}

// 性能
function replacePerformance() {
  if (!getFlag(EVENTTYPES.PERFORMANCE)) {
    return
  }
  new WxPerformance({
    reportCallback: (data) => {
      triggerHandlers(EVENTTYPES.PERFORMANCE, data)
    }
  })
  // const performance = wx.getPerformance()
  // const observer = performance.createObserver((entryList) => {
  //   const data = getWxPerformance(entryList.getEntries())
  //   const NT = data.NT
  //   if (NT.appLaunch == 0 && NT.route == 0 && NT.firstRender == 0 && NT.script == 0 && NT.loadPackage == 0) {
  //     return
  //   }
  //   triggerHandlers(EVENTTYPES.PERFORMANCE, data)
  // })
  // observer.observe({ entryTypes: ['render', 'script', 'navigation', 'loadPackage', 'resource'] })
}

// 路由
function replaceRoute() {
  const methods = [
    WxRouteEvents.SwitchTab,
    WxRouteEvents.ReLaunch,
    WxRouteEvents.RedirectTo,
    WxRouteEvents.NavigateTo,
    WxRouteEvents.NavigateBack,
    WxRouteEvents.NavigateToMiniProgram
  ]
  methods.forEach((method) => {
    const originMethod = wx[method] as Function
    Object.defineProperty(wx, method, {
      writable: true,
      enumerable: true,
      configurable: true,
      value: function (
        options:
          | WechatMiniprogram.SwitchTabOption
          | WechatMiniprogram.ReLaunchOption
          | WechatMiniprogram.RedirectToOption
          | WechatMiniprogram.NavigateToOption
          | WechatMiniprogram.NavigateBackOption
          | WechatMiniprogram.NavigateToMiniProgramOption
      ) {
        let toUrl
        if (method === WxRouteEvents.NavigateBack) {
          toUrl = getNavigateBackTargetUrl((options as WechatMiniprogram.NavigateBackOption)?.delta)
        } else {
          toUrl = (options as WechatMiniprogram.SwitchTabOption).url
        }
        const data = {
          from: getCurrentRoute(),
          to: toUrl
        }
        triggerHandlers(EVENTTYPES.MINI_ROUTE, data)
        // 如果complete||success||fail一个都没有，则原方法返回promise，此时sdk也不需要处理
        if (
          variableTypeDetection.isFunction(options.complete) ||
          variableTypeDetection.isFunction(options.success) ||
          variableTypeDetection.isFunction(options.fail)
        ) {
          const _fail = options.fail
          const failHandler:
            | WechatMiniprogram.SwitchTabFailCallback
            | WechatMiniprogram.ReLaunchFailCallback
            | WechatMiniprogram.RedirectToFailCallback
            | WechatMiniprogram.NavigateToFailCallback
            | WechatMiniprogram.NavigateBackFailCallback = function (res) {
            const failData: MiniRoute = {
              ...data,
              isFail: true,
              message: res.errMsg,
              subType: method
            }
            triggerHandlers(EVENTTYPES.MINI_ROUTE, failData)
            if (variableTypeDetection.isFunction(_fail)) {
              return _fail(res)
            }
          }
          options.fail = failHandler
        }
        return originMethod.call(this, options)
      }
    })
  })
}

// 重写Component
export function replaceComponent() {
  if (!Component) {
    return
  }
  const originComponent = Component
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  Component = function (componentOptions): WechatMiniprogram.Component.Constructor {
    if (!isEmptyObject(componentOptions.methods)) {
      /*
       * 兼容用Component构造页面的上报
       * 当用Component构造页面时，页面的生命周期函数应写在methods定义段中，所以重写componentOptions.methods中的对应周期函数
       */
      replacePageLifeMethods(componentOptions.methods, [WxPageEvents.PageOnLoad])
      replaceAction(componentOptions.methods)
    }
    return originComponent.call(this, componentOptions)
  }
}

// 重写Behavior
export function replaceBehavior() {
  if (!Behavior) {
    return
  }
  const originBehavior = Behavior
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  Behavior = function (behaviorOptions): WechatMiniprogram.Behavior.Constructor {
    if (!isEmptyObject(behaviorOptions.methods)) {
      /*
       * 当使用Compnent直接构造页面时，用到的behavior中如果有onShow等页面生命周期函数是不会被触发的，所以只用监听手势行为
       */
      replaceAction(behaviorOptions.methods)
    }
    return originBehavior.call(this, behaviorOptions)
  }
}