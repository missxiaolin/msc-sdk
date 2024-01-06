import { initOptions } from '../../core/options'
import { log } from '../../core/external'
import { isWxMiniEnv, setFlag } from '../../utils/global'
import { InitOptions } from '../../types/options'
import { setupReplace } from './load'
import { SDK_NAME, SDK_VERSION, WxAppEvents } from '../../shared/index'

export function init(options: InitOptions = {}) {
	if (!isWxMiniEnv) return
	// 为了得到网络还有设备信息 在appOnShow里面去拿到
	setFlag(WxAppEvents.AppOnShow, true)
  initOptions(options)
  setupReplace()
  Object.assign(wx, { mitoLog: log, SDK_NAME, SDK_VERSION })
}

export { log }
