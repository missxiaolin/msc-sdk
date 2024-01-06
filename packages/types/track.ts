export interface DeviceInfo {
  deviceType: string // 设备类型
  OS: string // 操作系统
  browserInfo: string // 浏览器信息
  device: string // 设备类型
  deviceModel: number | string
  screenHeight: number | string // 屏幕高
  screenWidth: number | string // 屏幕宽
  language: string // 当前使用的语言-国家
  netWork: string | number | any // 联网类型
  fingerPrint: string // 浏览器指纹
  userAgent: string
}
