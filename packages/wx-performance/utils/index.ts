import { setUrlQuery } from "../../wx-mini/src/utils"
import { variableTypeDetection } from "../../utils/is"

export function noop() {}

/**
 * @param setQuery 
 * @returns 
 */
export function getPageUrl(setQuery = true) {
  if (!variableTypeDetection.isFunction(getCurrentPages)) {
    return ''
  }
  const pages = getCurrentPages() // 在App里调用该方法，页面还没有生成，长度为0
  if (!pages.length) {
    return 'App'
  }
  const page = pages[pages.length - 1]
  return setQuery ? setUrlQuery(page.route, page.options) : page.route
}
