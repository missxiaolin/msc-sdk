export * from './handleEvents'
export * from './load'
export * from './replace'
import { setupReplace } from './load'
import { initOptions, log } from '../core/index'
import { _global } from '../utils/index'
import { SDK_VERSION, SDK_NAME } from '../shared/index'
import { InitOptions } from '../types/index'
import { _support } from '../utils'
import { uaParser } from './utils'
function webInit(options: InitOptions = {}): void {
  if (!('XMLHttpRequest' in _global) || options.monitorSwitch) return
  _support.deviceInfo = uaParser()
  initOptions(options)
  setupReplace()
}

function init(options: InitOptions = {}): void {
  webInit(options)
}

export { SDK_VERSION, SDK_NAME, init, log }
