export * from './handleEvents'
export * from './load'
export * from './replace'
import { setupReplace } from './load'
import { initOptions, log } from '@xiaolin/monitor-core'
import { _global } from '@xiaolin/monitor-utils'
import { SDK_VERSION, SDK_NAME } from '@xiaolin/monitor-shared'
import { InitOptions } from '@xiaolin/monitor-types'
function webInit(options: InitOptions = {}): void {
  if (!('XMLHttpRequest' in _global) || options.monitorSwitch) return
  initOptions(options)
  setupReplace()
}

function init(options: InitOptions = {}): void {
  webInit(options)
}

export { SDK_VERSION, SDK_NAME, init, log }
