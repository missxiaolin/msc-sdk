/**
 * https://segmentfault.com/a/1190000004010453
 * https://github.com/fredshare/blog/issues/5
 * https://blog.csdn.net/lovenjoe/article/details/80260658
 * https://juejin.cn/post/7097157902862909471
 * https://juejin.cn/post/7172072612430872584
 */

import BaseMonitor from '../base/baseMonitor';
import { getCurrentTime, getNowFormatTime } from '../utils/utils';
import { ErrorLevelEnum, CategoryEnum } from '../base/baseConfig';
import TaskQueue from '../api/taskQueue';

export const afterLoad = callback => {
  if (document.readyState === 'complete') {
    setTimeout(callback);
  } else {
    window.addEventListener('pageshow', callback, { once: true, capture: true });
  }
};

export const observe = (type, callback) => {
  // 类型合规，就返回 observe
  if (PerformanceObserver.supportedEntryTypes?.includes(type)) {
    const ob = new PerformanceObserver(l => l.getEntries().map(callback));

    ob.observe({ type, buffered: true });
    return ob;
  }
  return undefined;
};

// 初始化入口，外部调用只需要 new WebVitals();
export default class WebVitals extends BaseMonitor {
  constructor(options) {
    super(options);
    this.metricsStore = {};
    this.initLCP();
    // this.initCLS();
    this.initResourceFlow();

    // 这里的 FP/FCP/FID需要在页面成功加载了再进行获取
    afterLoad(() => {
      this.initNavigationTiming();
      this.initFP();
      this.initFCP();
      this.initFID();
    });
  }

  // 性能数据的上报策略
  perfSendHandler() {
    // 如果你要监听 FID 数据。你就需要等待 FID 参数捕获完成后进行上报;
    // 如果不需要监听 FID，那么这里你就可以发起上报请求了;
    const performance = [
      {
        level: ErrorLevelEnum.INFO,
        category: CategoryEnum.PERFORMANCE,
        happenTime: getCurrentTime(),
        happenDate: getNowFormatTime(),
        ...this.metricsStore,
      },
    ];
    TaskQueue.sendEscalation(performance);
  }

  // initFMP() {
  //   new MutationObserver((records) => {
  //     // 对当前的 document 进行计算评分
  //     // 或者对 records.addedNodes的每个 node 元素，计算评分累加;每次遍历元素还需要判断此元素是否在可视区域
  //   }).observe(document, { childList: true, subtree: true });
  // }

  // 即 First Paint，为首次渲染的时间点。 - 白屏
  getFP() {
    const [entry] = performance.getEntriesByName('first-paint');
    return entry;
  }

  // 初始化 FP 的获取以及返回
  initFP() {
    const entry = this.getFP();
    const metrics = {
      startTime: entry?.startTime,
      entry,
    };
    this.metricsStore.FP = metrics;
  }

  // 获取 FCP 首次内容绘制：首次绘制任何文本、图像、非空白canvas或者SVG的时间点。 - 灰屏
  getFCP() {
    const [entry] = performance.getEntriesByName('first-contentful-paint');
    return entry;
  }

  // 初始化 FCP 的获取以及返回
  initFCP() {
    const entry = this.getFCP();
    const metrics = {
      startTime: entry?.startTime,
      entry,
    };
    this.metricsStore.FCP = metrics;
  }

  // 获取 LCP
  getLCP(entryHandler) {
    return observe('largest-contentful-paint', entryHandler);
  }

  // 初始化 LCP 的获取以及返回
  /***
   * @description 最大内容绘制，是用来测量加载的性能。这个指标上报视口中可见的最大图像或文本块的渲染的时间点，为了提供良好的用户体验，LCP 分数最好保证在 2.5 秒以内。
   */
  initLCP() {
    const entryHandler = entry => {
      const { duration, entryType, id, loadTime, name, renderTime, size, startTime, url } = entry;
      const metrics = {
        startTime: startTime,
        entry: { duration, entryType, id, loadTime, name, renderTime, size, startTime, url },
      };
      this.metricsStore.LCP = metrics;
    };
    this.getLCP(entryHandler);
  }

