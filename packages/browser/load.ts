import { HandleEvents } from './handleEvents'
import { EVENTTYPES, BREADCRUMBTYPES } from '../shared/index'
import { addReplaceHandler } from './replace'
import { handleConsole } from '../core/transformData'

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
  addReplaceHandler({
    callback: (data) => {
      HandleEvents.handlePerformance(data)
    },
    type: EVENTTYPES.PERFORMANCE
  })
  addReplaceHandler({
    callback: (data) => {
      HandleEvents.handleRecordSreen(data)
    },
    type: EVENTTYPES.RECORDSCREEN
  })
  addReplaceHandler({
    callback: (data) => {
      handleConsole(data)
    },
    type: EVENTTYPES.CONSOLE
  })
}
