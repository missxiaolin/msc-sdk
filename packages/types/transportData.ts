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
