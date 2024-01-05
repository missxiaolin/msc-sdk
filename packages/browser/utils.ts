// @ts-ignore
import UAParser from './ua-parser'

export const uaParser = () => {
  const {
    ua,
    fingerPrint,
    browser: { name: browserName, version: browserVersion },
    engine: { name: engineName },
    device: { type: deviceType, model: deviceModel, vendor: deviceVendor },
    os: { name: osName, version: osVersion }
  } = new UAParser().getResult()
  const {
    screen: { height: screenHeight = '', width: screenWidth = '' },
    navigator: {
      language = [],
      // @ts-ignore
      connection: { effectiveType = '' }
    }
  } = window
  const uas = {
    deviceType: deviceType || 'PC', // 设备类型
    OS: `${osName} ${osVersion}`, // 操作系统
    browserInfo: `${browserName} ${browserVersion}`, // 浏览器信息
    device: deviceType && deviceVendor ? `${deviceVendor}` : `${browserName}` ? `${browserName}` : '', // 设备类型
    deviceModel: deviceType ? deviceModel : engineName,
    screenHeight, // 屏幕高
    screenWidth, // 屏幕宽
    language, // 当前使用的语言-国家
    netWork: effectiveType, // 联网类型
    fingerPrint, // 浏览器指纹
    userAgent: ua
  }

  return uas
}
