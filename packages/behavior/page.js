import BaseMonitor from '../base/baseMonitor';
import { CategoryEnum, ErrorLevelEnum } from '../base/baseConfig';
import { getCurrentTime, getNowFormatTime, getPageURL } from '../utils/utils';
import { isWxMiniEnv } from '../utils/global';
import { replaceOld } from '../utils/help';

class HackPage extends BaseMonitor {
  constructor(options) {
    super(options);

    if (isWxMiniEnv) {
      this.referrerPage = 'App';
      this.subType = '';
      this.WxRouteEvents = [
        'switchTab',
        'reLaunch',
        'redirectTo',
        'navigateTo',
        'navigateBack',
        'routeFail',
      ];

      this.wxInit();
    } else {
      // 页面第一次加载 执行一次 记录
      this.formatData();
      this.webInit();
    }
  }

  // 微信
  wxInit() {
    const originPage = Page;
    let popstateStartTime = Date.now();
    let self = this;
    // 页面
    Page = function (pageOptions) {
      replaceOld(
        pageOptions,
        'onLoad',
        function (originMethod) {
          return function (...args) {
            if (originMethod) {
              originMethod.apply(this, args);
            }
            self.formatData({
              to: getPageURL(),
              from: self.referrerPage,
              duration: Date.now() - popstateStartTime,
              subType: self.subType,
            });
          };
        },
        true
      );
      return originPage.call(this, pageOptions);
    };
    // 路由跳转重写，记录上个url
    let WxRouteEvents = this.WxRouteEvents;
    WxRouteEvents.forEach(method => {
      let originMethod = wx[method];
      Object.defineProperty(wx, method, {
        writable: true,
        enumerable: true,
        configurable: true,
        value: function (options) {
          try {
            self.referrerPage = getPageURL();
            self.subType = method;
          } catch (e) {}
          return originMethod.call(this, options);
        },
      });
    });
  }

  // 浏览器
  webInit() {
    let _wr = function (type) {
      let orig = history[type];
      return function () {
        let rv = orig.apply(this, arguments);
        let e = new Event(type);
        e.arguments = arguments;
        window.dispatchEvent(e);
        return rv;
      };
    };
    history.pushState = _wr('pushState');
    history.replaceState = _wr('replaceState');

    let from = '',
      popstateStartTime = Date.now();
    const popstateEvent = (type = 'popstate') => {
      const to = getPageURL();
      const duration = Date.now() - popstateStartTime;
      if (to === from) return;
      this.formatData({
        from,
        to,
        duration,
        subType: type,
      });
      from = to;
      popstateStartTime = Date.now();
    };
    /**
     * 单页面 监听
     */
    window.addEventListener('replaceState', e => {
      popstateEvent('replaceState');
    });
    window.addEventListener('pushState', e => {
      popstateEvent('pushState');
    });
    /**
     * 返回
     */
    window.addEventListener(
      'popstate',
      () => {
        popstateEvent('pushState');
      },
      true
    );

    let oldURL = '',
      hashchangeStartTime = Date.now();
    window.addEventListener(
      'hashchange',
      event => {
        const newURL = event.newURL;
        const duration = Date.now() - hashchangeStartTime;
        this.formatData({
          from: oldURL,
          to: newURL,
          duration,
          subType: 'hashchange',
        });

        oldURL = newURL;
        hashchangeStartTime = Date.now();
      },
      true
    );
  }

  /**
   * 发送
   * @param {*} data
   */
  formatData(data = {}) {
    const { to = getPageURL(), from = '', subType = 'popstate', duration = 0 } = data;

    // from + duration 可以计算每个页面停留时间
    this.recordError({
      level: ErrorLevelEnum.INFO,
      category: CategoryEnum.PAGE_CHANGE,
      referrer: isWxMiniEnv ? getPageURL() : document.referrer,
      type: isWxMiniEnv ? '' : window.performance?.navigation?.type || '',
      to,
      from,
      subType,
      duration,
      startTime: performance.now(),
      happenTime: getCurrentTime(),
      happenDate: getNowFormatTime(),
    });
  }
}

export default HackPage;
