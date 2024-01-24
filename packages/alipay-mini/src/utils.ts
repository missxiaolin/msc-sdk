import { variableTypeDetection } from '../../utils/is'

/**
 * 获取支付宝用户
 * @param key
 * @returns
 */
export function getUser(key: string) {
  return my.getStorageSync({
    key: key
  }).data
}

/**
 * 给url添加query
 * @param url
 * @param query
 */
export function setUrlQuery(url: string, query: object) {
  const queryArr = []
  Object.keys(query).forEach((k) => {
    queryArr.push(`${k}=*`)
  })
  if (url.indexOf('?') !== -1) {
    url = `${url}&${queryArr.join('&')}`
  } else {
    url = `${url}?${queryArr.join('&')}`
  }
  return url
}

/**
 * 后退时需要计算当前页面地址
 * @param delta 返回的页面数，如果 delta 大于现有页面数，则返回到首页
 */
export function getNavigateBackTargetUrl(delta: number | undefined) {
  if (!variableTypeDetection.isFunction(getCurrentPages)) {
    return ''
  }
  const pages = getCurrentPages() // 在App里调用该方法，页面还没有生成，长度为0
  if (!pages.length) {
    return 'App'
  }
  delta = delta || 1
  const toPage = pages[pages.length - delta]
  return setUrlQuery(toPage.route, toPage.options)
}

/**
 * 获取wx当前route的方法
 * 必须是在进入Page或Component构造函数内部才能够获取到currentPages
 * 否则都是在注册Page和Component时执行的代码，此时url默认返回'App'
 */
export function getCurrentRoute() {
  if (!variableTypeDetection.isFunction(getCurrentPages)) {
    return ''
  }
  const pages = getCurrentPages() // 在App里调用该方法，页面还没有生成，长度为0
  if (!pages.length) {
    return 'App'
  }
  const currentPage = pages.pop()
  return setUrlQuery(currentPage.route, currentPage.options)
}

/**
 * 获取网络类型
 * @returns 
 */
export async function getAliMiniNetWrokType(): Promise<string> {
  return new Promise((resolve) => {
    my.getNetworkType({
      success(res) {
        resolve(res.networkType)
      },
      fail(err) {
        console.error(`获取微信小程序网络类型失败:${err}`)
        resolve('getNetWrokType failed')
      }
    })
  })
}

/**
 * 获取设备信息
 * @returns 
 */
export function getSystemInfoSync() {
  const res = my.getSystemInfoSync()
  const obj = {
    ua: '',
    browser: {
      name: `${res.model}`,
      version: res.version
    },
    cpu: {},
    device: {
      type: 'mobile',
      model: `${res.brand}`,
      vendor: ``
    },
    engine: {
      name: '',
      version: ''
    },
    os: {
      name: res.system,
      version: res.platform
    },
    fingerPrint: ''
  }

  return obj
}

/**
 * 获取手机额外信息
 * @returns
 */
export function getPhoneInfo() {
  const res = my.getSystemInfoSync()
  const obj = {
    screen: {
      height: res.screenWidth,
      width: res.screenHeight
    },
    navigator: {
      language: res.language,
      connection: { effectiveType: '' } // 网络类型
    }
  }
  return obj
}

/**
 * @returns 
 */
export async function getWxMiniDeviceInfo(): Promise<any> {
  const netType = await getAliMiniNetWrokType()
  const {
    ua,
    fingerPrint,
    browser: { name: browserName, version: browserVersion },
    engine: { name: engineName },
    device: { type: deviceType, model: deviceModel, vendor: deviceVendor },
    os: { name: osName, version: osVersion }
  } = getSystemInfoSync()
  const {
    screen: { height: screenHeight = '', width: screenWidth = '' },
    navigator: { language = [] }
  } = getPhoneInfo()
  const uas = {
    deviceType: deviceType || 'PC', // 设备类型
    OS: `${osName} ${osVersion}`, // 操作系统
    browserInfo: `${browserName} ${browserVersion}`, // 浏览器信息
    device: deviceType && deviceVendor ? `${deviceVendor}` : `${browserName}` ? `${browserName}` : '', // 设备类型
    deviceModel: deviceType ? deviceModel : engineName,
    screenHeight, // 屏幕高
    screenWidth, // 屏幕宽
    language, // 当前使用的语言-国家
    netWork: netType, // 联网类型
    fingerPrint, // 浏览器指纹
    userAgent: ua
  }

  return uas
}