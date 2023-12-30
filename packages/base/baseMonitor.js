import { replaceSlash, getPageURL, formatUrlToStr } from '../utils/utils';
import Queue from '../api/taskQueue';

/**
 * 监控基类
 */
class BaseMonitor {
  /**
   * 上报错误地址
   * @param {*} options { reportUrl,customInfo }
   */
  constructor(options) {
    this.$options = options;
    // 轮询 获取window vue 最大次数
    this.maxPolling = 0;
    this.pageLoadDone = false;
    window.addEventListener(
      'pageshow',
      () => {
        this.pageLoadDone = true;
      },
      { once: true, capture: true }
    );
  }

  /**
   * 记录错误信息
   */
  recordError(recordObj = {}) {
    this.handleRecordError(recordObj);
  }

  /**
   * 处理记录日志
   */
  handleRecordError(recordObj) {
    try {
      if (!Object.keys(recordObj).length) return;
      // 过滤掉错误上报地址
      if (
        this.$options.reportUrl &&
        recordObj.url &&
        recordObj.url.toLowerCase().indexOf(this.$options.reportUrl.toLowerCase()) >= 0
      ) {
        console.log('统计错误接口异常', this.msg);
        return;
      }
      const pageUrl = getPageURL();
      let recordInfo = {
        pageUrl,
        simpleUrl: formatUrlToStr(pageUrl),
        ...recordObj,
      };
      // console.log("\n````````````````````` " + recordObj.category + " `````````````````````\n", recordInfo)

      // 记录日志
      Queue.getInstance().pushToQueue(recordInfo);
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Check if request url match ignored rules
   * 检查请求url是否与忽略的规则匹配
   */
  isUrlInIgnoreList = (url = '') => {
    const { ignoreRules = [], reportUrl = '', trackUrl = '' } = this.$options;

    // If reportUrl is setted, alse add to ignoreRules
    if (reportUrl) {
      ignoreRules.push(reportUrl);
    }
    if (trackUrl) {
      ignoreRules.push(trackUrl);
    }
    return ignoreRules.some(urlItem => {
      if (typeof urlItem === 'string') {
        return replaceSlash(urlItem) === replaceSlash(url);
      } else {
        return urlItem.test(url);
      }
    });
  };
}

export default BaseMonitor;
