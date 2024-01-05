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
    callback: (e: HashChangeEvent) => {
      HandleEvents.handleHashchange(e)
    },
    type: EVENTTYPES.HASHCHANGE
  })
}
