import Store from '../alipay-mini/src/ali-performance/core/store'
import { AliEvents, EVENTTYPES, WxEvents } from '../shared/index'
import { Breadcrumb, Options, TransportData } from '../core/index'
import { DeviceInfo } from '../types/index'
import { variableTypeDetection } from './is'

// MITO的全局变量
export interface MitoSupport {
  breadcrumb: Breadcrumb
  transportData: TransportData
  replaceFlag: { [key in EVENTTYPES]?: boolean }
  record?: any[]
  deviceInfo?: DeviceInfo | any
  options?: any
  aliStore?: Store // 支付宝性能缓存方法
  recordScreenId?: string // 录屏用
  hasError?: boolean // 录屏用
  recordScreenType?: string // 录屏是什么错误导致
  _loopTimer?: any
}



interface MITOGlobal {
  console?: Console
  __MITO__?: MitoSupport
}

export const isNodeEnv = variableTypeDetection.isProcess(typeof process !== 'undefined' ? process : 0)

export const isWxMiniEnv =
  variableTypeDetection.isObject(typeof wx !== 'undefined' ? wx : 0) &&
  variableTypeDetection.isFunction(typeof App !== 'undefined' ? App : 0)

export const isAliMiniEnv = 
  variableTypeDetection.isObject(typeof my !== 'undefined' ? my : 0) &&
  variableTypeDetection.isFunction(typeof App !== 'undefined' ? App : 0)

export const isBrowserEnv = variableTypeDetection.isWindow(typeof window !== 'undefined' ? window : 0)
/**
 * 获取全局变量
 *
 * ../returns Global scope object
 */
export function getGlobal<T>() {
  if (isBrowserEnv) return window as unknown as MITOGlobal & T
  if (isWxMiniEnv) return wx as unknown as MITOGlobal & T
  if (isAliMiniEnv) return my as unknown as MITOGlobal & T
  if (isNodeEnv) return process as unknown as MITOGlobal & T
}

const _global = getGlobal<Window>()
const _support = getGlobalMitoSupport()

_support.hasError = false;

export { _global, _support }

_support.replaceFlag = _support.replaceFlag || {}
const replaceFlag = _support.replaceFlag
export function setFlag(replaceType: EVENTTYPES | WxEvents | AliEvents, isSet: boolean): void {
  if (replaceFlag[replaceType]) return
  replaceFlag[replaceType] = isSet
}

/**
 * 获取全部变量__MITO__的引用地址
 *
 * ../returns global variable of MITO
 */
export function getGlobalMitoSupport(): MitoSupport {
  _global.__MITO__ = _global.__MITO__ || ({} as MitoSupport)
  return _global.__MITO__
}

export function getFlag(replaceType: EVENTTYPES | WxEvents | AliEvents): boolean {
  return replaceFlag[replaceType] ? true : false
}