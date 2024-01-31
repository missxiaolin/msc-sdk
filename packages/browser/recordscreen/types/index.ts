import { Options } from '../../../core/index'

// sdk插件核心core
export interface SdkBase {
  reportCallback: any // 数据上报
  breadcrumb?: any // 用户行为
  options: Options // 公共配置
  notify?: any // 发布消息
}

export abstract class BasePlugin {
  public type: string // 插件类型
  constructor(type: string) {
    this.type = type
  }
  abstract bindOptions(options: object): void // 校验参数
  abstract core(sdkBase: SdkBase): void // 核心方法
  abstract transform(data: any): void // 数据转化
}

// 录屏插件参数
export interface RecordScreenOption {
  recordScreenTypeList: string[]
  recordScreentime: number
}
