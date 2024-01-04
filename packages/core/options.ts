import { InitOptions } from '../types/index'
import { setSilentFlag } from '../utils/index'
// import { breadcrumb } from './breadcrumb'

/**
 * init core methods
 * @param paramOptions
 */
export function initOptions(paramOptions: InitOptions = {}) {
    setSilentFlag(paramOptions)
    // breadcrumb.bindOptions(paramOptions)
}