  // 获取 FID
  /**
   * @description 第一次输入延迟，用于测量可交互性。站点应该努力使 FID 保持在 100 毫秒以内。
   * @param {*} entryHandler
   * @returns
   */
  getFID(entryHandler) {
    return observe('first-input', entryHandler);
  }

  // 初始化 FID 的获取 及返回
  initFID() {
    const entryHandler = entry => {
      const metrics = {
        delay: entry.processingStart - entry.startTime,
        entry,
      };
      this.metricsStore.FID = metrics;
      // 第一次用户交互上报信息
      this.perfSendHandler();
    };
    this.getFID(entryHandler);
  }

  // 获取 CLS
  /**
   * @description 累计布局位移，用于测量视觉稳定性。站点应该努力使 CLS 分数达到 0.1 或更低。
   * @param {*} entryHandler
   * @returns
   */
  getCLS(entryHandler) {
    return observe('layout-shift', entryHandler);
  }

  // 初始化 CLS 的获取以及返回
  initCLS() {
    let clsValue = 0;
    let clsEntries = [];

    let sessionValue = 0;
    let sessionEntries = [];

    const entryHandler = entry => {
      if (!entry.hadRecentInput) {
        const firstSessionEntry = sessionEntries[0];
        const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

        // 如果条目与上一条目的相隔时间小于 1 秒且
        // 与会话中第一个条目的相隔时间小于 5 秒，那么将条目
        // 包含在当前会话中。否则，开始一个新会话。
        if (
          sessionValue &&
          entry.startTime - lastSessionEntry.startTime < 1000 &&
          entry.startTime - firstSessionEntry.startTime < 5000
        ) {
          sessionValue += entry.value;
          sessionEntries.push(entry);
        } else {
          sessionValue = entry.value;
          sessionEntries = [entry];
        }

        // 如果当前会话值大于当前 CLS 值，
        // 那么更新 CLS 及其相关条目。
        if (sessionValue > clsValue) {
          clsValue = sessionValue;
          clsEntries = sessionEntries;

          // 记录 CLS 到 Map 里
          const metrics = {
            entry,
            clsValue,
            clsEntries,
          };
          this.metricsStore.CLS = metrics;
        }
      }
    };
    this.getCLS(entryHandler);
  }

