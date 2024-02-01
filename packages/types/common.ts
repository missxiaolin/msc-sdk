import { HTTPTYPE } from '../shared/index'

export interface MITOHttp {
  eventType?: string
  isError?: boolean
  type: HTTPTYPE
  traceId?: string
  method?: string
  url?: string
  status?: number
  reqData?: any
  statusText?: string
  sTime?: number
  eTime?: number
  elapsedTime?: number
  responseText?: any
  time?: number
  isSdkUrl?: boolean
  // for wx
  errMsg?: string
  timeout?: number
}

export interface MITOXMLHttpRequest extends XMLHttpRequest {
  [key: string]: any
  logData?: MITOHttp
}

export interface IAnyObject {
  [key: string]: any
}

export type TNumStrObj = number | string | object

export interface ResourceErrorTarget {
  src?: string
  href?: string
  localName?: string
}

export interface Callback {
  (...args: any[]): any;
}