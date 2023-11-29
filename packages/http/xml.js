import BaseMonitor from '../base/baseMonitor';
import { getCurrentTime, getNowFormatTime } from '../utils/utils';
import { CategoryEnum, ErrorLevelEnum } from '../base/baseConfig';

class HackXml extends BaseMonitor {
  constructor(options) {
    super(options);
    this.reportUrl = options.reportUrl;
    this.init();
  }

  init() {
    let self = this;
    if ('XMLHttpRequest' in window && typeof window.XMLHttpRequest === 'function') {
      let XMLHttpRequest = window.XMLHttpRequest;
      let oldOpen = XMLHttpRequest.prototype.open; // 缓存老的open方法
      XMLHttpRequest.prototype.open = function (method, url, async) {
        // 重写open方法
        if (!self.isUrlInIgnoreList(url)) {
          // tracker会向sls发送日志的，所以不监控这个，否则会引起死循环
          this.logData = { method, url, async }; // 增强功能,把初始化数据保存为对象的属性
        }
        // console.log('this.getAllResponseHeaders();--1--', this)
        return oldOpen.apply(this, arguments);
      };

      let oldSend = XMLHttpRequest.prototype.send; // 缓存老的send方法
      XMLHttpRequest.prototype.send = function (body) {
        // 重写sned方法
        if (this.logData) {
          let startTime = Date.now(); // 在发送之前记录开始时间
          try {
            // 如果有值，说明已经被拦截了
            let handler = type => e => {
              const endTime = getCurrentTime();
              let duration = Date.now() - startTime; // 在结束时记录经过的时间
              // TODO: 待优化 可配置 状态码
              let status = this.status; // 200 or 500
              // if (parseInt(status) === 200) return
              // TODO: 待优化
              const isSuceess = status >= 200 && status < 300;
              let statusText = this.statusText; // or Server Error
              let responseText = this.response ? JSON.stringify(this.response) : '';
              if (responseText.length >= 500) {
                responseText = '内容过大未记录';
              }
              let metrics = {
                type: 'xhr',
                method: this.logData.method,
                level: isSuceess ? ErrorLevelEnum.INFO : ErrorLevelEnum.ERROR,
                category: CategoryEnum.HTTP_LOG,
                status,
                eventType: type, // load error abort
                pathName: this.logData.url, // 请求路径
                statusText, // 状态码
                duration, // 持续时间
                timeout: this.timeout,
                responseText, // 响应体
                requestText: body || '',
                happenTime: endTime,
                happenDate: getNowFormatTime(),
              };
              // console.log('metrics---', metrics)
              self.recordError(metrics);
            };

            this.addEventListener('load', handler('load'), false); // 传输完成，所有数据保存在 response 中
            this.addEventListener('error', handler('error'), false); // 500也算load,只有当请求发送不成功时才是error
            this.addEventListener('abort', handler('abort'), false); // 放弃
          } catch (error) {
            // ..
            console.log(`monitor error:${error}`);
          }

          // handler("load")相当于1个柯理化
        }
        return oldSend.apply(this, arguments);
      };

      // const oXMLHttpRequest = window.XMLHttpRequest;
      // if (!window.oXMLHttpRequest) {
      //   // oXMLHttpRequest 为原生的 XMLHttpRequest，可以用以 SDK 进行数据上报，区分业务
      //   window.oXMLHttpRequest = oXMLHttpRequest;
      // }
      // window.XMLHttpRequest = function () {
      //   // 覆写 window.XMLHttpRequest
      //   const xhr = new oXMLHttpRequest();
      //   const { open, send } = xhr;
      //   let metrics = {};
      //   xhr.open = (method, url) => {
      //     metrics.method = method;
      //     metrics.url = url;
      //     metrics.httpTool = "XMLHttpRequest";

      //     open.call(xhr, method, url, true);
      //   };

      //   xhr.send = (body) => {
      //     metrics.requestText = body || '';
      //     metrics.requestTime = getCurrentTime();
      //     // sendHandler 可以在发送 Ajax 请求之前，挂载一些信息，比如 header 请求头
      //     // setRequestHeader 设置请求header，用来传输关键参数等
      //     // xhr.setRequestHeader('xxx-id', 'VQVE-QEBQ');
      //     // if (typeof sendHandler === 'function') sendHandler(xhr);
      //     send.call(xhr, body);
      //   };

      //   xhr.addEventListener('loadend', () => {
      //     try {
      //       if (self.isUrlInIgnoreList(metrics.url)) return
      //       let { status, statusText, response, timeout } = xhr;
      //       const isSuceess = (status >= 200 && status < 300);
      //       const endTime = getCurrentTime()
      //       // console.log('xhr----', xhr)
      //       if (!isString(response)) {
      //         response = JSON.stringify(response);
      //       }
      //       metrics = {
      //         ...metrics,
      //         level: isSuceess ? ErrorLevelEnum.INFO : ErrorLevelEnum.ERROR,
      //         category: CategoryEnum.HTTP_LOG,
      //         status,
      //         statusText,
      //         timeout,
      //         responseText: response,
      //         responseTime: endTime,
      //         duration: endTime - metrics.requestTime,
      //         happenTime: endTime,
      //         happenDate: getNowFormatTime(),
      //       };
      //       // if (typeof loadHandler === 'function') loadHandler(metrics);
      //       // console.log('metrics---ajax--', metrics)
      //       self.recordError(metrics)
      //       // xhr.status 状态码
      //     } catch (error) {

      //     }
      //   });
      //   return xhr;
      // };
    }
  }
}

export default HackXml;
