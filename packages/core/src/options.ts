import { InitOptions } from '../../types/src/index'
import { setSilentFlag } from '../../utils/src/index'
// import { breadcrumb } from './breadcrumb'

/**
 * init core methods
 * @param paramOptions
 */
export function initOptions(paramOptions: InitOptions = {}) {
    setSilentFlag(paramOptions)
    // breadcrumb.bindOptions(paramOptions)
}