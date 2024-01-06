import { initOptions } from '../../core/options'
import { log } from '../../core/external'
import { isWxMiniEnv } from '../../utils/global'
import { InitOptions } from '../../types/options'
import { setupReplace } from './load'
import { SDK_NAME, SDK_VERSION } from '../../shared/index'

export function init(options: InitOptions = {}) {
  if (!isWxMiniEnv) return
  initOptions(options)
  setupReplace()
  Object.assign(wx, { mitoLog: log, SDK_NAME, SDK_VERSION })
}

export { log }
