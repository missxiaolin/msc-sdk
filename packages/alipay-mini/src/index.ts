import { initOptions } from '../../core/options'
// import { log, setUserId } from '../../core/external'
// import { isAliMiniEnv, setFlag } from '../../utils/global'
import { InitOptions } from '../../types/options'
// import { setupReplace } from './load'
// import { SDK_NAME, SDK_VERSION, EVENTTYPES } from '../../shared/index'
// import generateUniqueID from '../../utils/generateUniqueID'
// import { getUser } from './utils'

export function init(options: InitOptions = {}) {
  console.log(my)
	// if (!isAliMiniEnv) return
	// // 为了得到网络还有设备信息 在appOnShow里面去拿到
  // setFlag(EVENTTYPES.AppOnShow, true)
	// setFlag(EVENTTYPES.MINI_ROUTE, true)
  // initOptions(options)
  // setupReplace()
  // Object.assign(wx, { mitoLog: log, SDK_NAME, SDK_VERSION })
}

// export { log, getUser, setUserId, generateUniqueID }
