import { ReplaceHandler, subscribeEvent, triggerHandlers, transportData, options } from '../core/index'
import { EVENTTYPES, voidFun, HTTPTYPE } from '../shared/index'
import { _global, replaceOld, getTimestamp, on, getPageURL, isExistProperty, supportsHistory, clickThrottle, throttle } from '../utils/index'
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
    case EVENTTYPES.PERFORMANCE:
      listenPerformance()
      break
    case EVENTTYPES.HISTORY:
      historyReplace()
      break
    case EVENTTYPES.UNHANDLEDREJECTION:
      unhandledrejectionReplace()
      break
    case EVENTTYPES.DOM:
      domReplace()
      break
    case EVENTTYPES.HASHCHANGE:
      listenHashchange()
      break
    default:
      break
  }
}

/**
 * @param handler
 * @returns
 */
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

// last time route
let lastHref: string
lastHref = getPageURL()
/**
 * history
 * @returns
 */
function historyReplace(): void {
  if (!supportsHistory()) return
  let popstateStartTime = getTimestamp()
  const oldOnpopstate = _global.onpopstate
  _global.onpopstate = function (this: WindowEventHandlers, ...args: any[]): any {
    const to = getPageURL()
    const from = lastHref
    lastHref = to
    triggerHandlers(EVENTTYPES.HISTORY, {
      from,
      to,
      duration: getTimestamp() - popstateStartTime,
      subType: 'pushState'
    })
    popstateStartTime = getTimestamp()
    oldOnpopstate && oldOnpopstate.apply(this, args)
  }
  function historyReplaceFn(originalHistoryFn: voidFun): voidFun {
    return function (this: History, ...args: any[]): void {
      const url = args.length > 2 ? args[2] : undefined
      if (url) {
        const from = lastHref
        const to = String(url)
        lastHref = to
        triggerHandlers(EVENTTYPES.HISTORY, {
          from,
          to,
          duration: getTimestamp() - popstateStartTime,
          subType: args[0] && args[0].replaced == false ? 'pushState' : 'replaceState'
        })
        popstateStartTime = getTimestamp()
      }
      return originalHistoryFn.apply(this, args)
    }
  }
  replaceOld(_global.history, 'pushState', historyReplaceFn)
  replaceOld(_global.history, 'replaceState', historyReplaceFn)
}

/**
 * hashchange
 */
function listenHashchange(): void {
  let oldURL = '',
    hashchangeStartTime = getTimestamp()
  if (!isExistProperty(_global, 'onpopstate')) {
    on(
      _global,
      EVENTTYPES.HASHCHANGE,
      function (e: HashChangeEvent) {
        const newURL = e.newURL
        const duration = Date.now() - hashchangeStartTime
        triggerHandlers(EVENTTYPES.HASHCHANGE, {
          from: oldURL,
          to: newURL,
          duration,
          subType: 'hashchange'
        })
        oldURL = newURL
        hashchangeStartTime = Date.now()
      },
      true
    )
  }
}

function unhandledrejectionReplace(): void {
  on(_global, EVENTTYPES.UNHANDLEDREJECTION, function (ev: PromiseRejectionEvent) {
    // ev.preventDefault() 阻止默认行为后，控制台就不会再报红色错误
    triggerHandlers(EVENTTYPES.UNHANDLEDREJECTION, ev)
  })
}

function domReplace(): void {
  if (!('document' in _global)) return
  const clickThrottle = throttle(triggerHandlers, options.throttleDelayTime)
  on(
    _global.document,
    'mousedown',
    function (e: MouseEvent) {
      clickThrottle(EVENTTYPES.DOM, {
        category: 'mousedown',
        data: e
      })
    },
    true
  )
  on(
    _global.document,
    'touchstart',
    function () {
      clickThrottle(EVENTTYPES.DOM, {
        category: 'touchstart',
        data: this
      })
    },
    true
  )
  // 暂时不需要keypress的重写
  // on(
  //   _global.document,
  //   'keypress',
  //   function (e: MITOElement) {
  //     keypressThrottle('dom', {
  //       category: 'keypress',
  //       data: this
  //     })
  //   },
  //   true
  // )
}

export const afterLoad = callback => {
  if (document.readyState === 'complete') {
    setTimeout(callback);
  } else {
    window.addEventListener('pageshow', callback, { once: true, capture: true });
  }
};

function listenPerformance(): void {
  if (!('document' in _global) && !('performance' in _global)) return
  afterLoad(() => {
    const entryList = _global.performance.getEntries() || [];
    triggerHandlers(EVENTTYPES.PERFORMANCE, entryList)
  })
}