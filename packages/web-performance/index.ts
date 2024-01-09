import { IWebVitals, IConfig, IMetricsObj } from './types'
import MetricsStore from './lib/store'
import { initFP } from './metrics/getFP'
import { initFCP } from './metrics/getFCP'
import { initFID } from './metrics/getFID'
import { initFPS } from './metrics/getFPS'
import { initCLS } from './metrics/getCLS'
import { initLCP } from './metrics/getLCP'
import { initCCP } from './metrics/getCCP'
import { initNavigationTiming } from './metrics/getNavigationTiming'
import { afterLoad, beforeUnload, unload } from './utils'
import { onHidden } from './lib/onHidden'

let metricsStore: MetricsStore

class WebVitals implements IWebVitals {
  constructor(config: IConfig) {
    const {
      isCustomEvent = false,
      scoreConfig = {},
      logFpsCount = 5,
      apiConfig = {},
      hashHistory = true,
      excludeRemotePath = [],
      maxWaitCCPDuration = 30 * 1000
    } = config
    metricsStore = new MetricsStore()

    initCLS(metricsStore, scoreConfig)
    initLCP(metricsStore, scoreConfig)
    initCCP(metricsStore, isCustomEvent, apiConfig, hashHistory, excludeRemotePath, maxWaitCCPDuration, scoreConfig)
    addEventListener(
      isCustomEvent ? 'custom-contentful-paint' : 'pageshow',
      () => {
        initFP(metricsStore, scoreConfig)
        initFCP(metricsStore, scoreConfig)
      },
      { once: true, capture: true }
    )
    afterLoad(() => {
      initNavigationTiming(metricsStore)
      initFID(metricsStore, scoreConfig)
      initFPS(metricsStore, logFpsCount)
    })

    // if immediately is false,report metrics when visibility and unload
    ;[beforeUnload, unload, onHidden].forEach((fn) => {
      fn(() => {
        const metrics = this.getCurrentMetrics()
        console.log(metrics)
        if (Object.keys(metrics).length > 0) {
          //   reporter(metrics)
        }
      })
    })
  }

  getCurrentMetrics(): IMetricsObj {
    return metricsStore.getValues()
  }
}

export { WebVitals }
