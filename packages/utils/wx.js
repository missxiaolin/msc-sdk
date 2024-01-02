/**
 * 获取当前url
 */
export function getPage() {
  return getCurrentPages()[getCurrentPages().length - 1].__route__;
}

/**
 * 获取设备
 * @returns
 */
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
