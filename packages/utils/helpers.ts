import { IAnyObject } from '../types/index'
import { globalVar } from '../shared/index'
import { nativeToString } from './is'
import { isWxMiniEnv } from './global';
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