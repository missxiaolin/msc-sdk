import API from './api.js';
import { isFunction, isObject, isArray } from '../utils/validate.js';
import { debounce, b64EncodeUnicode, uaParser } from '../utils/utils.js';
const Report = new API();
/**
 * 消息队列
 */
const TarceQueue = {
  /**
   * 是否停止fire
   */
  isStop: true,

  /**
   * 待处理消息列表
   */
  queues: [],

  /**
   * 全局配置
   */
  apiOtion: {
    delay: 5000,
  },
  /**
   * 获取设备信息
   */
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
    // 初始化获取缓存信息
    TarceQueue.getStorageQueses();
  },
  /**
   * 获取缓存内 上报信息
   */
  getStorageQueses() {
    let storageList = window.localStorage.getItem('webTraceQueues');
    if (storageList) {
      storageList = JSON.parse(storageList);
      this.queues = this.queues.concat(storageList);
    }
    window.localStorage.removeItem('webTraceQueues');
  },
  /**
   * 添加消息
   * @param {*} $options 配置
   * @param {*} data 上报数据
   */
  add(data) {
    if (isObject(data)) {
      this.queues.push(data);
    } else if (isArray(data)) {
      this.queues = [...this.queues, ...data];
    }
    // window.localStorage.setItem('webTraceQueues')
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
    return userId || guid();
  },
  /**
   * 窗口隐藏 或 关闭
   */
  windowHidden() {
    // 无数据则不存储
    // TarceQueue.fire(true)
    if (!this.queues.length) return;
    const list = JSON.stringify(this.queues);
    window.localStorage.setItem('webTraceQueues', list);
  },

  /**
   * 统一上报
   */
  fire() {
    const { delay } = this.apiOtion;
    const implementSend = () => {
      if (!this.queues || this.queues.length === 0) {
        this.isStop = true;
        return;
      }
      const { delay } = this.apiOtion;
      TarceQueue.sendEscalation();
      setTimeout(() => {
        implementSend();
      }, delay);
    };
    const sendFire = debounce(implementSend, delay);
    if (this.isStop) {
      this.isStop = false;
      // 上报前获取缓存内信息
      TarceQueue.getStorageQueses();
      sendFire();
    }
  },

  sendEscalation(activelyReportData = []) {
    let deviceInfo = TarceQueue.deviceInfo; // 设备信息
    // 执行自定义字段获取，不做持久存储，防里面有 回调函数
    let customInfo = TarceQueue.getCustomInfo();
    const { maxQueues, trackUrl, beforeSend, reportType, uuId, monitorAppId, encryption } =
      this.apiOtion;
    let reportUrl = trackUrl;
    const queuesLen = this.queues.length;
    // 页面关闭前上传所有信息
    const maxNum = queuesLen >= maxQueues ? maxQueues : queuesLen;
    let lists = (activelyReportData.length && activelyReportData) || this.queues.splice(0, maxNum);
    // 补充 设备、自定义、区域等 信息
    const data = {
      lists,
      // 设备信息
      deviceInfo,
      // 自定义属性
      customInfo,
      // 设置监控项目 和 uuid
      appUid: {
        uuId: TarceQueue.getUserId(uuId),
        monitorAppId,
      },
    };
    // 上报文是否加密
    // reportType == 2 图片上报 默认加密
    const enCodeData = encryption || reportType == 2 ? b64EncodeUnicode(data) : data;
    Report.report({
      dataType: 2, // 埋点
      reportUrl,
      beforeSend,
      reportType,
      // 上报数据
      data: {
        data: enCodeData,
      },
    });
  },
};

export default TarceQueue;
