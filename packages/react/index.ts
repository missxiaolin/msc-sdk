import { extractErrorStack, getNowFormatTime, getTimestamp, isError } from '../utils'
import { breadcrumb } from '../core/index'
import { BREADCRUMBTYPES, ERRORTYPES_CATEGORY, Severity } from '../shared'
import { ReportDataType } from '../types'

/**
 * 收集react ErrorBoundary中的错误对象
 * 需要用户手动在componentDidCatch中设置
 * @param ex ErrorBoundary中的componentDidCatch的一个参数error
 */
export function errorBoundaryReport(ex: any): void {
  if (!isError(ex)) {
    console.warn('传入的react error不是一个object Error')
    return
  }
  const error = extractErrorStack(ex, Severity.INFO) as ReportDataType
  error.type = ERRORTYPES_CATEGORY.JS_ERROR
  const data: ReportDataType = {
    subType: BREADCRUMBTYPES.REACT,
    errorMsg: `${error.name}: ${error.message}`,
    stackTraces: [],
    line: 0,
    col: 0,
    type: error.name || '',
    happenTime: getTimestamp(),
    happenDate: getNowFormatTime()
  }
  breadcrumb.push({
    level: Severity.ERROR,
    category: ERRORTYPES_CATEGORY.JS_ERROR,
    ...data
  })
}
