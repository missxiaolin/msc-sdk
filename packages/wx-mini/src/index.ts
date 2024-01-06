import { initOptions, log } from '../../core'
import { isWxMiniEnv } from '../../utils'
import { InitOptions } from '../../types'
import { setupReplace } from './load'
import { SDK_NAME, SDK_VERSION } from '../../shared'

export function init(options: InitOptions = {}) {
  if (!isWxMiniEnv) return
  initOptions(options)
  setupReplace()
  Object.assign(wx, { mitoLog: log, SDK_NAME, SDK_VERSION })
}

export { log }
