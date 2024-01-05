import { HTTPTYPE } from '../shared/index'

export interface MITOHttp {
  type: HTTPTYPE
  traceId?: string
  method?: string
  url?: string
  status?: number
  reqData?: any
  // statusText?: string
  sTime?: number
  elapsedTime?: number
  responseText?: any
  time?: number
  isSdkUrl?: boolean
  // for wx
  errMsg?: string
}

export interface MITOXMLHttpRequest extends XMLHttpRequest {
  [key: string]: any
  logData?: MITOHttp
}

export interface IAnyObject {
  [key: string]: any
}

export type TNumStrObj = number | string | object