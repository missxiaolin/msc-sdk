export interface DeviceInfo {
  ua?: string
  browser: {
    name?: string
    version?: string
  }
  cpu: {}
  device: {
    type: string
    model: string
    vendor: string
  }
  engine: {
    name: string
    version: string
  }
  os: {
    name: string
    version: string
  }
  fingerPrint: string
}
