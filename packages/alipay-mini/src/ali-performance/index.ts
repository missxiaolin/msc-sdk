import { AliPerformanceInitOptions } from './types/index'
import Store from './core/store'

class AliPerformance {
  private store: Store

  constructor(options: AliPerformanceInitOptions) {
    const {
      reportCallback,
    } = options
  }
}

export default AliPerformance
