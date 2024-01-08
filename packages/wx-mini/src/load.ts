import { EVENTTYPES } from '../../shared/index'
import { HandleWxPageEvents, HandleNetworkEvents, HandlePerformanceEvents } from './handleWxEvents'
import { replaceApp, replacePage, addReplaceHandler } from './replace'

export function setupReplace() {
  replaceApp()
  replacePage()
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
