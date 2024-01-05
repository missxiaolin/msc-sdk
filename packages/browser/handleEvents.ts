import { BREADCRUMBTYPES, Severity, ERRORTYPES } from '../shared/index'
import { MITOHttp } from '../types/index'
import { getNowFormatTime } from '../utils/index'
import { breadcrumb } from '../core'

const HandleEvents = {
  // xhr 请求重写
  handleHttp(data: MITOHttp, type: BREADCRUMBTYPES): void {
    const status = data.status // 200 or 500
    const isSuceess = status >= 200 && status < 300
    const metrics = {
      type,
      method: data.method,
      level: isSuceess ? Severity.INFO : Severity.ERROR,
      category: ERRORTYPES.HTTP_LOG,
      status,
      eventType: data.eventType, // load error abort
      pathName: data.url, // 请求路径
      statusText: data.statusText, // 状态码
      duration: data.elapsedTime, // 持续时间
      timeout: data.timeout,
      responseText: data.responseText, // 响应体
      requestText: data.reqData || '',
      happenTime: data.eTime,
      happenDate: getNowFormatTime()
    }
    breadcrumb.push(metrics)
  }
}

export { HandleEvents }
