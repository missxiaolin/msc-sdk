import { EVENTTYPES, WxEvents } from '../../shared/src/index'

type ReplaceCallback = (data: any) => void

export interface ReplaceHandler {
  type: EVENTTYPES | WxEvents
  callback: ReplaceCallback
}
