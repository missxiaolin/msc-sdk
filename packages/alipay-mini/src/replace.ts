import { AliAppEvents, AliEvents, AliPageEvents, AliRouteEvents, EVENTTYPES, HTTPTYPE } from '../../shared/constant'
import { ReplaceHandler, subscribeEvent, triggerHandlers } from '../../core/subscribe'
import { getCurrentRoute, getNavigateBackTargetUrl } from './utils'
import { getFlag } from '../../utils/global'
import { HandleAliAppEvents, HandleAliPageEvents } from './handleAliEvents'
import { replaceOld, throttle, getTimestamp } from '../../utils/helpers'
import { voidFun, ELinstenerTypes } from '../../shared/index'
import { options as sdkOptions } from '../../core/options'
import { EMethods } from '../../types/options'
import { transportData } from '../../core/transportData'
import { variableTypeDetection } from '../../utils/is'
import { MITOHttp } from '../../types/common'
import AliPerformance from './ali-performance'

function isFilterHttpUrl(url: string) {
  return sdkOptions.filterXhrUrlRegExp && sdkOptions.filterXhrUrlRegExp.test(url)
}

/**
 * @param type
 */
function replace(type: AliEvents | EVENTTYPES) {
  switch (type) {
    case EVENTTYPES.CONSOLE:
        replaceConsole()
      break
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


// 网络请求
function replaceNetwork() {
  // const hookMethods = ['request', 'downloadFile', 'uploadFile']
  const hookMethods = ['request']
  hookMethods.forEach((hook) => {
    const originRequest = my[hook]
    Object.defineProperty(my, hook, {
      writable: true,
      enumerable: true,
      configurable: true,
      value: function (...args: any[]) {
        const options = args[0]
        let method: string
        if (options.method) {
          method = options.method
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
          reqData = options.data
        } else if (hook === 'downloadFile') {
          reqData = {
            filePath: options.filePath
          }
        } else {
          // uploadFile
          reqData = {
            filePath: options.filePath,
            name: options.name
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

        const successHandler = function (res) {
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
        const failHandler = function (err) {
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

function replaceConsole() {
  if (console && variableTypeDetection.isObject(console)) {
    const logType = ['log', 'debug', 'info', 'warn', 'error', 'assert']
    logType.forEach(function (level: string): void {
      if (!(level in console)) return
      replaceOld(console, level, function (originalConsole): Function {
        return function (...args: any[]): void {
          if (originalConsole) {
            triggerHandlers(EVENTTYPES.CONSOLE, { args, level })
            originalConsole.apply(console, args)
          }
        }
      })
    })
  }
}

// 性能数据
function replacePerformance() {
  if (!getFlag(EVENTTYPES.PERFORMANCE)) {
    return
  }
  new AliPerformance({
    reportCallback: (data) => {
      triggerHandlers(EVENTTYPES.PERFORMANCE, data)
    }
  })
}