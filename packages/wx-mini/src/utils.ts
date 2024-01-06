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
	const res = wx.getSystemInfoSync();
  const os = res.system.split(' ');
  let obj = {
    ua: '',
    browser: {
      name: `${res.model}`,
      version: res.version,
    },
    cpu: {},
    device: {
      type: 'mobile',
      model: `${res.brand}`,
      vendor: ``,
    },
    engine: {
      name: '',
      version: '',
    },
    os: {
      name: os && os.length && os[0] ? os[0] : '',
      version: os && os.length && os[1] ? os[1] : '',
    },
    fingerPrint: '',
  };

  return obj;
}

/**
 * 获取手机额外信息
 * @returns
 */
export function getPhoneInfo() {
  const res = wx.getSystemInfoSync();
  let obj = {
    screen: {
      height: res.screenWidth,
      width: res.screenHeight,
    },
    navigator: {
      language: res.language,
      connection: { effectiveType: '' }, // 网络类型
    },
  };
  return obj;
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
    os: { name: osName, version: osVersion },
  } = getSystemInfoSync();
  const {
    screen: { height: screenHeight = '', width: screenWidth = '' },
    navigator: {
      language = [],
    },
	} = getPhoneInfo();
  let uas = {
    deviceType: deviceType || 'PC', // 设备类型
    OS: `${osName} ${osVersion}`, // 操作系统
    browserInfo: `${browserName} ${browserVersion}`, // 浏览器信息
    device:
      deviceType && deviceVendor ? `${deviceVendor}` : `${browserName}` ? `${browserName}` : '', // 设备类型
    deviceModel: deviceType ? deviceModel : engineName,
    screenHeight, // 屏幕高
    screenWidth, // 屏幕宽
    language, // 当前使用的语言-国家
    netWork: netType, // 联网类型
    fingerPrint, // 浏览器指纹
    userAgent: ua,
  };

  return uas;
}