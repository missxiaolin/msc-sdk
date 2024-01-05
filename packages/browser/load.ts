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
}
