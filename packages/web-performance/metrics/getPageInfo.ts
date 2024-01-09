/**
 * Page Info
 * host
 * hostname
 * href
 * protocol
 * origin
 * port
 * pathname
 * search
 * hash
 * screen resolution
 * */
import { IMetrics, IPageInformation } from '../types'
import { metricsName } from '../constants'
import metricsStore from '../lib/store'

const getPageInfo = (): IPageInformation => {
  if (!location) {
    console.warn('browser do not support location')
    return
  }

  const { host, hostname, href, protocol, origin, port, pathname, search, hash } = location
  const { width, height } = window.screen

  return {
    host,
    hostname,
    href,
    protocol,
    origin,
    port,
    pathname,
    search,
    hash,
    userAgent: 'userAgent' in navigator ? navigator.userAgent : '',
    screenResolution: `${width}x${height}`
  }
}

/**
 * @param {metricsStore} store
 * */
export const initPageInfo = (store: metricsStore): void => {
  const pageInfo: IPageInformation = getPageInfo()

  const metrics = { name: metricsName.PI, value: pageInfo } as IMetrics

  store.set(metricsName.PI, metrics)
}
