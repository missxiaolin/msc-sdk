import { ERRORTYPES_CATEGORY, Severity } from '../shared/index'

export interface BreadcrumbPushData {
  [key: string]: any
  category: ERRORTYPES_CATEGORY
  level: Severity
}
