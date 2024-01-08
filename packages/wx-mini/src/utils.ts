export async function getWxMiniNetWrokType(): Promise<string> {
  return new Promise((resolve) => {
    wx.getNetworkType({
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

export function getSystemInfoSync() {
  const res = wx.getSystemInfoSync()
  const os = res.system.split(' ')
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
      name: os && os.length && os[0] ? os[0] : '',
      version: os && os.length && os[1] ? os[1] : ''
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
  const res = wx.getSystemInfoSync()
  let obj = {
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
 * 组装device
 */
export async function getWxMiniDeviceInfo(): Promise<any> {
  const netType = await getWxMiniNetWrokType()
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

/**
 * 返回包含id、data字符串的标签
 * @param e wx BaseEvent
 */
export function targetAsString(e: WechatMiniprogram.BaseEvent): string {
  const id = e.currentTarget?.id ? ` id="${e.currentTarget?.id}"` : ''
  const dataSets = Object.keys(e.currentTarget.dataset).map((key) => {
    return `data-${key}=${e.currentTarget.dataset[key]}`
  })
  return `<element ${id} ${dataSets.join(' ')}/>`
}

/**
 * 格式化性能数据
 * @param {*} data
 * @returns
 */
export function getWxPerformance(data) {
  const RF = []
  const FP = {
    name: 'first-contentful-paint',
    startTime: '',
    RF: []
  }
  const FCP = {
    name: 'first-contentful-paint',
    startTime: '',
    RF: []
  }
  const LCP = {
    name: 'first-contentful-paint',
    startTime: '',
    RF: []
  }
  const NT = {
    appLaunch: 0, // 小程序启动耗时。
    appLaunchStartTime: '',
    route: 0, // 路由耗时
    routeStartTime: '',
    firstRender: 0, // 页面首次渲染耗时
    firstRenderStartTime: '',
    script: 0, // 逻辑层 JS 代码注入耗时
    scriptStartTime: '',
    loadPackage: 0, // 代码包下载耗时。(entryType: loadPackage)
    loadPackageStartTime: ''
  }
  data.forEach((item) => {
    if (item.entryType == 'resource') {
      RF.push({
        ...item
      })
    } else if (item.name == 'firstPaint' && item.entryType == 'render') {
      FP.startTime = item.startTime
    } else if (item.name == 'firstContentfulPaint' && item.entryType == 'render') {
      FCP.startTime = item.startTime
    } else if (item.name == 'largestContentfulPaint' && item.entryType == 'render') {
      LCP.startTime = item.startTime
    } else if (item.name == 'appLaunch' && item.entryType == 'navigation') {
      NT.appLaunch = item.duration || 0
      NT.appLaunchStartTime = item.startTime || ''
    } else if (item.name == 'firstRender' && item.entryType == 'render') {
      NT.firstRender = item.duration || 0
      NT.firstRenderStartTime = item.startTime || 0
    } else if (item.name == 'evaluateScript' && item.entryType == 'script') {
      NT.script = item.duration || 0
      NT.scriptStartTime = item.startTime || ''
    } else if (item.name == 'downloadPackage' && item.entryType == 'loadPackage') {
      NT.loadPackage = item.duration || 0
      NT.loadPackageStartTime = item.startTime || ''
    } else if (item.name == 'route' && item.entryType == 'navigation') {
      NT.route = item.duration || 0
      NT.routeStartTime = item.startTime || ''
    } else {
      console.log(item)
    }
  })
  const result = {
    RF,
    FP,
    FCP,
    LCP,
    FMP: '',
    NT
  }
  return result
}
