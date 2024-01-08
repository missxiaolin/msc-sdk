import { EVENTTYPES } from '../../shared/index'
import { HandleWxPageEvents, HandleNetworkEvents, HandlePerformanceEvents, HandleWxEvents } from './handleWxEvents'
import { replaceApp, replacePage, addReplaceHandler } from './replace'

export function setupReplace() {
  replaceApp()
  replacePage()
  addReplaceHandler({
    callback: (data) => HandleWxEvents.handleRoute(data),
    type: EVENTTYPES.MINI_ROUTE
  })
  addReplaceHandler({
    callback: (data) => HandleWxPageEvents.onAction(data),
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
}
