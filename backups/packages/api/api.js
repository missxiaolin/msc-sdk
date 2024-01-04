import { getCurrentTime } from '../utils/utils';
import { isWxMiniEnv } from '../utils/global';

class API {
  constructor() {
    // this.reportUrl = reportUrl;
  }

  /**
   * 上报信息 （默认方式）
   * isFetch ：是否优先通过fetch上报
   */
  report(sendData) {
    const { reportUrl, data, beforeSend, reportType, dataType } = sendData;
    if (!this.checkUrl(reportUrl)) {
      console.error('上报信息url地址格式不正确,reportUrl=', reportUrl);
      return;
    }
    if (typeof beforeSend === 'function') {
      data.data = beforeSend(data.data, dataType);
    }
    this.sendInfo({
      reportUrl,
      reportType,
      data,
    });
  }

  /**
   * 发送消息
   */
  sendInfo(data) {
    const { reportType = 1 } = data;
    try {
      switch (reportType) {
        case 1:
          this.reportByFetch(data);
          break;
        case 2:
          this.reportByImg(data);
          break;
        case 3:
          this.reportByNavigator(data);
          break;

        default:
          this.reportByFetch(data);
          break;
      }
    } catch (error) {
      console.log('fetch请求异常', error);
    }
  }

  /**
   * 通过img方式上报信息
   */
  reportByImg(data) {
    try {
      const datas = data.data;
      const img = new Image();
      img.src = `${data.reportUrl}/static/gif.gif?v=${getCurrentTime()}&data=${datas.data}`;
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * 通过 fetch 方式上报信息
   */
  reportByFetch(data, retryCount = 0) {
    if (retryCount >= 2) return;
    let self = this;
    const datas = data.data;

    if (isWxMiniEnv) {
      wx.request({
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'post',
        url: data.reportUrl,
        data: datas,
        fail: error => {
          console.log('Request failed', error);
          self.reportByFetch(data, retryCount++);
        },
      });
    } else {
      let dataStr = JSON.stringify(datas);
      fetch(data.reportUrl, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'post',
        body: dataStr,
        // mode: 'same-origin', // 告诉浏览器是同源，同源后浏览器不会进行预检请求
        // keepalive: true
      })
        .then(() => {})
        .catch(error => {
          console.log('Request failed', error);
          self.reportByFetch(data, retryCount++);
        });
    }
  }

  /**
   * sendBeacon上报
   */
  reportByNavigator(data) {
    let dataStr = JSON.stringify(data.data);
    navigator.sendBeacon && navigator.sendBeacon(data.reportUrl, dataStr);
  }

  /*
   *格式化参数
   */
  formatParams(data) {
    let arr = [];
    for (let name in data) {
      arr.push(encodeURIComponent(name) + '=' + encodeURIComponent(data[name]));
    }
    return arr.join('&');
  }

  /**
   * 检测URL
   */
  checkUrl(reportUrl) {
    if (!reportUrl) {
      return false;
    }
    let urlRule = /^[hH][tT][tT][pP]([sS]?):\/\//;
    return urlRule.test(reportUrl);
  }
}

export default API;
