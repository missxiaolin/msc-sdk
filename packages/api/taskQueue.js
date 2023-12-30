import API from './api.js';
import { isFunction, isObject, isArray } from '../utils/validate.js';
import { debounce, b64EncodeUnicode, guid, uaParser } from '../utils/utils.js';
const Report = new API();

const Queue = {
  requestQueue: [],
  requestTimmer: undefined,
  synRequestNum: 10,
  synNum: 0,
  retryNum: 1,
  apiOtion: {
    delay: 5000,
  },
  deviceInfo: uaParser(),

  /**
   * 获取扩展信息
   */
  getCustomInfo() {
    try {
      let ret = {};
      let { customInfo } = this.apiOtion;
      let dynamicParams = '';
      if (isFunction(customInfo?.getDynamic)) {
        dynamicParams = customInfo.getDynamic(); // 获取动态参数
      }
      // 判断动态方法返回的参数是否是对象
      if (isObject(dynamicParams)) {
        customInfo = { ...customInfo, ...dynamicParams };
      }
      // 遍历扩展信息，排除动态方法
      for (let key in customInfo) {
        if (!isFunction(customInfo[key])) {
          // 排除获取动态方法
          ret[key] = customInfo[key];
        }
      }
      return ret;
    } catch (error) {
      console.log('call getCustomInfo error', error);
      return {};
    }
  },
  /**
   * 初始化
   */
  init(options = {}) {
    this.apiOtion = { ...this.apiOtion, ...options };
    this.synRequestNum = options.maxQueues || 10
  },
  /**
   * @description 兼容首次无法获取用户信息
   * @param {*} uuId
   * @returns
   */
  getUserId(uuId) {
    let userId = uuId;
    if (isFunction(uuId)) {
      userId = uuId();
    }
    // return userId || guid();
    return userId || '';
  },
  /**
   * 同步队列 （传入对象必须要有logType，logError）
   * @param {*} log 队列日志
   */
  pushToQueue(log) {
    {
      // 简单先同步放入数组中
      this.requestQueue.push(log);
      if (isArray(log)) {
        log.forEach(v => {
          this.requestQueue.push(v);
        });
      }
      return this.onReady(() => {
        this.requestTimmer = this.delay(
          () => {
            this.clear();
          },
          this.requestQueue[0] &&
            !!this.requestQueue[0].logError &&
            this.requestQueue[0].logError > 0
            ? 3e3
            : -1
        );
      });
    }
  },
  /**
   * 宏任务（检测是否有唯一对应值）
   * @param {*} fun
   */
  onReady(fun) {
    // 检测是否有 openId 如果没有则延迟上报
    if (fun) {
      fun();
    }
  },
  /**
   * 执行队列
   * @param {*} fun
   * @param {*} e
   */
  delay(fun, e) {
    if (!fun) return null;
    return e === -1 ? (fun(), null) : setTimeout(fun, e || 0);
  },
  /**
   * 并发限制
   * @return {?}
   */
  clear() {
    var e;
    if (this.synNum > this.synRequestNum) {
      return (
        clearTimeout(this.requestTimmer),
        (this.requestTimmer = setTimeout(() => {
          this.clear();
        }, 50))
      );
    }
    for (
      clearTimeout(this.requestTimmer), this.requestTimmer = null;
      this.synNum < this.synRequestNum && (e = this.requestQueue.pop());
      this.synNum++
    ) {
      this.handleLog(e);
    }
    // 执行完如果还有数据则继续执行（放到宏任务）
    !!this.requestQueue.length &&
      (this.requestTimmer = setTimeout(() => {
        this.clear();
      }, 50));
  },
  /**
   * 清空队列
   * @return {?}
   */
  clearAll() {
    this.requestQueue = [];
    this.requestTimmer = null;
    this.synNum = 0;
  },
  /**
   * 并发数减一
   * @return {?}
   */
  reduceSynNumFun() {
    Queue.synNum--;
    return this;
  },
  /**
   * 上报
   * @param {*} e logType判断上传接口是哪种类型 pv：上报pv 逻辑 mv：上报mv逻辑 logError：0 代码重新上报次数0次，用int后续方便扩展
   */
  handleLog(e) {
    // 深拷贝避免影响其他数据
    let log = JSON.parse(JSON.stringify(e));
    try {
      let param = {
        viewData: log,
      };
      this._fetch(param).then(_ => {
        this.reduceSynNumFun();
      });
    } catch (err) {
      this.reduceSynNumFun();
    }
  },
  _fetch(data = {}) {
    const { uuId, monitorAppId, encryption, reportType, reportUrl, beforeSend } = this.apiOtion;
    let deviceInfo = this.deviceInfo; // 设备信息
    // 执行自定义字段获取，不做持久存储，防里面有 回调函数
    let customInfo = this.getCustomInfo();
    // 补充 设备、自定义、区域等 信息
    const param = {
      lists: isArray(data.viewData) ? [data.viewData[0]] : [data.viewData],
      // 设备信息
      deviceInfo,
      // 自定义属性
      customInfo,
      // 设置监控项目 和 uuid
      appUid: {
        uuId: this.getUserId(uuId),
        monitorAppId,
      },
    };
    // 上报文是否加密
    // reportType == 2 图片上报 默认加密
    const enCodeData = encryption || reportType == 2 ? b64EncodeUnicode(param) : param;
    Report.report({
      dataType: 1, // 监控数据
      reportUrl,
      beforeSend,
      reportType,
      // 上报数据
      data: {
        data: enCodeData,
      },
    });
  },

  /**
   * 数组形式的
   * @param {*} activelyReportData
   * @returns
   */
  sendEscalation(activelyReportData = []) {
    {
      // 简单先同步放入数组中
      this.requestQueue.push(activelyReportData);
      return this.onReady(() => {
        this.requestTimmer = this.delay(
          () => {
            this.clear();
          },
          this.requestQueue[0] &&
            !!this.requestQueue[0].logError &&
            this.requestQueue[0].logError > 0
            ? 3e3
            : -1
        );
      });
    }
  },
};

export default Queue;