  // 获取 NT
  getNavigationTiming() {
    const resolveNavigationTiming = entry => {
      /**
       {
            navigationStart,  // 同一个浏览器上下文中，上一个文档结束时的时间戳。如果没有上一个文档，这个值会和 fetchStart 相同。
            unloadEventStart,  // 上一个文档 unload 事件触发时的时间戳。如果没有上一个文档，为 0。
            unloadEventEnd, // 上一个文档 unload 事件结束时的时间戳。如果没有上一个文档，为 0。
            redirectStart, // 表示第一个 http 重定向开始时的时间戳。如果没有重定向或者有一个非同源的重定向，为 0。
            redirectEnd, // 表示最后一个 http 重定向结束时的时间戳。如果没有重定向或者有一个非同源的重定向，为 0。
            fetchStart, // 表示浏览器准备好使用 http 请求来获取文档的时间戳。这个时间点会在检查任何缓存之前。
            domainLookupStart, // 域名查询开始的时间戳。如果使用了持久连接或者本地有缓存，这个值会和 fetchStart 相同。
            domainLookupEnd, // 域名查询结束的时间戳。如果使用了持久连接或者本地有缓存，这个值会和 fetchStart 相同。
            connectStart, // http 请求向服务器发送连接请求时的时间戳。如果使用了持久连接，这个值会和 fetchStart 相同。
            connectEnd, // 浏览器和服务器之前建立连接的时间戳，所有握手和认证过程全部结束。如果使用了持久连接，这个值会和 fetchStart 相同。
            secureConnectionStart, // 浏览器与服务器开始安全链接的握手时的时间戳。如果当前网页不要求安全连接，返回 0。
            requestStart, // 浏览器向服务器发起 http 请求(或者读取本地缓存)时的时间戳，即获取 html 文档。
            responseStart, // 浏览器从服务器接收到第一个字节时的时间戳。
            responseEnd, // 浏览器从服务器接受到最后一个字节时的时间戳。
            domLoading, // dom 结构开始解析的时间戳，document.readyState 的值为 loading。
            domInteractive, // dom 结构解析结束，开始加载内嵌资源的时间戳，document.readyState 的状态为 interactive。
            domContentLoadedEventStart, // DOMContentLoaded 事件触发时的时间戳，所有需要执行的脚本执行完毕。
            domContentLoadedEventEnd,  // DOMContentLoaded 事件结束时的时间戳
            domComplete, // dom 文档完成解析的时间戳， document.readyState 的值为 complete。
            loadEventStart, // load 事件触发的时间。
            loadEventEnd, // load 时间结束时的时间。
            renderBlockingStatus, //谷歌107版本增加 可以精确识别页面上的资源是否有渲染阻塞；
          }
       */
      const {
        domainLookupStart,
        domainLookupEnd,
        connectStart,
        connectEnd,
        secureConnectionStart,
        requestStart,
        responseStart,
        responseEnd,
        domInteractive,
        domContentLoadedEventEnd,
        loadEventStart,
        fetchStart,
      } = entry;

      return {
        //白屏时间
        FP: responseEnd - fetchStart,
        // 首次可交互时间（TTI）：即 Time to interactive，记录从页面加载开始，到页面处于完全可交互状态所花费的时间。
        TTI: domInteractive - fetchStart,
        // HTML加载完成时间也就是 DOM Ready 时间。
        DomReady: domContentLoadedEventEnd - fetchStart,
        // 页面完全加载时间
        Load: loadEventStart - fetchStart,
        // 首包时间
        FirseByte: responseStart - domainLookupStart,

        // 关键时间段
        //DNS查询耗时
        DNS: domainLookupEnd - domainLookupStart,
        // TCP连接耗时
        TCP: connectEnd - connectStart,
        // 	SSL安全连接耗时
        SSL: secureConnectionStart ? connectEnd - secureConnectionStart : 0,
        // 请求响应耗时
        TTFB: responseStart - requestStart,
        // 内容传输耗时
        Trans: responseEnd - responseStart,
        // DOM解析耗时
        DomParse: domInteractive - responseEnd,
        // 资源加载耗时
        Res: loadEventStart - domContentLoadedEventEnd,
      };
    };

    const navigation =
      // W3C Level2  PerformanceNavigationTiming
      // 使用了High-Resolution Time，时间精度可以达毫秒的小数点好几位。
      performance.getEntriesByType('navigation').length > 0
        ? performance.getEntriesByType('navigation')[0]
        : performance.timing; // W3C Level1  (目前兼容性高，仍然可使用，未来可能被废弃)。
    return resolveNavigationTiming(navigation);
  }

  // 初始化 NT 的获取以及返回
  initNavigationTiming() {
    const metrics = this.getNavigationTiming();
    this.metricsStore.NT = metrics;
  }

  /**
   * @description 无法获取微服务fetch 请求加载的资源， 页面
   * 获取资源
   * @param {*} resourceFlow
   * @returns
   */
  getResourceFlow = resourceFlow => {
    const entryHandler = entry => {
      resourceFlow.push(this.resourceFormat(entry));
    };

    return observe('resource', entryHandler);
  };

  // 初始化 RF 的获取以及返回
  initResourceFlow() {
    const resourceFlow = [];
    const resObserve = this.getResourceFlow(resourceFlow);

    const stopListening = () => {
      if (resObserve) {
        resObserve.disconnect();
      }
      const metrics = resourceFlow;
      this.metricsStore.RF = metrics;
    };
    // 当页面 pageshow 触发时，中止
    window.addEventListener('pageshow', stopListening, { once: true, capture: true });
  }

