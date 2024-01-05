import { IAnyObject, ReportDataType } from '../types/index'
import { Severity, globalVar } from '../shared/index'
import { nativeToString } from './is'
import { _global, isWxMiniEnv } from './global';
export const defaultFunctionName = '<anonymous>'

/**
 * 获取当前url
 */
export function getPage() {
  let path = '';
  if (getCurrentPages().length) {
    path = getCurrentPages()[getCurrentPages().length - 1].__route__;
  }
  return path;
}

export const getPageURL = () => (isWxMiniEnv ? getPage() : window.location.href);

/**
 * 
 */
export function getLocationHref(): string {
  if (typeof document === 'undefined' || document.location == null) return ''
  return document.location.href
}

/**
 * @param {*} path
 * @param {*} query
 * @returns
 */
export const formatUrlToStr = (path = '', query = {}) => {
  let permPath = path || '';
  const params = Object.keys(query) || [];
  if (params.length > 0) {
    permPath += '?';
    params.forEach((item, idx) => {
      permPath += item + '=*';
      if (idx < params.length - 1) {
        permPath += '&';
      }
    });
  } else if (path.indexOf('=') > -1) {
    const urlObj: any = path.split('=');
    permPath = '';
    urlObj.forEach((item, index) => {
      if (item.indexOf('&') > -1) {
        const reset = urlObj.length - Number(index) == 1 ? '' : '&' + item.split('&')[1] + '=*';
        permPath += reset;
      } else if (index == 0) {
        permPath += item + '=*';
      }
    });
  }
  return permPath || path;
};

export function toStringAny(target: any, type: string): boolean {
  return nativeToString.call(target) === type
}

/**
 * @param target 
 * @param targetName 
 * @param expectType 
 * @returns 
 */
export function toStringValidateOption(target: any, targetName: string, expectType: string): boolean {
  if (toStringAny(target, expectType)) return true
  typeof target !== 'undefined' && console.error(`${targetName}期望传入${expectType}类型，目前是${nativeToString.call(target)}类型`)
  return false
}

/**
 * @param fn
 * @returns
 */
export function getFunctionName(fn: unknown): string {
  if (!fn || typeof fn !== 'function') {
    return defaultFunctionName
  }
  return fn.name || defaultFunctionName
}

/**
 *
 * 重写对象上面的某个属性
 * ../param source 需要被重写的对象
 * ../param name 需要被重写对象的key
 * ../param replacement 以原有的函数作为参数，执行并重写原有函数
 * ../param isForced 是否强制重写（可能原先没有该属性）
 * ../returns void
 */
export function replaceOld(source: IAnyObject, name: string, replacement: (...args: any[]) => any, isForced = false): void {
  if (source === undefined) return
  if (name in source || isForced) {
    const original = source[name]
    const wrapped = replacement(original)
    if (typeof wrapped === 'function') {
      source[name] = wrapped
    }
  }
}

// 用到所有事件名称
type TotalEventName = keyof GlobalEventHandlersEventMap | keyof XMLHttpRequestEventTargetEventMap | keyof WindowEventMap

/**
 * 添加事件监听器
 *
 * ../export
 * ../param {{ addEventListener: Function }} target
 * ../param {keyof TotalEventName} eventName
 * ../param {Function} handler
 * ../param {(boolean | Object)} opitons
 * ../returns
 */
export function on(
  target: { addEventListener: Function },
  eventName: TotalEventName,
  handler: Function,
  opitons: boolean | unknown = false
): void {
  target.addEventListener(eventName, handler, opitons)
}

/**
 * 获取当前的时间戳
 * ../returns 返回当前时间戳
 */
export function getTimestamp(): number {
  return Date.now()
}

/**
 * 获取当前时间
 */
export const getNowFormatTime = (seperator = '-') => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
  const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
  const hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
  const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
  const seconds = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
  const currentdate =
    year + seperator + month + seperator + day + ' ' + hour + ':' + minutes + ':' + seconds;
  return currentdate;
};

/**
 * @param target 
 * @param type 
 * @returns 
 */
export function typeofAny(target: any, type: string): boolean {
  return typeof target === type
}

/**
 * @param target 
 * @param targetName 
 * @param expectType 
 * @returns 
 */
export function validateOption(target: any, targetName: string, expectType: string): boolean {
  if (typeofAny(target, expectType)) return true
  typeof target !== 'undefined' && console.error(`${targetName}期望传入${expectType}类型，目前是${typeof target}类型`)
  return false
}

