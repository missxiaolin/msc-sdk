import BaseMonitor from '../base/baseMonitor';
import { getCurrentTime, getNowFormatTime, formatUrlToStr, __assign } from '../utils/utils';
import { CategoryEnum, ErrorLevelEnum } from '../base/baseConfig';
import { isWxMiniEnv } from '../utils/global';

class WxFetch extends BaseMonitor {
  constructor(options) {
    super(options);
    this.reportUrl = options.reportUrl;
    if (isWxMiniEnv) this.init();
  }

  init() {
    let originRequest = wx.request;
    let self = this;
    Object.defineProperty(wx, 'request', {
      writable: true,
      enumerable: true,
      configurable: true,
      value: function () {
        let args = [];
        for (let _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        let options$1 = args[0];
        let url = options$1.url || '';

        let reqData;
        reqData = options$1.data;
        let metrics = {};
        metrics.method = options$1.method ? options$1.method : 'GET';
        metrics.pathName = url || ''; // 请求url
        metrics.requestText = reqData ? JSON.stringify(reqData) : '';
        metrics.requestTime = getCurrentTime();
        metrics.type = 'request';
        metrics.pathName = formatUrlToStr(metrics.pathName);

        const successHandler = function (res) {
          const isSuceess = res.statusCode == 200;
          let endTime = getCurrentTime();
          try {
            if (!self.isUrlInIgnoreList(metrics.pathName)) {
              metrics = {
                ...metrics,
                level: isSuceess ? ErrorLevelEnum.INFO : ErrorLevelEnum.ERROR,
                category: CategoryEnum.HTTP_LOG,
                status: res.statusCode,
                timeout: options$1.timeout || '',
                eventType: 'load',
                statusText: '',
                responseText: res.data ? JSON.stringify(res.data) : '',
                responseTime: endTime,
                duration: endTime - metrics.requestTime,
                happenTime: endTime,
                happenDate: getNowFormatTime(),
              };
              self.recordError(metrics);
            }
          } catch (e) {
            console.error('httpError', e);
          }
          if (typeof options$1.success === 'function') {
            return options$1.success(res);
          }
        };

        const failHandler = function (err) {
          let endTime = getCurrentTime();
          let args = [];
          for (let _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
          }
          let options$1 = args[0];
          let url = options$1.url || '';

          let reqData;
          reqData = options$1.data;
          let metrics = {};
          metrics.method = options$1.method ? options$1.method : 'GET';
          metrics.pathName = url || ''; // 请求url
          metrics.requestText = reqData ? JSON.stringify(reqData) : '';
          metrics.requestTime = getCurrentTime();
          metrics.type = 'request';
          metrics.pathName = formatUrlToStr(metrics.pathName);
          try {
            if (!self.isUrlInIgnoreList(metrics.pathName)) {
              metrics = {
                ...metrics,
                level: ErrorLevelEnum.ERROR,
                category: CategoryEnum.HTTP_LOG,
                status: err.statusCode || 500,
                timeout: options$1.timeout || '',
                eventType: 'load',
                statusText: '',
                responseText: res.data ? JSON.stringify(res.data) : '',
                responseTime: endTime,
                duration: endTime - metrics.requestTime,
                happenTime: endTime,
                happenDate: getNowFormatTime(),
              };
              self.recordError(metrics);
            }
          } catch (e) {
            // TODO:
          }
          if (typeof options$1.fail === 'function') {
            return options$1.fail(err);
          }
        };
        let actOptions = __assign(__assign({}, options$1), {
          success: successHandler,
          fail: failHandler,
        });
        return originRequest.call(this, actOptions);
      },
    });
  }
}

export default WxFetch;
