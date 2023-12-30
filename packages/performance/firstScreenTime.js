import BaseMonitor from '../base/baseMonitor';
import { getCurrentTime, getNowFormatTime } from '../utils/utils';
// import { ErrorLevelEnum, CategoryEnum } from "../base/baseConfig";

export default class firstScreenTime extends BaseMonitor {
  constructor(options) {
    super(options);
    this.startTime = getCurrentTime();
    this.firstScreenTime = 0;
    this.calcFirstScreenTime = 'init';
    this.observer = null;
    this.observerData = [];

    /**
     * 异常情况下的处理
     */
    const unmountObserverListener = () => {
      if (this.calcFirstScreenTime === 'pending') {
        this.unmountObserver(0, true);
      }
      // 非IE浏览器
      if (!(window.ActiveXObject || 'ActiveXObject' in window)) {
        window.removeEventListener('beforeunload', unmountObserverListener);
      }
    };
    window.addEventListener('beforeunload', unmountObserverListener);
    // 初始化
    this.mountObserver();
  }

  mountObserver() {
    if (!window.MutationObserver) {
      // 不支持 MutationObserver 的话
      console.warn('MutationObserver 不支持，首屏时间无法被采集');
      return;
    }
    this.calcFirstScreenTime = 'pending';
    // 每次 dom 结构改变时，都会调用里面定义的函数
    const observer = new window.MutationObserver(() => {
      const time = getCurrentTime() - this.startTime; // 当前时间 - 性能开始计算时间

      const body = document.querySelector('body');
      let score = 0;

      if (body) {
        score = this.traverseEl(body, 1, false);
        this.observerData.push({ score, time });
      } else {
        this.observerData.push({ score: 0, time });
      }
    });

    // 设置观察目标，接受两个参数: target：观察目标，options：通过对象成员来设置观察选项
    // 设为 childList: true, subtree: true 表示用来监听 DOM 节点插入、删除和修改时
    observer.observe(document, { childList: true, subtree: true });

    this.observer = observer;

    if (document.readyState === 'complete') {
      // MutationObserver监听的最大时间，10秒，超过 10 秒将强制结束
      this.unmountObserver(10000);
    } else {
      window.addEventListener(
        'load',
        () => {
          this.unmountObserver(10000);
        },
        false
      );
    }
  }

  /**
   * 深度遍历 DOM 树
   * 算法分析
   * 首次调用为 traverseEl(body, 1, false);
   * @param element 节点
   * @param layer 层节点编号，从上往下，依次表示层数
   * @param identify 表示每个层次得分是否为 0
   * @returns {number} 当前DOM变化得分
   */
  traverseEl(element, layer, identify) {
    // 窗口可视高度
    const height = window.innerHeight || 0;
    let score = 0;
    const tagName = element.tagName;

    if (tagName !== 'SCRIPT' && tagName !== 'STYLE' && tagName !== 'META' && tagName !== 'HEAD') {
      const len = element.children ? element.children.length : 0;

      if (len > 0) {
        for (let children = element.children, i = len - 1; i >= 0; i--) {
          score += this.traverseEl(children[i], layer + 1, score > 0);
        }
      }

      // 如果元素高度超出屏幕可视高度直接返回 0 分
      if (score <= 0 && !identify) {
        if (element.getBoundingClientRect && element.getBoundingClientRect().top >= height) {
          return 0;
        }
      }
      score += 1 + 0.5 * layer;
    }
    return score;
  }

  /**
   * 去掉 DOM 被删除情况的监听
   * @param observerData
   * @returns {*}
   */
  removeSmallScore(observerData) {
    for (let i = 1; i < observerData.length; i++) {
      if (observerData[i].score < observerData[i - 1].score) {
        observerData.splice(i, 1);
        return this.removeSmallScore(observerData);
      }
    }
    return observerData;
  }

  /**
   * 取 DOM变化最大 时间点为首屏时间
   */
  getfirstScreenTime() {
    this.observerData = this.removeSmallScore(this.observerData);

    let data = null;
    const { observerData } = this;

    for (let i = 1; i < observerData.length; i++) {
      if (observerData[i].time >= observerData[i - 1].time) {
        const scoreDiffer = observerData[i].score - observerData[i - 1].score;
        if (!data || data.rate <= scoreDiffer) {
          data = { time: observerData[i].time, rate: scoreDiffer };
        }
      }
    }

    if (data && data.time > 0 && data.time < 3600000) {
      // 首屏时间
      this.firstScreenTime = data.time;
    }

  }

  /**
   * 销毁 MutationObserver
   */

  /**
   * @param delayTime 延迟的时间
   * @param immediately 指是否立即卸载
   * @returns {number}
   */
  unmountObserver(delayTime, immediately) {
    if (this.observer) {
      if (immediately || this.compare(delayTime)) {
        // MutationObserver停止观察变动
        this.observer.disconnect();
        this.observer = null;

        this.getfirstScreenTime();

        this.calcFirstScreenTime = 'finished';
      } else {
        setTimeout(() => {
          this.unmountObserver(delayTime);
        }, 500);
      }
    }
  }

  // * 如果超过延迟时间 delayTime（默认 10 秒），则返回 true
  // * _time - time > 2 * OBSERVE_TIME; 表示当前时间与最后计算得分的时间相比超过了 1000 毫秒，则说明页面 DOM 不再变化，返回 true
  compare(delayTime) {
    // 当前所开销的时间
    const _time = Date.now() - this.startTime;
    // 取最后一个元素时间 time
    const { observerData } = this;
    const time =
      (observerData && observerData.length && observerData[observerData.length - 1].time) || 0;
    return _time > delayTime || _time - time > 2 * 500;
  }
}
