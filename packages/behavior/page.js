import BaseMonitor from '../base/baseMonitor';
import { CategoryEnum, ErrorLevelEnum } from '../base/baseConfig';
import { getCurrentTime, getNowFormatTime, getPageURL } from '../utils/utils';

class HackPage extends BaseMonitor {
  constructor(options) {
    super(options);
    // 页面第一次加载 执行一次 记录
    this.formatData();

    this.init();
  }

  init() {
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

  formatData(data = {}) {
    const { to = getPageURL(), from = '', subType = 'popstate', duration = 0 } = data;

    // from + duration 可以计算每个页面停留时间
    this.recordError({
      level: ErrorLevelEnum.INFO,
      category: CategoryEnum.PAGE_CHANGE,
      referrer: document.referrer,
      type: window.performance?.navigation?.type || '',
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
