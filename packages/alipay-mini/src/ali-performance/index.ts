import { AliPerformanceInitOptions } from './types/index'
import { initAliPerformance } from './ali/index'
import Store from './core/store'
import { _support } from '../../../utils/global'

class AliPerformance {
  private store: Store

  constructor(options: AliPerformanceInitOptions) {
    const {
      reportCallback,
    } = options

    const store = _support.aliStore || (_support.aliStore = new Store({ reportCallback }))
    this.store = store

    initAliPerformance(store)
  }
}

export default AliPerformance
