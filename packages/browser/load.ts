import { HandleEvents } from './handleEvents'
import { EVENTTYPES, BREADCRUMBTYPES } from '../shared/index'
import { addReplaceHandler } from './replace'

export function setupReplace(): void {
  addReplaceHandler({
    callback: (data) => {
      HandleEvents.handleHttp(data, BREADCRUMBTYPES.XHR)
    },
    type: EVENTTYPES.XHR
  })
  addReplaceHandler({
    callback: (data) => {
      HandleEvents.handleHttp(data, BREADCRUMBTYPES.FETCH)
    },
    type: EVENTTYPES.FETCH
  })
  addReplaceHandler({
    callback: (error) => {
      HandleEvents.handleError(error)
    },
    type: EVENTTYPES.ERROR
  })
  addReplaceHandler({
    callback: (data) => {
      HandleEvents.handleHistory(data)
    },
    type: EVENTTYPES.HISTORY
  })
  addReplaceHandler({
    callback: (e) => {
      HandleEvents.handleHashchange(e)
    },
    type: EVENTTYPES.HASHCHANGE
  })
  addReplaceHandler({
    callback: (data) => {
      HandleEvents.handleUnhandleRejection(data)
    },
    type: EVENTTYPES.UNHANDLEDREJECTION
  })

  addReplaceHandler({
    callback: (data) => {
      HandleEvents.handleDom(data)
    },
    type: EVENTTYPES.DOM
  })
}
