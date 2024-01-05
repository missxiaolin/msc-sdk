export interface TransportDataType {
  appUid: {
    monitorAppId: string
    uuId: string
  }
  deviceInfo?: any
  lists: {
    [key: string]: any
  }[]
}

export interface FinalReportType {
  [key: string]: any
}

export interface ReportDataType {
  [key: string]: any
  errorMsg?: string,
  url?: string,
  startTime?: number,
  html?: string,
  resourceType?: string,
  paths?: string
}