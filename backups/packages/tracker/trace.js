import BaseMonitor from '../base/baseMonitor';
import TraceQueue from '../api/traceQueue';
import { getCurrentTime, getNowFormatTime, getPageURL, formatUrlToStr } from '../utils/utils';

export default class Tracker extends BaseMonitor {
  constructor(options) {
    super(options);
  }

  /**
   * @description 上报
   */
  report(traceData = {}) {
    const pageUrl = getPageURL();
    /**
     * appId: 项目编号;  pointId: 点位编号; pointName: 点位名;  pointData: 点位数据
     */
    const { appId = '', pointId = '', pointName = '', pointData = {} } = traceData;
    const data = [
      {
        happenTime: getCurrentTime(),
        happenDate: getNowFormatTime(),
        pageUrl,
        simpleUrl: formatUrlToStr(pageUrl),
        pointId,
        pointName,
        appId,
        pointData,
      },
    ];
    TraceQueue.sendEscalation(data);
  }
}
