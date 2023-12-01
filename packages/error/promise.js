import BaseMonitor from '../base/baseMonitor';
import { getCurrentTime, getNowFormatTime } from '../utils/utils';
import { CategoryEnum, ErrorLevelEnum } from '../base/baseConfig';
/**
 * 捕获未处理的Promise异常
 */
class hackPromise extends BaseMonitor {
  constructor(options) {
    super(options);
    this.handleError();
  }

  /**
   * 处理错误
   */
  handleError() {
    window.addEventListener(
      'unhandledrejection',
      event => {
        try {
          const { reason = '', timeStamp } = event;
          if (!reason) {
            return;
          }
          // 判断当前被捕获的异常url，是否是异常处理url，防止死循环
          // if (event.reason.config && event.reason.config.url) {
          //     this.url = event.reason.config.url;
          // }
          // reason = reason.toString()
          // console.log('reason----', reason)
          // console.log('event----', event)
          const promiseError = {
            level: ErrorLevelEnum.WARN,
            category: CategoryEnum.PROMISE_ERROR,
            errorMsg: reason,
            startTime: timeStamp,
            happenTime: getCurrentTime(),
            happenDate: getNowFormatTime(),
          };
          this.recordError(promiseError);
        } catch (error) {
          console.log(error);
        }
      },
      true
    );
  }
}
export default hackPromise;