  /**
   * 获取资源信息
   * @param {*} usefulType
   * @returns
   */
  getEntries(usefulType) {
    usefulType = usefulType || [];
    if (!window.performance || !window.performance.getEntries) {
      console.log('该浏览器不支持performance.getEntries方法');
      return;
    }
    let entryTimesList = [];
    let entryList = window.performance.getEntries() || [];
    entryList.forEach((entry, index) => {
      entryTimesList.push(this.resourceFormat(entry));
    });
    return (this.metricsStore.RF = entryTimesList);
  }

  resourceFormat(entry) {
    /**
       // PerformanceResourceTiming 各字段说明
        {
          connectEnd, // 表示浏览器完成建立与服务器的连接以检索资源之后的时间
          connectStart, // 表示浏览器开始建立与服务器的连接以检索资源之前的时间
          decodedBodySize, // 表示在删除任何应用的内容编码之后，从*消息主体*的请求（HTTP 或缓存）中接收到的大小（以八位字节为单位）
          domainLookupEnd, // 表示浏览器完成资源的域名查找之后的时间
          domainLookupStart, // 表示在浏览器立即开始资源的域名查找之前的时间
          duration, // 返回一个timestamp，即 responseEnd 和 startTime 属性的差值
          encodedBodySize, // 表示在删除任何应用的内容编码之前，从*有效内容主体*的请求（HTTP 或缓存）中接收到的大小（以八位字节为单位）
          entryType, // 返回 "resource"
          fetchStart, // 表示浏览器即将开始获取资源之前的时间
          initiatorType, // 代表启动性能条目的资源的类型，如 PerformanceResourceTiming.initiatorType 中所指定
          name, // 返回资源 URL
          nextHopProtocol, // 代表用于获取资源的网络协议
          redirectEnd, // 表示收到上一次重定向响应的发送最后一个字节时的时间
          redirectStart, // 表示上一次重定向开始的时间
          requestStart, // 表示浏览器开始向服务器请求资源之前的时间
          responseEnd, // 表示在浏览器接收到资源的最后一个字节之后或在传输连接关闭之前（以先到者为准）的时间
          responseStart, // 表示浏览器从服务器接收到响应的第一个字节后的时间
          secureConnectionStart, // 表示浏览器即将开始握手过程以保护当前连接之前的时间
          serverTiming, // 一个 PerformanceServerTiming 数组，包含服务器计时指标的PerformanceServerTiming 条目
          startTime, // 表示资源获取开始的时间。该值等效于 PerformanceEntry.fetchStart
          transferSize, // 代表所获取资源的大小（以八位字节为单位）。该大小包括响应标头字段以及响应有效内容主体
          workerStart // 如果服务 Worker 线程已经在运行，则返回在分派 FetchEvent 之前的时间戳，如果尚未运行，则返回在启动 Service Worker 线程之前的时间戳。如果服务 Worker 未拦截该资源，则该属性将始终返回 0。
        }
       */
    const {
      name,
      duration,
      transferSize,
      initiatorType,
      startTime,
      responseEnd,
      domainLookupEnd,
      domainLookupStart,
      connectStart,
      connectEnd,
      secureConnectionStart,
      responseStart,
      requestStart,
      nextHopProtocol,
    } = entry;
    return {
      // name 资源地址
      name,
      //http协议版本
      nextHopProtocol,
      // transferSize 传输大小
      transferSize,
      // initiatorType 资源类型
      initiatorType,
      // startTime 开始时间
      startTime,
      // responseEnd 结束时间
      responseEnd,
      // 贴近 Chrome 的近似分析方案，受到跨域资源影响
      dns: domainLookupEnd - domainLookupStart,
      tcp: connectEnd - connectStart,
      // SSL安全连接耗时
      ssl: connectEnd - secureConnectionStart,
      // 请求耗时
      ttfb: responseStart - requestStart,
      // 资源下载时间
      contentDownload: responseEnd - responseStart,
      // 资源的总耗时（包括等待时长，请求时长，响应时长，相当于 responseEnd - startTime）
      duration,
    };
  }
}
