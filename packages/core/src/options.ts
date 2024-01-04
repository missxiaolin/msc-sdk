import { InitOptions } from '@xiaolin/monitor-types'
import { setSilentFlag } from '@xiaolin/monitor-utils'
// import { breadcrumb } from './breadcrumb'

/**
 * init core methods
 * @param paramOptions
 */
export function initOptions(paramOptions: InitOptions = {}) {
    setSilentFlag(paramOptions)
    // breadcrumb.bindOptions(paramOptions)
}