import BaseMonitor from '../base/baseMonitor';
import { CategoryEnum, ErrorLevelEnum } from '../base/baseConfig';
import { getCurrentTime, getNowFormatTime, throttle } from '../utils/utils';
import { isWxMiniEnv } from '../utils/global';
import { targetAsString } from '../utils/wx'
import { replaceOld } from '../utils/help';
class HackClick extends BaseMonitor {
  constructor(options) {
    super(options);
    if (isWxMiniEnv) {
      this.wxInit();
    } else {
      this.init();
    }
  }

  // 小程序代理请求
  wxInit() {
    const originPage = Page;
    let self = this;
    Page = function (pageOptions) {
      /**
       * 记录用户行为
       * @param {*} e
       */
      function gestureTrigger(e) {
        e.mitoProcessed = true; // 给事件对象增加特殊的标记，避免被无限透传
        const { target = {}, detail, timeStamp = '', type = '' } = e
        try {
          self.recordError({
            level: ErrorLevelEnum.INFO,
            category: CategoryEnum.USER_CLICK,
            top: target.offsetTop,
            left: target.offsetLeft,
            pageHeight: 0,
            scrollTop: 0,
            subType: type,
            tagName: "view",
            targetInfo: {
              offsetWidth: 0,
              offsetHeight: 0,
            },
            paths: "",
            startTime: timeStamp,
            innerHTML: targetAsString(e),
            happenTime: getCurrentTime(),
            happenDate: getNowFormatTime(),
            viewport: {
              width: detail.x || 0,
              height: detail.y || 0,
            },
          });
        } catch (e) {
          // Ignore
        }
      }
      function isNotAction(method) {
        // 如果是method中处理过的方法，则不是处理用户手势行为的方法
        return ['onLoad'].find(m => m.replace('PageOn', 'on') === method);
      }
      const throttleGesturetrigger = throttle(gestureTrigger, 500);
      const linstenerTypes = ['touchmove', 'tap'];
      // 用户行为重写click
      Object.keys(pageOptions).forEach(m => {
        if ('function' !== typeof pageOptions[m] || isNotAction(m)) {
          return;
        }
        replaceOld(
          pageOptions,
          m,
          function (originMethod) {
            return function (...args) {
              const e = args[0];
              if (e && e.type && e.currentTarget && !e.mitoProcessed) {
                if (linstenerTypes.indexOf(e.type) > -1) {
                  throttleGesturetrigger(e);
                }
              }
              originMethod.apply(this, args);
            };
          },
          true
        );
      });
      return originPage.call(this, pageOptions)
    };
  }

  // 页面代理请求
  init() {
    ['mousedown', 'touchstart'].forEach(eventType => {
      window.addEventListener(eventType, event => {
        try {
          const target = event.target;
          const { offsetWidth, offsetHeight, tagName, outerHTML, innerHTML } = target;
          const { top, left } = target.getBoundingClientRect();
          let paths = event.path
            ?.map(item => {
              const { tagName, id, className } = item;
              return (
                tagName &&
                `${tagName}${id ? '#' + id : ''}${
                  className ? '.' + className.replace(/''/g, '.') : ''
                }`
              );
            })
            .filter(Boolean);
          // if (paths && paths.length > 5) {
          //     paths = paths.slice(0, 5)
          // }
          this.recordError({
            level: ErrorLevelEnum.INFO,
            category: CategoryEnum.USER_CLICK,
            top,
            left,
            pageHeight: document.documentElement.scrollHeight || document.body.scrollHeight,
            scrollTop: document.documentElement.scrollTop || document.body.scrollTop,
            subType: eventType,
            tagName,
            targetInfo: {
              offsetWidth,
              offsetHeight,
            },
            paths,
            startTime: event.timeStamp,
            // outerHTML,
            innerHTML,
            happenTime: getCurrentTime(),
            happenDate: getNowFormatTime(),
            viewport: {
              width: window.innerWidth,
              height: window.innerHeight,
            },
          });
        } catch (error) {
          //
        }
      });
    });
  }
}

export default HackClick;
