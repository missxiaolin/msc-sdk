import {
  HackFetch,
  HackXml,
  HackWebVitals,
  HackJavascript,
  HackPromise,
  HackResource
} from './sdk';

import TaskQueue from './api/taskQueue';
import traceQueue from './api/traceQueue';

import { onBeforeunload, onHidden } from './utils/browser';

class MonitorJs {
  constructor(options = {}) {
    const {
      jsError = true,
      vueError = true,
      promise = true,
      resource = true,
      fetch = true,
      xhr = true,
      performance = true,
      click = true,
      pageChange = true,
      console = false,
    } = options?.watch || {};
    const customInfo = options?.customInfo || {};
    this.watchJs = jsError;
    this.watchPromise = promise; //
    this.watchResource = resource; // 资源
    this.watchFetch = fetch; // fetch
    this.watchXhr = xhr; // xmlhttp
    this.watchVue = vueError; // vue错误
    this.watchPerformance = performance; // 性能
    // 用户行为监控配置
    this.behaviorClick = click; // 用户行为
    this.behaviorPageChange = pageChange; // 页面跳转
    this.consoleError = !(console === false || !console.length); // console
    const consoleOption = this.consoleError && console;
    // 基础上报信息配置配置
    const {
      url = '',
      trackUrl = '',
      reportType = 1,
      delay = 8000,
      beforeSend = null,
      maxQueues = 15,
      encryption = false,
      monitorSwitch = true,
      trackSwitch = true,
    } = options?.report || {};
    const reportUrl = url; // 上报错误地址
    const monitorAppId = options?.monitorAppId; // 监控项目 id 无 则用当前日期
    if (!monitorAppId) {
      return alert('请设置监控上报项目');
    }
    const uuId = options?.uuId; // 上报人信息 id 无 则用随机数
    const $options = {
      reportUrl,
      trackUrl,
      customInfo,
      monitorAppId,
      uuId,
      reportType,
      delay,
      beforeSend,
      consoleOption,
      maxQueues,
      encryption,
      performance,
      monitorSwitch,
      trackSwitch,
    };
    monitorSwitch && TaskQueue.init($options);
    trackSwitch && traceQueue.init($options);

    this.init($options);
  }

  /**
   * 处理异常信息初始化
   * @param {*} $options
   */
  init($options) {
    const { monitorSwitch, trackSwitch, trackUrl } = $options;
    /**
     * 监听页面性能
     * @param {*} options {pageId：页面标示,url：上报地址}
     */
    if (monitorSwitch) {
      if (this.watchPerformance) {
        new HackWebVitals($options);
        // new NetworkSpeed($options)
        // new FirstScreenTime($options)
      }
      // JS 捕捉
      if (this.watchJs) {
        new HackJavascript($options);
      }
      // Promise  捕捉
      if (this.watchPromise) {
        new HackPromise($options);
      }
      // js、css、img 资源 捕捉
      if (this.watchResource) {
        new HackResource($options);
      }

      if (this.watchFetch) {
        new HackFetch($options);
      }
      if (this.watchXhr) {
        new HackXml($options);
      }
    }
    
    if (trackSwitch && trackUrl.length) {
      // TODO:
    }

    // 当页面进入后台或关闭前时，将所有的 cache 数据进行上报
    [onBeforeunload, onHidden].forEach(fn => {
      // TODO:
    })
  }
}

export default MonitorJs;
