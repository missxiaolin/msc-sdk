import { ReplaceHandler, subscribeEvent, triggerHandlers, transportData, options } from '../core/index'
import { EVENTTYPES, voidFun, HTTPTYPE } from '../shared/index'
import { _global, replaceOld, getTimestamp, on } from '../utils/index'
import { MITOXMLHttpRequest, EMethods, MITOHttp } from '../types/index'

function isFilterHttpUrl(url: string) {
  return options.filterXhrUrlRegExp && options.filterXhrUrlRegExp.test(url)
}

function replace(type: EVENTTYPES) {
  switch (type) {
    case EVENTTYPES.XHR:
      xhrReplace()
      break
    case EVENTTYPES.FETCH:
      fetchReplace()
      break
    case EVENTTYPES.ERROR:
      listenError()
      break
    case EVENTTYPES.CONSOLE:
      break
    case EVENTTYPES.HISTORY:
      break
    case EVENTTYPES.UNHANDLEDREJECTION:
      break
    case EVENTTYPES.DOM:
      break
    case EVENTTYPES.HASHCHANGE:
      break
    default:
      break
  }
}

export function addReplaceHandler(handler: ReplaceHandler) {
  if (!subscribeEvent(handler)) return
  replace(handler.type as EVENTTYPES)
}

/**
 * xhr 重写
 * @returns
 */
function xhrReplace(): void {
  if (!('XMLHttpRequest' in _global)) {
    return
  }
  const originalXhrProto = XMLHttpRequest.prototype
  replaceOld(originalXhrProto, 'open', (originalOpen: voidFun): voidFun => {
    return function (this: MITOXMLHttpRequest, ...args: any[]): void {
      this.logData = {
        method: args[0],
        url: args[1],
        sTime: getTimestamp(),
        type: HTTPTYPE.XHR
      }
      // this.ontimeout = function () {
      //   console.log('超时', this)
      // }
      // this.timeout = 10000
      // on(this, EVENTTYPES.ERROR, function (this: MITOXMLHttpRequest) {
      //   if (this.logData.isSdkUrl) return
      //   this.logData.isError = true
      //   const eTime = getTimestamp()
      //   this.logData.time = eTime
      //   this.logData.status = this.status
      //   this.logData.elapsedTime = eTime - this.logData.sTime
      //   triggerHandlers(EVENTTYPES.XHR, this.logData)
      //   console.error(`接口错误,接口信息:${JSON.stringify(this.logData)}`)
      // })
      originalOpen.apply(this, args)
    }
  })

  replaceOld(originalXhrProto, 'send', (originalSend: voidFun): voidFun => {
    return function (this: MITOXMLHttpRequest, ...args: any[]): void {
      const { method, url } = this.logData
      on(this, 'loadend', function (this: MITOXMLHttpRequest) {
        if ((method === EMethods.Post && transportData.isSdkTransportUrl(url)) || isFilterHttpUrl(url)) return
        const { responseType, response, status, timeout, statusText } = this
        this.logData.reqData = args[0]
        const eTime = getTimestamp()
        this.logData.time = this.logData.sTime
        this.logData.status = status
        this.logData.timeout = timeout
        this.logData.statusText = statusText
        if (['', 'json', 'text'].indexOf(responseType) !== -1) {
          this.logData.responseText = typeof response === 'object' ? JSON.stringify(response) : response
        }
        this.logData.elapsedTime = eTime - this.logData.sTime
        this.logData.eTime = eTime
        this.logData.eventType = 'load'
        triggerHandlers(EVENTTYPES.XHR, this.logData)
      })
      originalSend.apply(this, args)
    }
  })
}

// fetch
function fetchReplace(): void {
  if (!('fetch' in _global)) {
    return
  }
  replaceOld(_global, EVENTTYPES.FETCH, (originalFetch: voidFun) => {
    return function (url: string, config: Partial<Request> = {}): void {
      const sTime = getTimestamp()
      const method = (config && config.method) || 'GET'
      let handlerData: MITOHttp = {
        type: HTTPTYPE.FETCH,
        method,
        reqData: config && config.body,
        url
      }
      const headers = new Headers(config.headers || {})
      config = {
        ...config,
        headers
      }

      return originalFetch.apply(_global, [url, config]).then(
        (res: Response) => {
          const tempRes = res.clone()
          const eTime = getTimestamp()
          handlerData = {
            ...handlerData,
            elapsedTime: eTime - sTime,
            status: tempRes.status,
            statusText: tempRes.statusText,
            time: sTime,
            timeout: 0,
            eTime,
            eventType: 'load'
          }
          tempRes.text().then((data) => {
            if (method === EMethods.Post && transportData.isSdkTransportUrl(url)) return
            if (isFilterHttpUrl(url)) return
            handlerData.responseText = data
            triggerHandlers(EVENTTYPES.FETCH, handlerData)
          })
          return res
        },
        (err: Error) => {
          const eTime = getTimestamp()
          if (method === EMethods.Post && transportData.isSdkTransportUrl(url)) return
          if (isFilterHttpUrl(url)) return
          handlerData = {
            ...handlerData,
            elapsedTime: eTime - sTime,
            status: 0,
            statusText: err.name + err.message,
            time: sTime,
            timeout: 0,
            eTime,
            eventType: 'error',
            responseText: ''
          }
          triggerHandlers(EVENTTYPES.FETCH, handlerData)
          throw err
        }
      )
    }
  })
}

// js 错误
function listenError(): void {
  on(
    _global,
    'error',
    function (e: ErrorEvent) {
      triggerHandlers(EVENTTYPES.ERROR, e)
    },
    true
  )
}