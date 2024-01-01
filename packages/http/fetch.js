import BaseMonitor from '../base/baseMonitor';
import { getCurrentTime, getNowFormatTime, formatUrlToStr } from '../utils/utils';
import { CategoryEnum, ErrorLevelEnum } from '../base/baseConfig';
import { isString } from '../utils/validate';

class HackFetch extends BaseMonitor {
  constructor(options) {
    super(options);
    this.reportUrl = options.reportUrl;
    this.init();
  }

  init() {
    if (!window.fetch) return;
    const oFetch = window.fetch;
    if (!window.oFetch) {
      window.oFetch = oFetch;
    }
    window.fetch = async (url, init) => {
      // init 是用户手动传入的 fetch 请求互数据，包括了 method、body、headers，要做统一拦截数据修改，直接改init即可
      // if (typeof sendHandler === 'function') sendHandler(init);
      let metrics = {};
      metrics.method = init?.method || 'GET';
      metrics.pathName = (url && typeof url !== 'string' ? url?.url : url) || ''; // 请求的url
      metrics.requestText = init?.body || '';
      metrics.requestTime = getCurrentTime();
      metrics.type = 'fetch';
      metrics.pathName = formatUrlToStr(metrics.pathName);

      return oFetch.call(window, url, init).then(async response => {
        // clone 出一个新的 response,再用其做.text(),避免 body stream already read 问题
        try {
          if (!this.isUrlInIgnoreList(metrics.pathName)) {
            const res = response.clone();
            const { timeout, status, statusText = '' } = res;
            const isSuceess = status >= 200 && status < 300;
            const endTime = getCurrentTime();
            let responseText = await res.text();
            if (!isString(response)) {
              responseText = JSON.stringify(responseText);
            }
            if (responseText.length >= 500) {
              responseText = '内容过大未记录';
            }
            metrics = {
              ...metrics,
              level: isSuceess ? ErrorLevelEnum.INFO : ErrorLevelEnum.ERROR,
              category: CategoryEnum.HTTP_LOG,
              status,
              timeout,
              eventType: 'load',
              statusText,
              responseText,
              responseTime: endTime,
              duration: endTime - metrics.requestTime,
              happenTime: endTime,
              happenDate: getNowFormatTime(),
            };
            this.recordError(metrics);
          }
        } catch (error) {
          // ...
        }
        return response;
      });
    };
  }
}

export default HackFetch;
