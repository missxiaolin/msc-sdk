import { transportData } from './transportData'

/**
 *
 * 自定义上报事件
 * @export
 * @param {LogTypes} { message = 'emptyMsg', tag = '', level = Severity.Critical, ex = '' }
 */
export function log(): void {

}

/**
 * 可以让用户任意设计用户ID
 * @param userId 
 */
export function setUserId(userId: string | number): void {
    transportData.setUserId(userId)
}