import BaseMonitor from '../base/baseMonitor'
import { getCurrentTime, getNowFormatTime } from '../utils/utils'
import { CategoryEnum, ErrorLevelEnum } from '../base/baseConfig'
import { isString } from '../utils/validate'

class hackFetch extends BaseMonitor {
  constructor(options) {
    super(options);
    this.reportUrl = options.reportUrl
    this.init()
  }

  init() {
    
  }
}

export default hackFetch;
