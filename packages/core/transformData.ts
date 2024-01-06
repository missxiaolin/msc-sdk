import { ReportDataType, ResourceErrorTarget } from '../types/index'

/**
 * 资源错误
 * @param errorEvent 
 * @returns 
 */
export function resourceTransform(errorEvent: ErrorEvent): ReportDataType {
  const target = errorEvent.target as ResourceErrorTarget
  return {
    errorMsg: `加载 ${target.localName} 资源错误`,
    url: target.src || target.href,
    startTime: errorEvent.timeStamp,
    // @ts-ignore
    html: target.outerHTML || '',
    // @ts-ignore
    resourceType: target.tagName || '',
    // @ts-ignore
    paths: errorEvent.path ? errorEvent.path.map((item) => item.tagName).filter(Boolean) : ''
  }
}
