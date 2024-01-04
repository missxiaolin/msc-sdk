import { EVENTTYPES, WxEvents } from '../shared/index'

type ReplaceCallback = (data: any) => void

export interface ReplaceHandler {
  type: EVENTTYPES | WxEvents
  callback: ReplaceCallback
}
