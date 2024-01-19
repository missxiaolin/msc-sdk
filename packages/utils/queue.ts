import { voidFun } from '../shared'

export default class Queue {
  requestQueue = []
  requestTimmer = undefined
  synRequestNum = 10
  synNum = 0
  retryNum = 1
  apiOtion = {
    delay: 5000
  }

  /**
   * 设置并发最大值
   * @param maxQueues 
   */
  setMaxQueues(maxQueues: number) {
    this.synRequestNum = maxQueues
  }

  /**
   * 消息队列push
   * @param fn 
   * @returns 
   */
  pushToQueue(fn: voidFun): void {
    {
      this.requestQueue.push(fn)
      return this.onReady(() => {
        this.requestTimmer = this.delay(
          () => {
            this.clear()
          },
          this.requestQueue[0] && !!this.requestQueue[0].logError && this.requestQueue[0].logError > 0 ? 3e3 : -1
        )
      })
    }
  }

  /**
   * 宏任务（检测是否有唯一对应值）
   * @param {*} fun
   */
  onReady(fun: voidFun) {
    // 检测是否有 openId 如果没有则延迟上报
    if (fun) {
      fun();
    }
  }

  /**
   * 执行队列
   * @param {*} fun
   * @param {*} e
   */
  delay(fun: voidFun, e: any) {
    if (!fun) return null;
    return e === -1 ? (fun(), null) : setTimeout(fun, e);
  }
  /**
   * 并发限制
   * @return {?}
   */
  async clear() {
    let e: any;
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
        try {
          await e()
          this.reduceSynNumFun()
        } catch (e) {
          this.reduceSynNumFun()
        }
    }
    // 执行完如果还有数据则继续执行（放到宏任务）
    !!this.requestQueue.length &&
      (this.requestTimmer = setTimeout(() => {
        this.clear();
      }, 50));
  }
  /**
   * 清空队列
   * @return {?}
   */
  clearAll(): this {
    this.requestQueue = [];
    this.requestTimmer = null;
    this.synNum = 0;
    return this;
  }
  /**
   * 并发数减一
   * @return {?}
   */
  reduceSynNumFun(): this {
    this.synNum--;
    return this;
  }
}
