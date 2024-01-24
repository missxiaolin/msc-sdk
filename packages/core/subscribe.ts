import { AliEvents, EVENTTYPES, WxEvents } from '../shared/index'
import { getFlag, setFlag, nativeTryCatch, getFunctionName } from '../utils/index'
type ReplaceCallback = (data: any) => void

export interface ReplaceHandler {
  type: EVENTTYPES | WxEvents | AliEvents
  callback: ReplaceCallback
}

const handlers: { [key in EVENTTYPES]?: ReplaceCallback[] } = {}

/**
 * @param handler 
 * @returns 
 */
export function subscribeEvent(handler: ReplaceHandler): boolean {
  if (!handler || !getFlag(handler.type)) return false
  setFlag(handler.type, true)
  handlers[handler.type] = handlers[handler.type] || []
  handlers[handler.type].push(handler.callback)
  return true
}

/**
 * @param type 
 * @param data 
 * @returns 
 */
export function triggerHandlers(type: EVENTTYPES | WxEvents, data: any): void {
  if (!type || !handlers[type]) return
  handlers[type].forEach((callback) => {
    nativeTryCatch(
      () => {
        callback(data)
      },
      (e: Error) => {
        console.error(`重写事件triggerHandlers的回调函数发生错误\nType:${type}\nName: ${getFunctionName(callback)}\nError: ${e}`)
      }
    )
  })
}
