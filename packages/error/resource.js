import BaseMonitor from '../base/baseMonitor';
import { getCurrentTime, getNowFormatTime } from '../utils/utils';
import { CategoryEnum, ErrorLevelEnum } from '../base/baseConfig';
/**
 * 资源加载错误
 */
class HackResource extends BaseMonitor {
  constructor(options) {
    super(options);
    this.handleError();
  }

  /**
   * 注册onerror事件
   */
  handleError() {
    const handleListenerError = event => {
      try {
        if (!event) {
          return;
        }
        let target = event.target || event.srcElement;
        let isElementTarget =
          target instanceof HTMLScriptElement ||
          target instanceof HTMLLinkElement ||
          target instanceof HTMLImageElement;
        if (!isElementTarget) {
          return; // js error不再处理
        }
        const resourceError = {
          category: CategoryEnum.RESOURCE_ERROR,
          level:
            target.tagName.toUpperCase() === 'IMG' ? ErrorLevelEnum.WARN : ErrorLevelEnum.ERROR,
          errorMsg: `加载 ${target.tagName} 资源错误`,
          url: target.src || target.href,
          startTime: event.timeStamp,
          html: target.outerHTML,
          resourceType: target.tagName,
          paths: event.path.map(item => item.tagName).filter(Boolean),
          happenTime: getCurrentTime(),
          happenDate: getNowFormatTime(),
        };
        this.recordError(resourceError);
      } catch (error) {
        console.log('资源加载收集异常', error);
      }
    };
    window.addEventListener('error', handleListenerError, true);
  }
}
export default HackResource;
