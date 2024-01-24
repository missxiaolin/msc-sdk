import { EVENTTYPES } from '../../shared/index'
import { HandleAliEvents } from './handleAliEvents'
import { addReplaceHandler, replaceApp } from './replace'
import { MiniRoute } from './types'

export function setupReplace() {
  addReplaceHandler({
    callback: (data: MiniRoute) => HandleAliEvents.handleRoute(data),
    type: EVENTTYPES.MINI_ROUTE
  })
  replaceApp()
}
