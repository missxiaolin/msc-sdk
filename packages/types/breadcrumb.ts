import { ERRORTYPES, Severity } from '../shared/index'

export interface BreadcrumbPushData {
  [key: string]: any
  category: ERRORTYPES
  level: Severity
}
