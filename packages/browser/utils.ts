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

/**
 * @param entry
 * @returns
 */
export function isCache(entry) {
  return entry.transferSize === 0 || (entry.transferSize !== 0 && entry.encodedBodySize === 0)
}

/**
 * @description : 原生获取 cookie
 */
export const getCookie = (name: string) => {
  let resultVal = ''
  if (!name) return resultVal
  const splitName: any[] = name.split('.')
  const cookieKey = splitName.splice(0, 1)[0]
  // RegExp 和 match
  let arr: any = [];
  const reg = new RegExp('(^| )' + cookieKey + '=([^;]*)(;|$)')
  arr = document.cookie.match(reg)
  if (arr) {
    // 编码转换
    const cKey = decodeURIComponent(arr[2])
    if (splitName.length) {
      const ObjcKey = JSON.parse(cKey)
      let forVal = ''
      for (let i = 0, len = splitName.length; i < len; i++) {
        if (!i) {
          forVal = ObjcKey[splitName[i]]
        } else {
          forVal = forVal[splitName[i]]
        }
      }
      return (resultVal = forVal)
    }
    resultVal = cKey
  } else {
    return resultVal
  }
  return resultVal
}