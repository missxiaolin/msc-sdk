import BaseMonitor from '../base/baseMonitor';
import { CategoryEnum, ErrorLevelEnum } from '../base/baseConfig';
import { getCurrentTime, getNowFormatTime } from '../utils/utils';

class HackClick extends BaseMonitor {
  constructor(options) {
    super(options);
    this.init();
  }

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
