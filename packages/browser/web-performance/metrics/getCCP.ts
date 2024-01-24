/**
 * CCP
 * The Custom Contentful Paint (CCP) metric reports the render time of page remote api end,
 * relative to when the page first started loading.
 * */
import { proxyFetch, proxyXhr } from '../lib/proxyHandler'
import getFirstVisitedState from '../lib/getFirstVisitedState'
import metricsStore from '../lib/store'
import { IScoreConfig } from '../types'
import { getApiPath, isIncludeArr, isEqualArr, isExistPath } from '../utils'
import getPath from '../utils/getPath'
import { isPerformanceSupported } from '../utils/isSupported'
import { metricsName } from '../constants'
import getFirstHiddenTime from '../lib/getFirstHiddenTime'
import calcScore from '../lib/calculateScore'

const remoteQueue = {
  hasStoreMetrics: false,
  queue: []
}
const completeQueue = []
let isDone = false

const storeMetrics = (name, value, store, scoreConfig) => {
  let score

  let metrics

  if (name === metricsName.ACT) {
    score = calcScore(name, value.time, scoreConfig)
    metrics = { name, value, score }
  } else if (name === metricsName.CCP) {
    score = calcScore(name, value, scoreConfig)
    metrics = { name, value, score }
  } else {
    metrics = { name, value }
  }

  store.set(name, metrics)
}

const computeCCPAndRL = (store, scoreConfig) => {
  setTimeout(() => {
    const images = Array.from(document.querySelectorAll('img')).filter((image) => {
      return !image.complete && image.src
    })
    if (images.length > 0) {
      let loadImages = 0
      images.forEach((image) => {
        image.addEventListener('load', () => {
          loadImages += 1
          if (loadImages === images.length) {
            storeMetrics(metricsName.CCP, performance.now(), store, scoreConfig)
            storeMetrics(metricsName.RL, performance.getEntriesByType('resource'), store, scoreConfig)
          }
        })
        image.addEventListener('error', () => {
          loadImages += 1
          if (loadImages === images.length) {
            storeMetrics(metricsName.CCP, performance.now(), store, scoreConfig)
            storeMetrics(metricsName.RL, performance.getEntriesByType('resource'), store, scoreConfig)
          }
        })
      })
    } else {
      storeMetrics(metricsName.CCP, performance.now(), store, scoreConfig)
      storeMetrics(metricsName.RL, performance.getEntriesByType('resource'), store, scoreConfig)
    }
  })
}

const beforeHandler = (url, apiConfig, hashHistory, excludeRemotePath) => {
  if (isPerformanceSupported()) {
    const path = getPath(location, hashHistory)
    const firstVisitedState = getFirstVisitedState().state
    if (firstVisitedState) {
      const remotePath = getApiPath(url)
      if (!isExistPath(excludeRemotePath, remotePath)) {
        if (apiConfig && apiConfig[path]) {
          if (apiConfig[path].some((o) => remotePath === o)) {
            remoteQueue.queue.push(remotePath)
          }
        } else {
          if (!isDone) {
            remoteQueue.queue.push(remotePath)
          }
        }
      }
    }
  } else {
    console.warn('browser do not support performance')
  }
}

const afterHandler = (url, apiConfig, store, hashHistory, excludeRemotePath, scoreConfig) => {
  if (isPerformanceSupported()) {
    const path = getPath(location, hashHistory)
    const firstVisitedState = getFirstVisitedState().state
    if (firstVisitedState) {
      const remotePath = getApiPath(url)
      if (!isExistPath(excludeRemotePath, remotePath)) {
        completeQueue.push(remotePath)
        if (apiConfig && apiConfig[path]) {
          if (isIncludeArr(remoteQueue.queue, completeQueue) && !remoteQueue.hasStoreMetrics) {
            console.log('api list = ', remoteQueue.queue)
            remoteQueue.hasStoreMetrics = true
            const now = performance.now()
            if (now < getFirstHiddenTime().timeStamp) {
              storeMetrics(metricsName.ACT, { time: now, remoteApis: remoteQueue.queue }, store, scoreConfig)
              computeCCPAndRL(store, scoreConfig)
            }
          }
        } else {
          if (isIncludeArr(remoteQueue.queue, completeQueue) && !remoteQueue.hasStoreMetrics && isDone) {
            console.log('api list = ', remoteQueue.queue)
            remoteQueue.hasStoreMetrics = true
            const now = performance.now()
            if (now < getFirstHiddenTime().timeStamp) {
              storeMetrics(metricsName.ACT, { time: now, remoteApis: remoteQueue.queue }, store, scoreConfig)
              computeCCPAndRL(store, scoreConfig)
            }
          }
        }
      }
    }
  } else {
    console.warn('browser do not support performance')
  }
}


/**
 * @param {metricsStore} store
 * @param {boolean} isCustomEvent
 * @param { { [prop: string]: Array<string> } } apiConfig
 * @param { boolean} hashHistory
 * @param { Array<string>} excludeRemotePath
 * @param { number } maxWaitCCPDuration
 * @param scoreConfig { IScoreConfig }
 * */
export const initCCP = (
  store: metricsStore,
  isCustomEvent: boolean,
  apiConfig: {},
  hashHistory: boolean,
  excludeRemotePath: Array<string>,
  maxWaitCCPDuration: number,
  scoreConfig
) => {
  const event = isCustomEvent ? 'custom-contentful-paint' : 'pageshow'
  addEventListener(
    event,
    () => {
      const firstVisitedState = getFirstVisitedState().state
      if (firstVisitedState) {
        isDone = true
        if (isPerformanceSupported()) {
          const now = performance.now()
          if (now < getFirstHiddenTime().timeStamp) {
            if (isEqualArr(remoteQueue.queue, completeQueue) && !remoteQueue.hasStoreMetrics) {
              console.log('api list = ', remoteQueue.queue)
              remoteQueue.hasStoreMetrics = true
              storeMetrics(metricsName.ACT, { time: performance.now(), remoteApis: remoteQueue.queue }, store, scoreConfig)
            }
            computeCCPAndRL(store, scoreConfig)
          }
        }
      }
    },
    { once: true, capture: true }
  )

  proxyXhr(
    (url) => beforeHandler(url, apiConfig, hashHistory, excludeRemotePath),
    (url) => afterHandler(url, apiConfig, store, hashHistory, excludeRemotePath, scoreConfig)
  )
  proxyFetch(
    (url) => beforeHandler(url, apiConfig, hashHistory, excludeRemotePath),
    (url) => afterHandler(url, apiConfig, store, hashHistory, excludeRemotePath, scoreConfig)
  )
}
