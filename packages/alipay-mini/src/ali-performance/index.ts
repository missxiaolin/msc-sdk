import { AliPerformanceInitOptions } from './types/index'
import { initAliPerformance } from './ali/index'
import Store from './core/store'

class AliPerformance {
  private store: Store

  constructor(options: AliPerformanceInitOptions) {
    const {
      reportCallback,
    } = options
    const store = new Store({ reportCallback })

    initAliPerformance(store)
    
  }
}

export default AliPerformance
