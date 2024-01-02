import BaseMonitor from '../base/baseMonitor';
import { CategoryEnum, ErrorLevelEnum } from '../base/baseConfig';
import { getCurrentTime, getNowFormatTime } from '../utils/utils';
import { parseStackFrames } from '../utils/spaStackFrames';
import { isWxMiniEnv } from '../utils/global';

/**
 * 捕获JS错误
 * window.onerror = function(message, source, lineno, colno, error) { ... }
 
函数参数：
 
*   message：错误信息（字符串）。可用于HTML onerror=""处理程序中的event。
*   source：发生错误的脚本URL（字符串）
*   lineno：发生错误的行号（数字）
*   colno：发生错误的列号（数字）
*   error：Error对象
 
若该函数返回true，则阻止执行默认事件处理函数，如异常信息不会在console中打印。没有返回值或者返回值为false的时候，异常信息会在console中打印
 */
class hackJavascript extends BaseMonitor {
  constructor(options) {
    super(options);
    if (isWxMiniEnv) {
      // TODO:
    } else {
      this.handleError();
    }
  }

  /**
   * 注册onerror事件
   */
  handleError() {
    window.onerror = (msg, url, line, col, error) => {
      if (msg != 'Script error.' && !url) {
        return true;
      }
      try {
        const stackTraces = error ? parseStackFrames(error) : [];
        const jsError = {
          level: ErrorLevelEnum.WARN,
          category: CategoryEnum.JS_ERROR,
          errorMsg: msg,
          type: error.name || 'UnKnowun',
          // pageUrl: url,
          line,
          col,
          stackTraces,
          subType: 'jsError',
          happenTime: getCurrentTime(),
          happenDate: getNowFormatTime(),
        };
        this.recordError(jsError);
      } catch (error) {
        console.log('js错误异常', error);
      }
      return false;
    };
  }
}
export default hackJavascript;
