import { EVENTTYPES } from '../../shared/index'
import { HandleWxPageEvents } from './handleWxEvents'
import { replaceApp, replacePage, addReplaceHandler } from './replace'

export function setupReplace() {
		replaceApp()
		replacePage()
		addReplaceHandler({
			callback: (data) => HandleWxPageEvents.onAction(data),
			type: EVENTTYPES.DOM
		})
}