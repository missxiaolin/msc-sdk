import { EVENTTYPES } from '../../shared/index'
import { HandleAliConsoleEvents, HandleAliEvents, HandleAliPageEvents, HandleNetworkEvents, HandlePerformanceEvents } from './handleAliEvents'
import { addReplaceHandler, replaceApp, replacePage } from './replace'
import { MiniRoute } from './types'

export function setupReplace() {
  
  replaceApp()
  replacePage()
  addReplaceHandler({
    callback: (data: MiniRoute) => HandleAliEvents.handleRoute(data),
    type: EVENTTYPES.MINI_ROUTE
  })
  addReplaceHandler({
    callback: (data) => HandleAliPageEvents.onAction(data),
    type: EVENTTYPES.DOM
  })
  addReplaceHandler({
    callback: (data) => {
      HandleNetworkEvents.handleRequest(data)
    },
    type: EVENTTYPES.XHR
  })
  addReplaceHandler({
    callback: (data) => {
      HandlePerformanceEvents.handlePerformance(data)
    },
    type: EVENTTYPES.PERFORMANCE
  })
  addReplaceHandler({
    callback: (data) => {
      HandleAliConsoleEvents.console(data)
    },
    type: EVENTTYPES.CONSOLE
  })
}
