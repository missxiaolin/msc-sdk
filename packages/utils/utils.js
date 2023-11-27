// 获取当前时间戳
export const getCurrentTime = () => new Date().getTime();

/**
 * 防抖
 */
export const debounce = (fun, delay = 300) =>
  function (args) {
    let that = this;
    let _args = args;
    clearTimeout(fun.id);
    fun.id = setTimeout(() => {
      fun.call(that, _args);
    }, delay);
  };

/**
 * str 加密
 */
export const b64EncodeUnicode = data => {
  if (!isString(data)) {
    data = JSON.stringify(data);
  }
  try {
    return btoa(
      encodeURIComponent(data).replace(/%([0-9A-F]{2})/g, (match, p1) =>
        String.fromCharCode('0x' + p1)
      )
    );
  } catch (e) {
    data;
  }
};

/**
 *
 * @returns
 */

export const guid = () => {
  let uuid = localStorage.getItem('webUuid');
  if (uuid) return uuid;
  let uuidStr = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    let r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
  localStorage.setItem('webUuid', uuidStr);
  return uuidStr;
};

/**
 * @description: 格式化设备信息
 * @return {*}
 */
export const uaParser = () => {
  const {
    ua,
    fingerPrint,
    browser: { name: browserName, version: browserVersion },
    engine: { name: engineName },
    device: { type: deviceType, model: deviceModel, vendor: deviceVendor },
    os: { name: osName, version: osVersion },
  } = UAParser.getResult();
  const {
    screen: { height: screenHeight = '', width: screenWidth = '' },
    navigator: {
      language = [],
      connection: { effectiveType = '' },
    },
  } = window;
  let uas = {
    deviceType: deviceType || 'PC', // 设备类型
    OS: `${osName} ${osVersion}`, // 操作系统
    browserInfo: `${browserName} ${browserVersion}`, // 浏览器信息
    device: deviceType ? `${deviceVendor}` : browserName, // 设备类型
    deviceModel: deviceType ? deviceModel : engineName,
    screenHeight, // 屏幕高
    screenWidth, // 屏幕宽
    language, // 当前使用的语言-国家
    netWork: effectiveType, // 联网类型
    fingerPrint, // 浏览器指纹
    userAgent: ua,
  };

  return uas;
};
