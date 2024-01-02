import BaseMonitor from '../base/baseMonitor';
import { getCurrentTime, getNowFormatTime, formatUrlToStr } from '../utils/utils';
import { CategoryEnum, ErrorLevelEnum } from '../base/baseConfig';
import { isString } from '../utils/validate';

class WxFetch extends BaseMonitor {
	constructor(options) {
    super(options);
		this.reportUrl = options.reportUrl;
		this.init();
	}
	
	init() {
		
	}
}