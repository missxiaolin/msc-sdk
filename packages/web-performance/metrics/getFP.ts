import { isPerformanceObserverSupported, isPerformanceSupported } from '../utils/isSupported'
import observe from '../lib/observe'
import { roundByFour } from '../utils'
import getFirstHiddenTime from '../lib/getFirstHiddenTime'
import { IMetrics } from '../types'
import { metricsName } from '../constants'
import calcScore from '../lib/calculateScore'
import metricsStore from '../lib/store'

const getFP = (): Promise<PerformanceEntry> | undefined => {
  return new Promise((resolve, reject) => {
    if (!isPerformanceObserverSupported()) {
      if (!isPerformanceSupported()) {
        reject(new Error('browser do not support performance'))
      } else {
        const [entry] = performance.getEntriesByName('first-paint')

        if (entry) {
          resolve(entry)
        }

        reject(new Error('browser has no fp'))
      }
    } else {
      const entryHandler = (entry: PerformanceEntry) => {
        if (entry.name === 'first-paint') {
          if (po) {
            po.disconnect()
          }

          if (entry.startTime < getFirstHiddenTime().timeStamp) {
            resolve(entry)
          }
        }
      }

      const po = observe('paint', entryHandler)
    }
  })
}

/**
 * @param {metricsStore} store
 * @param scoreConfig
 * */
export const initFP = (store: metricsStore, scoreConfig): void => {
  getFP()
    .then((entry: PerformanceEntry) => {
      const metrics = {
        name: metricsName.FP,
        value: roundByFour(entry.startTime, 2),
        score: calcScore(metricsName.FP, entry.startTime, scoreConfig)
      } as IMetrics
      console.log(metrics)
    })
    .catch((error) => {
      console.error(error)
    })
}