export function slientConsoleScope(callback: Function) {
  globalVar.isLogAddBreadcrumb = false
  callback()
  globalVar.isLogAddBreadcrumb = true
}


/**
 * 解析error的stack，并返回args、column、line、func、url:
 * @param ex
 * @param level
 */
export function extractErrorStack(ex: any, level: Severity): ReportDataType {
  const normal = {
    time: getTimestamp(),
    url: getPageURL(),
    name: ex.name,
    level,
    message: ex.message
  }
  if (typeof ex.stack === 'undefined' || !ex.stack) {
    return normal
  }

  const chrome =
      /^\s*at (.*?) ?\(((?:file|https?|blob|chrome-extension|native|eval|webpack|<anonymous>|[a-z]:|\/).*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i,
    gecko =
      /^\s*(.*?)(?:\((.*?)\))?(?:^|@)((?:file|https?|blob|chrome|webpack|resource|\[native).*?|[^@]*bundle)(?::(\d+))?(?::(\d+))?\s*$/i,
    winjs = /^\s*at (?:((?:\[object object\])?.+) )?\(?((?:file|ms-appx|https?|webpack|blob):.*?):(\d+)(?::(\d+))?\)?\s*$/i,
    // Used to additionally parse URL/line/column from eval frames
    geckoEval = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i,
    chromeEval = /\((\S*)(?::(\d+))(?::(\d+))\)/,
    lines = ex.stack.split('\n'),
    stack = []

  let submatch, parts, element
  // reference = /^(.*) is undefined$/.exec(ex.message)

  for (let i = 0, j = lines.length; i < j; ++i) {
    if ((parts = chrome.exec(lines[i]))) {
      const isNative = parts[2] && parts[2].indexOf('native') === 0 // start of line
      const isEval = parts[2] && parts[2].indexOf('eval') === 0 // start of line
      if (isEval && (submatch = chromeEval.exec(parts[2]))) {
        // throw out eval line/column and use top-most line/column number
        parts[2] = submatch[1] // url
        parts[3] = submatch[2] // line
        parts[4] = submatch[3] // column
      }
      element = {
        url: !isNative ? parts[2] : null,
        func: parts[1] || 'UNKNOWN_FUNCTION',
        args: isNative ? [parts[2]] : [],
        lineno: parts[3] ? +parts[3] : null,
        colno: parts[4] ? +parts[4] : null
      }
    } else if ((parts = winjs.exec(lines[i]))) {
      element = {
        url: parts[2],
        func: parts[1] || 'UNKNOWN_FUNCTION',
        args: [],
        lineno: +parts[3],
        colno: parts[4] ? +parts[4] : null
      }
    } else if ((parts = gecko.exec(lines[i]))) {
      const isEval = parts[3] && parts[3].indexOf(' > eval') > -1
      if (isEval && (submatch = geckoEval.exec(parts[3]))) {
        // throw out eval line/coluqqqqqqqqqqqqqqqqqqqqqqqqqqqqmn and use top-most line number
        parts[3] = submatch[1]
        parts[4] = submatch[2]
        parts[5] = null // no column when eval
      } else if (i === 0 && !parts[5] && typeof ex.columnNumber !== 'undefined') {
        // FireFox uses this awesome columnNumber property for its top frame
        // Also note, Firefox's column number is 0-based and everything else expects 1-based,
        // so adding 1
        // NOTE: this hack doesn't work if top-most frame is eval
        stack[0].column = ex.columnNumber + 1
      }
      element = {
        url: parts[3],
        func: parts[1] || 'UNKNOWN_FUNCTION',
        args: parts[2] ? parts[2].split(',') : [],
        lineno: parts[4] ? +parts[4] : null,
        colno: parts[5] ? +parts[5] : null
      }
    } else {
      continue
    }

    if (!element.func && element.line) {
      element.func = 'UNKNOWN_FUNCTION'
    }

    stack.push(element)
  }

  if (!stack.length) {
    return null
  }
  return {
    ...normal,
    stack: stack
  }
}

/**
 * @returns 
 */
export function supportsHistory(): boolean {
  // NOTE: in Chrome App environment, touching history.pushState, *even inside
  //       a try/catch block*, will cause Chrome to output an error to console.error
  // borrowed from: https://github.com/angular/angular.js/pull/13945/files
  const chrome = (_global as any).chrome
  // tslint:disable-next-line:no-unsafe-any
  const isChromePackagedApp = chrome && chrome.app && chrome.app.runtime
  const hasHistoryApi = 'history' in _global && !!_global.history.pushState && !!_global.history.replaceState

  return !isChromePackagedApp && hasHistoryApi
}